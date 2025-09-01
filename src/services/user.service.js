// src/services/user.service.js
import { User, RefreshToken, Role } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, verifyRefresh, sha256 } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

/**
 * Create a new user
 */
export async function createUser({ email, password, fullName, roleIds = [] }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await hash(password);
  const user = await User.create({ email, fullName, passwordHash });

  if (roleIds.length) {
    const roles = await Role.findAll({ where: { id: roleIds } });
    await user.setRoles(roles);
  }

  const roleName = roleIds.length ? (await user.getRoles())[0]?.name : null;
  return { ...user.toJSON(), roleName };
}

/**
 * Authenticate user and generate tokens
 */
export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email }, include: [Role] });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const valid = await compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const roleIds = (await user.getRoles()).map(r => r.id);
  const roleName = (await user.getRoles())[0]?.name || null;
  const payload = { id: user.id, roleIds };

  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  });

  return { user: { ...user.toJSON(), roleName }, accessToken, refreshToken };
}

/**
 * Refresh JWT tokens
 */
export async function refreshToken(token) {
  const payload = verifyRefresh(token);
  const tokenHash = sha256(token);

  const stored = await RefreshToken.findOne({ where: { userId: payload.id, tokenHash, revoked: false } });
  if (!stored) throw new ApiError(401, 'Invalid or revoked refresh token');

  stored.revoked = true;
  await stored.save();

  const accessToken = signAccess({ id: payload.id, roleIds: payload.roleIds });
  const newRefreshToken = signRefresh({ id: payload.id, roleIds: payload.roleIds });

  await RefreshToken.create({
    userId: payload.id,
    tokenHash: sha256(newRefreshToken),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
  });

  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Logout user
 */
export async function logoutUser(userId, token) {
  if (token) {
    const tokenHash = sha256(token);
    await RefreshToken.destroy({ where: { tokenHash, userId } });
  } else {
    // optional: revoke all tokens for user
    await RefreshToken.destroy({ where: { userId } });
  }
  return true;
}

/**
 * Get user profile
 */
export async function getUserProfile(userId) {
  const user = await User.findByPk(userId, { include: [Role] });
  if (!user) return null;

  const roleName = (await user.getRoles())[0]?.name || null;
  return { ...user.toJSON(), roleName };
}

/**
 * Update profile
 */
export async function updateUserProfile(userId, changes) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (changes.password) {
    changes.passwordHash = await hash(changes.password);
    delete changes.password;
  }

  await user.update(changes);
  const roleName = (await user.getRoles())[0]?.name || null;
  return { ...user.toJSON(), roleName };
}

/**
 * Admin: list users
 */
export async function listUsers({ page = 1, pageSize = 20 }) {
  const offset = (page - 1) * pageSize;
  const { count, rows } = await User.findAndCountAll({
    limit: pageSize,
    offset,
    include: [Role],
    order: [['createdAt', 'DESC']]
  });

  const items = await Promise.all(rows.map(async user => {
    const roleName = (await user.getRoles())[0]?.name || null;
    return { ...user.toJSON(), roleName };
  }));

  return { items, total: count, page, pages: Math.ceil(count / pageSize) };
}

/**
 * Admin: update user
 */
export async function updateUser(id, changes) {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');

  await user.update(changes);
  const roleName = (await user.getRoles())[0]?.name || null;
  return { ...user.toJSON(), roleName };
}

/**
 * Admin: delete user
 */
export async function deleteUser(id) {
  const deleted = await User.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'User not found');
  return true;
}
