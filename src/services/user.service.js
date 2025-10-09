import { User, RefreshToken, Role } from '../models/index.js';
import { hash, compare } from '../utils/passwords.js';
import { signAccess, signRefresh, verifyRefresh, sha256 } from '../utils/jwt.js';
import ApiError from '../utils/ApiError.js';
import { STAFF_ROLES_ARRAY } from '../constants/index.js';

/* -------------------- User creation / login -------------------- */
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

export async function loginUser({ email, password }) {
  const user = await User.findOne({ where: { email }, include: [Role] });
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const valid = await compare(password, user.passwordHash);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  const roleIds = (await user.getRoles()).map(r => r.id);
  const payload = { id: user.id, roleIds };

  const accessToken = signAccess(payload);
  const refreshToken = signRefresh(payload);

  await RefreshToken.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    revokedAt: null, // active
  });

  return { user: { ...user.toJSON() }, accessToken, refreshToken };
}

export async function refreshToken(token) {
  const payload = verifyRefresh(token);
  const tokenHash = sha256(token);

  const stored = await RefreshToken.findOne({ where: { userId: payload.id, tokenHash, revokedAt: null } });
  if (!stored) throw new ApiError(401, 'Invalid or revoked refresh token');

  stored.revokedAt = new Date();
  await stored.save();

  const accessToken = signAccess({ id: payload.id, roleIds: payload.roleIds });
  const newRefreshToken = signRefresh({ id: payload.id, roleIds: payload.roleIds });

  await RefreshToken.create({
    userId: payload.id,
    tokenHash: sha256(newRefreshToken),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    revokedAt: null,
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logoutUser(userId, token) {
  if (token) {
    const tokenHash = sha256(token);
    await RefreshToken.update({ revokedAt: new Date() }, { where: { tokenHash } });
  } else {
    await RefreshToken.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
  }
  return true;
}


/**
 * List users with pagination and optional search
 */
export async function listStaff({ page = 1, pageSize = 20, search }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  const where = search
    ? { fullName: { [Ou.iLike]: `%${search}%` } }
    : {};
  
  const lowercaseStaffRoles = STAFF_ROLES_ARRAY.map(role => role.toLowerCase());
  const { count, rows } = await User.findAndCountAll({
    where,
    active: true,
    // Eager load the Role model to filter on its name
    include: [
    {
      model: Role,
      as: 'roles', // Crucial: Use the alias defined in the association
      required: true, // Performs an INNER JOIN, ensuring only users with roles are returned
      where: {
        name: lowercaseStaffRoles
      },
      // You can limit the attributes selected from Role if you don't need them
      attributes: ['name'] 
    }
  ],
    limit: limitInt,
    offset,
    order: [['created_at', 'DESC']]
  });

  const items = rows.map(u => ({
    id: u.id,
    fullName: u.fName+ ' '+ u.lName,
    email: u.email,
    phone: u.phone,
    dob: u.dob,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt
  }));

  return {
    items,
    total: count,
    page: pageInt,
    pages: Math.ceil(count / limitInt)
  };
}