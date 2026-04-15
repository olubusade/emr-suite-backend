import express from 'express';
import * as billController from './bill.controller.js';
import { authRequired } from '../../shared/middlewares/auth.middleware.js';
import { authorize } from '../../shared/middlewares/permission.middleware.js';
import { validate } from '../../shared/utils/validation.js';
import {
  listBillSchema,
  createBillSchema,
  updateBillSchema,
  getBillSchema,
  getPendingBillsSchema
} from '../../shared/validation/schemas.js';
import { PERMISSIONS } from '../../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Financial and billing management for patient services
 */

/**
 * @swagger
 * /bills:
 *   get:
 *     summary: List bills with filters and pagination
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           example: 20
 *
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unpaid, pending, partially_paid, paid, cancelled]
 *
 *       - in: query
 *         name: paymentMethod
 *         schema:
 *           type: string
 *           enum: [cash, card, insurance, transfer]
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by patient name
 *
 *     responses:
 *       200:
 *         description: Paginated list of bills
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Bill'
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get(
  '/',
  authRequired,
  authorize(PERMISSIONS.BILL_READ),
  validate(listBillSchema),
  billController.listBills
);

/**
 * @swagger
 * /bills/patients:
 *   get:
 *     summary: Get patients with pending bills
 *     tags: [Bills]
 *     description: Returns patients who have outstanding or unpaid bills
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *
 *     responses:
 *       200:
 *         description: Patients with pending bills
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Patient'
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.get(
  '/patients',
  authRequired,
  authorize(PERMISSIONS.BILL_READ),
  validate(getPendingBillsSchema),
  billController.getPendingBills
);

/**
 * @swagger
 * /bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     description: Generates a bill linked to an appointment and patient
 *     security:
 *       - bearerAuth: []
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBill'
 *
 *     responses:
 *       201:
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Bill'
 *
 *       400:
 *         description: Validation error
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
r.post(
  '/',
  authRequired,
  authorize(PERMISSIONS.BILL_CREATE),
  validate(createBillSchema),
  billController.createBill
);

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: Bill details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Bill'
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
r.get(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.BILL_READ),
  validate(getBillSchema),
  billController.getBill
);

/**
 * @swagger
 * /bills/{id}:
 *   patch:
 *     summary: Update a bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateBill'
 *
 *     responses:
 *       200:
 *         description: Bill updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Bill'
 *
 *       400:
 *         description: Invalid request
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
r.patch(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.BILL_UPDATE),
  validate(updateBillSchema),
  billController.updateBill
);

/**
 * @swagger
 * /bills/{id}:
 *   delete:
 *     summary: Delete a bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       204:
 *         description: Bill deleted successfully
 *
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
r.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.BILL_DELETE),
  validate(getBillSchema),
  billController.deleteBill
);

export default r;