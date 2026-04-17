import { User, Role, Permission, RefreshToken, sequelize } from '../../config/associations.js';
import { hashPassword, comparePassword } from '../../shared/utils/passwords.js';
import { signAccess, signRefresh, sha256, verifyRefresh, tokenExpiry } from '../../shared/utils/jwt.js';
import ApiError from '../../shared/utils/ApiError.js';
import { reportError, logSecurityAlert } from '../../shared/utils/monitoring.js';

/**
 * AUTH SERVICE
 * Handles identity verification, session management, and RBAC orchestration.
 * Implements token rotation and strict revocation policies.
 */

/* -------------------------------------------------------------------------- */
/* Internal Helpers                             */
/* -------------------------------------------------------------------------- */

async function collectPermissions(user) {
  try {
    if (!user || !user.roles) return [];
    // Collect role-based permissions
    const rolePermissions = await Permission.findAll({
      include: [{
        association: 'roles',
        where: { id: user.roles.map(r => r.id) },
        attributes: [],
        through: { attributes: [] },
      }],
    });

    // Collect user-specific permissions
    const userPermissions = await Permission.findAll({
      include: [{
        association: 'users',
        where: { id: user.id },
        attributes: [],
        through: { attributes: [] },
      }],
    });

    // Return unique set of objects with key + name
    const combined = [
      ...rolePermissions.map(p => ({ key: p.key, name: p.name })),
      ...userPermissions.map(p => ({ key: p.key, name: p.name })),
    ];

    // Deduplicate by key
    const unique = [];
    const seen = new Set();

    for (const perm of combined) {
      if (!seen.has(perm.key)) {
        seen.add(perm.key);
        unique.push(perm);
      }
    }

    return unique;
  } catch (err) {
    reportError(err, { service: 'AuthService', operation: 'collectPermissions', userId: user.id });
    return []; // Return empty permissions rather than crashing the login
  }
  

  
}

function formatUser(user, permissions = []) {
  return {
    id: user.id,
    fName: user.fName,
    lName: user.lName,
    email: user.email,
    fullName:user.fullName,
    phone: user.phone,
    designation:user.designation,
    roles: user.roles.map(r => r.name),
    permissions,
    isActive: user.active,
    lastLogin: user.last_login,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
/* -------------------------------------------------------------------------- */
/* Auth Services                                 */
/* -------------------------------------------------------------------------- */

/**
 * Validates credentials and establishes a secure session
 */

export async function login({ email, password, userAgent, ip }) {
  try {
    
    if (!email || !password) throw new ApiError(400, 'Missing credentials');
    //normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      where: { email:normalizedEmail, active: true },
      include: [{ model: Role, as: 'roles' }],
    });
    //SECURITY: Use generic error for user enumeration protection
    const dummyHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8j6Y5l9x2G3v7Z2b5Jp7rJc9l8u8eK'; // bcrypt dummy

    const passwordMatch = await comparePassword(
      password,
      user?.passwordHash || dummyHash
    );

    const isInvalidLogin = !user || !passwordMatch;

    if (isInvalidLogin) {
      logSecurityAlert('Failed login attempt', {
        email: normalizedEmail,
        ip,
        userAgent,
        reason: !user ? 'USER_NOT_FOUND' : 'INVALID_PASSWORD'
      });
      throw new ApiError(401, 'Invalid email or password');
    }

    const permissions = await collectPermissions(user);
    const accessToken = signAccess({
      id: user.id,
      email: user.email,
      roles: user.roles.map(r => r.name),
      permissions,
    });
    //I used sequelize transaction here to avoid the scenario if token creation fails → user is logged in but no refresh token stored
    return await sequelize.transaction(async (t) => {
      const refreshToken = signRefresh({ id: user.id });
      const exp = tokenExpiry(refreshToken);

      await RefreshToken.create({
        userId: user.id,
        token: refreshToken,
        tokenHash: sha256(refreshToken),
        expiresAt: exp,
        revokedAt: null,
        userAgent,
        ipAddress: ip,
      }, { transaction: t });

      user.lastLogin = new Date();
      await user.save({ transaction: t });

      return {
        user: formatUser(user, permissions),
        accessToken,
        refreshToken
      };
    });

  }catch (err) {
    if (!(err instanceof ApiError)) {
      reportError(err, { service: 'AuthService', operation: 'login', email });
    }
    throw err;
  }
 
}

/**
 * Rotates Refresh Tokens to prevent replay attacks
 */
export async function refreshToken(oldRefreshToken, userAgent, ip) {
  try {
    if (!oldRefreshToken) throw new ApiError(400, 'Missing refresh token');
    let payload;
    try { 
        payload = verifyRefresh(oldRefreshToken); 
    } catch (e) { 
        throw new ApiError(401, 'Session expired or invalid'); 
    }

    const storedToken = await RefreshToken.findOne({
      where: {
        userId: payload.id,
        tokenHash: sha256(oldRefreshToken),
        revokedAt: null, // only active tokens
      },
    });
    if (!storedToken) {
      logSecurityAlert('Possible Refresh Token Reuse Attack', { userId: payload.id, ip });
      throw new ApiError(401, 'Session no longer active');
    }
    //Token Rotation: Revoke the old one immediately
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await User.findByPk(payload.id, { include: [{ model: Role, as: 'roles' }] });
    if (!user || !user.active) throw new ApiError(404, 'User account is inactive or not found');

    const permissions = await collectPermissions(user);
    const accessToken = signAccess({ id: user.id, email: user.email, roles: user.roles.map(r => r.name), permissions });
    const newRefreshToken = signRefresh({ id: user.id });
    const exp = tokenExpiry(newRefreshToken);

    await RefreshToken.create({
      userId: user.id,
      token: newRefreshToken,
      tokenHash: sha256(newRefreshToken),
      expiresAt: exp,
      revokedAt: null,
      userAgent,
      ipAddress: ip,
    });

    return { user: formatUser(user, permissions), accessToken, refreshToken: newRefreshToken };
  }catch (err) {
    if (!(err instanceof ApiError)) {
      reportError(err, { service: 'AuthService', operation: 'refreshToken' });
    }
    throw err;
  }
 
}

/**
 * Revokes specific session or all sessions for a user
 */
export async function logout(userId, refreshToken) {
  try {
    const updates = [];

    if (refreshToken) {
      updates.push(RefreshToken.update(
        { revokedAt: new Date() },
        { where: { tokenHash: sha256(refreshToken) } }
      ));
    }

    if (userId) {
      updates.push(RefreshToken.update(
        { revokedAt: new Date() },
        { where: { userId, revokedAt: null } }
      ));
    }

    await Promise.all(updates);
  }catch (err) {
    reportError(err, { service: 'AuthService', operation: 'logout', userId });
    throw err;
  }
  
}

/**
 * Updates password and invalidates all existing sessions for security
 */
export async function changePassword(userId, oldPassword, newPassword) {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found');
    
    const isMatch = await comparePassword(oldPassword, user.passwordHash);
    if (!isMatch) throw new ApiError(400, 'Old password is incorrect');

    user.passwordHash = await hashPassword(newPassword);
    await user.save();
    
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
    return true;
  }catch (err) {
    if (!(err instanceof ApiError)) {
      reportError(err, { service: 'AuthService', operation: 'changePassword', userId });
    }
    throw err;
  }
  
}
