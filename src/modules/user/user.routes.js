import express from 'express';
import * as userController from './user.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { PERMISSIONS } from '../../constants/index.js';
import { asyncHandler } from '../../shared/utils/asyncHandler.js';


const router = express.Router();

/**
 * =========================
 * AUTHENTICATED USER ROUTES
 * =========================
 */

router.use(authRequired);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.get('/me', asyncHandler(userController.getProfile));

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/me', asyncHandler(userController.updateProfile));

/**
 * =========================
 * ADMIN / STAFF MANAGEMENT
 * =========================
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all staff users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  authorize(PERMISSIONS.USER_READ),
  asyncHandler(userController.listStaff)
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authorize(PERMISSIONS.USER_CREATE),
  asyncHandler(userController.registerUser)
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: Update a user
 *     tags: [Users]
 */
router.patch(
  '/:id',
  authorize(PERMISSIONS.USER_UPDATE),
  asyncHandler(userController.updateUser)
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 */
router.delete(
  '/:id',
  authorize(PERMISSIONS.USER_DELETE),
  asyncHandler(userController.deleteUser)
);

export default router;