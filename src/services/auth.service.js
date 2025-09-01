import { User, Role, Permission, RefreshToken } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, sha256, verifyRefresh } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

/**
 * Get combined permissions from role and user-specific permissions
 */
async function getPermissions(user) {
  const role = await user.getRole({ include: Permission });
  const rolePerms = (role?.Permissions || []).map(p => p.name);
  const userPerms = (await user.getPermissions()).map(p => p.name);
  return Array.from(new Set([...rolePerms, ...userPerms]));
}

/**
 * User login
 */
export async function login({ email, password, userAgent, ip }) {
  if (!email || !password) throw new ApiError(400, 'Missing credentials');

  const user = await User.findOne({ where: { email, active: true }, include: Role });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const match = await compare(password, user.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const permissions = await getPermissions(user);
  const accessToken = signAccess({
    id: user.id,
    email: user.email,
    roleId: user.roleId,
    permissions
  });
  const refreshToken = signRefresh({ id: user.id });

  await RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    userAgent,
    ipAddress: ip
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName, // camelCase
      role: user.Role?.name
    },
    accessToken,
    refreshToken,
    permissions
  };
}

/**
 * Refresh access token
 */
export async function refreshToken(oldRefreshToken, userAgent, ip) {
  if (!oldRefreshToken) throw new ApiError(400, 'Missing refresh token');

  let payload;
  try {
    payload = verifyRefresh(oldRefreshToken);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const stored = await RefreshToken.findOne({
    where: { userId: payload.id, tokenHash: sha256(oldRefreshToken), revoked: false }
  });
  if (!stored) throw new ApiError(401, 'Invalid or revoked refresh token');

  stored.revoked = true;
  await stored.save();

  const user = await User.findByPk(payload.id, { include: Role });
  if (!user) throw new ApiError(404, 'User not found');

  const permissions = await getPermissions(user);
  const accessToken = signAccess({
    id: user.id,
    email: user.email,
    roleId: user.roleId,
    permissions
  });
  const newRefreshToken = signRefresh({ id: user.id });

  await RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(newRefreshToken),
    userAgent,
    ipAddress: ip
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName, // camelCase
      role: user.Role?.name
    },
    accessToken,
    refreshToken: newRefreshToken,
    permissions
  };
}

/**
 * Logout user
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
        { where: { userId } }
      )
    );
  }
  await Promise.all(updates);
}

/**
 * Change password
 */
export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const match = await compare(oldPassword, user.passwordHash);
  if (!match) throw new ApiError(400, 'Old password is incorrect');

  user.passwordHash = await hash(newPassword);
  await user.save();

  // Revoke all refresh tokens after password change
  await RefreshToken.update({ revoked: true }, { where: { userId } });
  return true;
}
