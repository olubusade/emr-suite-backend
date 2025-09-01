import express from 'express';
import * as billController from '../controllers/bill.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { authorize } from '../middlewares/permission.middleware.js';
import { validate } from '../utils/validation.js';
import { listBillSchema, createBillSchema, updateBillSchema, getBillSchema } from '../validation/schemas.js';
import { PERMISSIONS } from '../constants/index.js';

const r = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Billing management endpoints
 */

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: List all bills
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bill'
 *       403:
 *         description: Forbidden
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
 * /api/bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BillCreate'
 *     responses:
 *       201:
 *         description: Bill created successfully
 *       403:
 *         description: Forbidden
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
 * /api/bills/{id}:
 *   get:
 *     summary: Get a single bill by ID
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       200:
 *         description: Bill details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bill not found
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
 * /api/bills/{id}:
 *   put:
 *     summary: Update a bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BillUpdate'
 *     responses:
 *       200:
 *         description: Bill updated successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bill not found
 */
r.put(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.BILL_UPDATE),
  validate(updateBillSchema),
  billController.updateBill
);

/**
 * @swagger
 * /api/bills/{id}:
 *   delete:
 *     summary: Delete a bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bill ID
 *     responses:
 *       204:
 *         description: Bill deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Bill not found
 */
r.delete(
  '/:id',
  authRequired,
  authorize(PERMISSIONS.BILL_DELETE),
  validate(getBillSchema),
  billController.deleteBill
);

export default r;
