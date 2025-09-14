import { User, Role, Permission, RefreshToken } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, sha256, verifyRefresh, tokenExpiry } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

async function collectPermissions(user) {
  if (!user) return [];

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
}

function formatUser(user, permissions = []) {
  return {
    id: user.id,
    fName: user.fName,
    lName: user.lName,
    email: user.email,
    fullName:user.fullName,
    phone: user.phone,
    roles: user.roles.map(r => r.name),
    permissions,
    isActive: user.active,
    lastLogin: user.last_login,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Auth Services                                 */
/* -------------------------------------------------------------------------- */

export async function login({ email, password, userAgent, ip }) {
  if (!email || !password) throw new ApiError(400, 'Missing credentials');

  const user = await User.findOne({
    where: { email, active: true },
    include: [{ model: Role, as: 'roles' }],
  });

  if (!user) throw new ApiError(401, 'Invalid credentials');

  const passwordMatch = await compare(password, user.passwordHash);
  if (!passwordMatch) throw new ApiError(401, 'Invalid credentials');

  const permissions = await collectPermissions(user);
  const accessToken = signAccess({
    id: user.id,
    email: user.email,
    roles: user.roles.map(r => r.name),
    permissions,
  });

  const refreshToken = signRefresh({ id: user.id });
  const exp = tokenExpiry(refreshToken);

  await RefreshToken.create({
    userId: user.id,
    token: refreshToken,
    tokenHash: sha256(refreshToken),
    expiresAt: exp,
    revokedAt: null, // active
    userAgent,
    ipAddress: ip,
  });

  return { user: formatUser(user, permissions), accessToken, refreshToken };
}

export async function refreshToken(oldRefreshToken, userAgent, ip) {
  if (!oldRefreshToken) throw new ApiError(400, 'Missing refresh token');

  let payload;
  try { payload = verifyRefresh(oldRefreshToken); } 
  catch { throw new ApiError(401, 'Invalid refresh token'); }

  const storedToken = await RefreshToken.findOne({
    where: {
      userId: payload.id,
      tokenHash: sha256(oldRefreshToken),
      revokedAt: null, // only active tokens
    },
  });
  if (!storedToken) throw new ApiError(401, 'Invalid or revoked refresh token');

  storedToken.revokedAt = new Date();
  await storedToken.save();

  const user = await User.findByPk(payload.id, { include: [{ model: Role, as: 'roles' }] });
  if (!user) throw new ApiError(404, 'User not found');

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
}

export async function logout(userId, refreshToken) {
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
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await compare(oldPassword, user.password_hash);
  if (!isMatch) throw new ApiError(400, 'Old password is incorrect');

  user.password_hash = await hash(newPassword);
  await user.save();

  await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
  return true;
}
