import { User, Role, RefreshToken, sequelize } from '../models/index.js';
import { hashPassword } from '../utils/passwords.js';

import ApiError from '../utils/ApiError.js';
import { reportError, logSecurityAlert } from '../utils/monitoring.js';
import { Op } from 'sequelize'; // You need Op for the listStaff search
import { STAFF_ROLES_ARRAY } from '../constants/index.js';

/**
 * STAFF SERVICE
 * Manages the hospital personnel registry.
 * Handles the lifecycle of staff accounts from onboarding to deactivation.
 */
/* -------------------------------------------------------------------------- */
/* Internal Helpers                             */
/* -------------------------------------------------------------------------- */

function formatStaffMember(u) {
  return {
    id: u.id,
    fName: u.fName,
    lName: u.lName,
    fullName: u.fullName || `${u.fName} ${u.lName}`,
    email: u.email,
    active: u.active,
    designation: u.roles && u.roles.length ? u.roles[0].name : 'Staff',
    createdAt: u.createdAt
  };
}

/* -------------------------------------------------------------------------- */
/* Core Staff Services                          */
/* -------------------------------------------------------------------------- */

/**
 * Onboards a new staff member and assigns initial roles
 */
export async function createUser({ email, password, fullName,fName,lName, roleIds = [] }) {
  const transaction = await sequelize.transaction();
  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw new ApiError(409, 'Email already registered');

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, fullName, passwordHash, active: true }, { transaction });

    if (roleIds.length) {
      const roles = await Role.findAll({ where: { id: roleIds } });
      await user.setRoles(roles, { transaction });
    }
    await transaction.commit();
    // To return a complete, consistently formatted object, you might need a formatUser helper
    // For now, we'll return a simple object.
    const roleName = roleIds.length ? (await user.getRoles())[0]?.name : null;
    return { ...user.toJSON(), roleName };
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'StaffService', operation: 'createUser', email });
    throw err;
  }
  
}

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
  
  // NOTE: The WHERE clause should filter by role KEY, not name, for robustness.
  // Assuming STAFF_ROLES_ARRAY contains the role keys (e.g., ['DOCTOR', 'NURSE'])
  const roleWhere = roleKey 
    ? { name: roleKey.toLowerCase() } // Filter specifically for 'doctor'
    : { name: STAFF_ROLES_ARRAY.map(r => r.toLowerCase()) }; // Default to all staff

  try {
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

  return {
    items:rows.map(formatStaffMember),
    total: count,
    page: pageInt,
    pages: Math.ceil(count / limitInt)
  };
  } catch (err) {
    reportError(err, { service: 'StaffService', operation: 'listStaff' });
    throw err;
  }
 
}


/* -------------------------------------------------------------------------- */
/* User Update and Delete Services        */
/* -------------------------------------------------------------------------- */

/**
 * Updates an existing user's details and/or roles.
 * @param {string} userId - UUID of the user to update.
 * @param {object} updateData - Fields to update (e.g., fullName, email, phone, active).
 * @param {string[]} [newRoleIds] - Optional list of Role IDs to COMPLETELY replace the user's current roles.
 * @returns {object} The updated user object.
 */
export async function updateUser(userId, updateData, newRoleIds) {
  const transaction = await sequelize.transaction();
  try {
      const user = await User.findByPk(userId,{ transaction });
    if (!user) throw new ApiError(404, 'User not found');
    
    // 1. Update basic user fields
    await user.update(updateData, { transaction });

    // 2. Update roles if newRoleIds is explicitly provided (allows setting empty roles)
    if (Array.isArray(newRoleIds) && newRoleIds !== undefined) {
        const roles = await Role.findAll({ where: { id: newRoleIds } , transaction });
        await user.setRoles(roles, { transaction }); // This replaces existing roles
    }
    await transaction.commit();
    // 3. Retrieve and return the updated user object
    const updatedUser = User.findByPk(userId, { include: [{ model: Role, as: 'roles' }] }, { transaction });
    
    // For consistency with createUser, we'll return a similar structure
    const roleName = updatedUser.roles.length ? updatedUser.roles[0]?.name : null;
    return { ...updatedUser.toJSON(), roleName };
  }catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'StaffService', operation: 'updateUser', userId });
    throw err;
  }
}
/**
 * Deactivates staff and executes "Security Kill-Switch"
 */
/**
 * Deletes or deactivates a user. Best practice is soft delete for personnel records.
 * @param {string} userId - UUID of the user to delete/deactivate.
 * @param {boolean} [softDelete=true] - True to deactivate, false to permanently destroy the record.
 * @returns {boolean} True if the operation was successful.
 */
export async function deleteUser(userId, softDelete = true) {
  const transaction = await sequelize.transaction();
  try {
    const user = await User.findByPk(userId, { transaction });
    if (!user) throw new ApiError(404, 'User not found');

    if (softDelete) {
        // Soft Delete: Set the user to inactive
        user.active = false;
        await user.save({ transaction });
        //SECURITY KILL-SWITCH: Instantly revoke all active refresh tokens
      // This prevents the user from using existing sessions to access the EMR.
      await RefreshToken.update(
          { revokedAt: new Date() },
          { where: { userId, revokedAt: null }, transaction }
        );
        
        logSecurityAlert('Staff Account Deactivated', { userId });
      } else {
          // Permanent Delete: Destroy the user record
          await user.destroy({ transaction });
      }
    await transaction.commit();
    return true;
  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'StaffService', operation: 'deleteUser', userId });
    throw err;
  }
    
}