import { User, Role, Permission, RefreshToken } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, sha256, verifyRefresh } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

/* -------------------------------------------------------------------------- */
/*                                Helpers                                     */
/* -------------------------------------------------------------------------- */

/**
 * Aggregate permissions from both role and user-specific assignments
 */
async function collectPermissions(user) {
  const role = await user.getRole({
    include: { model: Permission, as: 'permissions' },
  });

  const rolePermissions = (role?.permissions || []).map(p => p.name);
  const userPermissions = (await user.getPermissions()).map(p => p.name);

  return Array.from(new Set([...rolePermissions, ...userPermissions]));
}

/**
 * Build API-safe user object
 */
function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role?.name,
  };
}

/* -------------------------------------------------------------------------- */
/*                              Auth Services                                 */
/* -------------------------------------------------------------------------- */

export async function login({ email, password, userAgent, ip }) {
  if (!email || !password) throw new ApiError(400, 'Missing credentials');

  const user = await User.findOne({
    where: { email, active: true },
    include: { model: Role, as: 'role' },
  });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const passwordMatch = await compare(password, user.password_hash);
  if (!passwordMatch) throw new ApiError(401, 'Invalid credentials');

  const permissions = await collectPermissions(user);

  const accessToken = signAccess({
    id: user.id,
    email: user.email,
    roleId: user.role_id,
    permissions,
  });

  const refreshToken = signRefresh({ id: user.id });

  await RefreshToken.create({
    user_id: user.id,
    tokenHash: sha256(refreshToken),
    userAgent,
    ipAddress: ip,
  });

  return {
    user: formatUser(user),
    accessToken,
    refreshToken,
    permissions,
  };
}

/**
 * Refresh tokens (rotate refresh tokens securely)
 */
export async function refreshToken(oldRefreshToken, userAgent, ip) {
  if (!oldRefreshToken) throw new ApiError(400, 'Missing refresh token');

  let payload;
  try {
    payload = verifyRefresh(oldRefreshToken);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const storedToken = await RefreshToken.findOne({
    where: {
      user_id: payload.id,
      tokenHash: sha256(oldRefreshToken),
      revoked: false,
    },
  });
  if (!storedToken) throw new ApiError(401, 'Invalid or revoked refresh token');

  storedToken.revoked = true;
  await storedToken.save();

  const user = await User.findByPk(payload.id, {
    include: { model: Role, as: 'role' },
  });
  if (!user) throw new ApiError(404, 'User not found');

  const permissions = await collectPermissions(user);

  const accessToken = signAccess({
    id: user.id,
    email: user.email,
    roleId: user.role_id,
    permissions,
  });

  const newRefreshToken = signRefresh({ id: user.id });

  await RefreshToken.create({
    user_id: user.id,
    tokenHash: sha256(newRefreshToken),
    userAgent,
    ipAddress: ip,
  });

  return {
    user: formatUser(user),
    accessToken,
    refreshToken: newRefreshToken,
    permissions,
  };
}

/**
 * Logout user (revoke tokens)
 */
export async function logout(userId, refreshToken) {
  const updates = [];

  if (refreshToken) {
    updates.push(
      RefreshToken.update(
        { revoked: true },
        { where: { tokenHash: sha256(refreshToken) } }
      )
    );
  }

  if (userId) {
    updates.push(
      RefreshToken.update(
        { revoked: true },
        { where: { user_id: userId } }
      )
    );
  }

  await Promise.all(updates);
}

/**
 * Change password and revoke existing tokens
 */
export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await compare(oldPassword, user.password_hash);
  if (!isMatch) throw new ApiError(400, 'Old password is incorrect');

  user.password_hash = await hash(newPassword);
  await user.save();

  await RefreshToken.update({ revoked: true }, { where: { user_id: userId } });

  return true;
}
