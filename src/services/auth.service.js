import { User, Role, Permission, RefreshToken } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, sha256, verifyRefresh } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';

async function getPermissions(user) {
  const role = await user.getRole({ include: Permission });
  const rolePerms = (role?.Permissions || []).map(p => p.name);
  const userPerms = (await user.getPermissions()).map(p => p.name);
  return Array.from(new Set([...rolePerms, ...userPerms]));
}

export async function login({ email, password, userAgent, ip }) {
  if (!email || !password) throw new ApiError(400, 'Missing credentials');

  const user = await User.findOne({ where: { email, active: true }, include: Role });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const match = await compare(password, user.password_hash);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const permissions = await getPermissions(user);
  const accessToken = signAccess({ id: user.id, email: user.email, roleId: user.role_id, permissions });
  const refreshToken = signRefresh({ id: user.id });

  await RefreshToken.create({
    user_id: user.id,
    token_hash: sha256(refreshToken),
    user_agent: userAgent,
    ip_address: ip
  });

  return { user, accessToken, refreshToken, permissions };
}

export async function refreshToken(oldRefreshToken, userAgent, ip) {
  if (!oldRefreshToken) throw new ApiError(400, 'Missing refresh token');

  let payload;
  try { payload = verifyRefresh(oldRefreshToken); } 
  catch { throw new ApiError(401, 'Invalid refresh token'); }

  const stored = await RefreshToken.findOne({
    where: { user_id: payload.id, token_hash: sha256(oldRefreshToken), revoked: false }
  });
  if (!stored) throw new ApiError(401, 'Invalid or revoked refresh token');

  stored.revoked = true;
  await stored.save();

  const user = await User.findByPk(payload.id, { include: Role });
  if (!user) throw new ApiError(404, 'User not found');

  const permissions = await getPermissions(user);
  const accessToken = signAccess({ id: user.id, email: user.email, roleId: user.role_id, permissions });
  const newRefreshToken = signRefresh({ id: user.id });

  await RefreshToken.create({
    user_id: user.id,
    token_hash: sha256(newRefreshToken),
    user_agent: userAgent,
    ip_address: ip
  });

  return { accessToken, refreshToken: newRefreshToken, user, permissions };
}

export async function logout(userId, refreshToken) {
  if (refreshToken) await RefreshToken.update({ revoked: true }, { where: { token_hash: sha256(refreshToken) } });
  if (userId) await RefreshToken.update({ revoked: true }, { where: { user_id: userId } });
}

export async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const match = await compare(oldPassword, user.password_hash);
  if (!match) throw new ApiError(400, 'Old password is incorrect');

  user.password_hash = await hash(newPassword);
  await user.save();

  await RefreshToken.update({ revoked: true }, { where: { user_id: userId } });
  return true;
}
