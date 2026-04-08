import { User, Role } from '../models/index.js';
import { hash } from '../utils/passwords.js';

import ApiError from '../utils/ApiError.js';
import { Op } from 'sequelize'; // You need Op for the listStaff search
import { STAFF_ROLES_ARRAY } from '../constants/index.js';

/* -------------------------------------------------------------------------- */
/* Helper to retrieve user with roles for consistent formatting */
/* -------------------------------------------------------------------------- */
async function getUserWithRoles(userId) {
    // Assuming the User model is associated with Role via the alias 'roles'
    return User.findByPk(userId, { include: [{ model: Role, as: 'roles' }] });
}

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

  // To return a complete, consistently formatted object, you might need a formatUser helper
  // For now, we'll return a simple object.
  const roleName = roleIds.length ? (await user.getRoles())[0]?.name : null;
  return { ...user.toJSON(), roleName };
}

// ... listStaff function (as provided, but needs Op imported) ...

/**
 * List users with pagination and optional search
 */
export async function listStaff({ page = 1, pageSize = 20, search,roleKey }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  const where = search
    ? { fullName: { [Op.iLike]: `%${search}%` } } // 🔑 FIX: Using imported Op
    : {};
  
  // 🔑 NOTE: The WHERE clause should filter by role KEY, not name, for robustness.
  // Assuming STAFF_ROLES_ARRAY contains the role keys (e.g., ['DOCTOR', 'NURSE'])
  const roleWhere = roleKey 
    ? { name: roleKey.toLowerCase() } // Filter specifically for 'doctor'
    : { name: STAFF_ROLES_ARRAY.map(r => r.toLowerCase()) }; // Default to all staff


  const { count, rows } = await User.findAndCountAll({
    where: { ...where, active: true },
    include: [
    {
      model: Role,
      as: 'roles', 
      required: true, 
      where: roleWhere,
      attributes: ['name'] 
    }
  ],
    limit: limitInt,
    offset,
    order: [['created_at', 'DESC']]
  });

  const items = rows.map(u => ({
    id: u.id,
    fullName: u.fName + ' ' + u.lName,
    fName: u.fName,
    lName: u.lName,
    active:u.active,
    email: u.email,
    designation: u.roles[0]?.name || null,
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


/* -------------------------------------------------------------------------- */
/* NEW: User Update and Delete Services        */
/* -------------------------------------------------------------------------- */

/**
 * Updates an existing user's details and/or roles.
 * @param {string} userId - UUID of the user to update.
 * @param {object} updateData - Fields to update (e.g., fullName, email, phone, active).
 * @param {string[]} [newRoleIds] - Optional list of Role IDs to COMPLETELY replace the user's current roles.
 * @returns {object} The updated user object.
 */
export async function updateUser(userId, updateData, newRoleIds) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found');
    
    // 1. Update basic user fields
    await user.update(updateData);

    // 2. Update roles if newRoleIds is explicitly provided (allows setting empty roles)
    if (newRoleIds !== undefined) {
        const roles = await Role.findAll({ where: { id: newRoleIds } });
        await user.setRoles(roles); // This replaces existing roles
    }

    // 3. Retrieve and return the updated user object
    const updatedUser = await getUserWithRoles(userId);
    
    // For consistency with createUser, we'll return a similar structure
    const roleName = updatedUser.roles.length ? updatedUser.roles[0]?.name : null;
    return { ...updatedUser.toJSON(), roleName };
}

/**
 * Deletes or deactivates a user. Best practice is soft delete for personnel records.
 * @param {string} userId - UUID of the user to delete/deactivate.
 * @param {boolean} [softDelete=true] - True to deactivate, false to permanently destroy the record.
 * @returns {boolean} True if the operation was successful.
 */
export async function deleteUser(userId, softDelete = true) {
    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (softDelete) {
        // Soft Delete: Set the user to inactive
        user.active = false;
        await user.save();
        
        // 🔑 NOTE: In a complete system, you'd also revoke their active refresh tokens here for security.
        
    } else {
        // Permanent Delete: Destroy the user record
        await user.destroy();
    }

    return true;
}