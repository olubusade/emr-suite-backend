import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { PERMISSIONS } from '../constants/index.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Public endpoint to create a new user account.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegister'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     description: Public endpoint to login a user and retrieve access & refresh tokens.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/users/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Public endpoint to refresh JWT token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile information.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user profile
 *     description: Updates authenticated user's profile details.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout current user
 *     description: Revokes current user's refresh tokens.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     description: Admin-only endpoint to list all users. Requires USER_READ permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     summary: Create a new user
 *     description: Admin-only endpoint to create a user. Requires USER_CREATE permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreate'
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update any user
 *     description: Admin-only endpoint to update a user by ID. Requires USER_UPDATE permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     summary: Delete any user
 *     description: Admin-only endpoint to delete a user by ID. Requires USER_DELETE permission.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

router.use(authRequired);
router.get('/get_profile', userController.getProfile);
router.patch('/update_profile', userController.updateProfile);

router.get('/list', authorize(PERMISSIONS.USER_READ), userController.listUsers);
router.post('/register', authorize(PERMISSIONS.USER_CREATE), userController.registerUser);
router.patch('/:id', authorize(PERMISSIONS.USER_UPDATE), userController.updateUser);
router.delete('/:id', authorize(PERMISSIONS.USER_DELETE), userController.deleteUser);

export default router;
