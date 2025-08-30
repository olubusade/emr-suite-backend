// services/rbac.service.js
// Optional: only needed if you still want a DB-level verification
import { User, Role, Permission } from '../models/index.js';

export async function getUserPermissions(userId) {
  const user = await User.findByPk(userId, { include: Role });
  if (!user) return [];

  const rolePerms = (user.Role?.Permissions || []).map(p => p.name);
  const userPerms = (await user.getPermissions()).map(p => p.name);

  return Array.from(new Set([...rolePerms, ...userPerms]));
}
