import { User, RefreshToken, Role } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, verifyRefresh, sha256 } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

export async function createUser({ email, password, name, roleIds = [] }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw new ApiError(409, 'Email already registered');

  const passwordHash = await hash(password);
  const user = await User.create({ email, name, passwordHash });

  if (roleIds.length) {
    const roles = await Role.findAll({ where: { id: roleIds } });
    await user.setRoles(roles);
  }

  return user;
}

export async function authenticate({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const valid = await compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const payload = { id: user.id, roleIds: user.roleIds || [] };
  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days
  });

  return { user, accessToken, refreshToken };
}

export async function refreshToken(token) {
  const payload = verifyRefresh(token);
  const tokenHash = sha256(token);
  const stored = await RefreshToken.findOne({ where: { userId: payload.id, tokenHash } });
  if (!stored) throw new ApiError(401, 'Invalid refresh token');

  const accessToken = signAccess({ id: payload.id, roleIds: payload.roleIds });
  return { accessToken };
}

export async function logout(token) {
  const tokenHash = sha256(token);
  await RefreshToken.destroy({ where: { tokenHash } });
  return true;
}

export async function getUserProfile(userId) {
  return User.findByPk(userId, {
    attributes: ['id', 'email', 'name', 'createdAt'],
    include: [Role],
  });
}

export async function updateUserProfile(userId, changes) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (changes.password) changes.passwordHash = await hash(changes.password);
  delete changes.password;

  await user.update(changes);
  return user;
}

// Admin operations
export async function listUsers({ page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const { count, rows } = await User.findAndCountAll({
    limit,
    offset,
    include: [Role],
    order: [['createdAt', 'DESC']]
  });
  return { items: rows, total: count, page, pages: Math.ceil(count / limit) };
}

export async function updateUser(id, changes) {
  const user = await User.findByPk(id);
  if (!user) throw new ApiError(404, 'User not found');
  await user.update(changes);
  return user;
}

export async function deleteUser(id) {
  const deleted = await User.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'User not found');
  return true;
}
