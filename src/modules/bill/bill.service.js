import { Bill, ClinicalNote, Patient,Appointment, User,Payment,sequelize } from '../../config/associations.js';
import ApiError from '../../shared/utils/ApiError.js';
import { reportError, logSecurityAlert } from '../../shared/utils/monitoring.js';
import { Op, fn, col, cast, where  } from 'sequelize';
/**
 * BILLING SERVICE
 * Handles the financial lifecycle: Billing, Payments, and Revenue Integrity.
 * Every financial change is wrapped in a transaction for ACID compliance.
 */

/**
 * List bills with deep-search across Patient, Clinical, and Staff records
 */
export async function listBills({ page = 1, pageSize = 50, search }) {
  const pageInt = Number(page) || 1;
  const limitInt = Number(pageSize) || 20;
  const offset = (pageInt - 1) * limitInt;

  let globalWhere = {};

  const searchTerm = typeof search === 'string' ? search.trim() : '';

  if (searchTerm) {
    globalWhere[Op.or] = [
      // Bill fields
      // ENUM FIX
      { notes: { [Op.iLike]: `%${searchTerm}%` } },
      where(cast(col('Bill.status'), 'TEXT'), {
        [Op.iLike]: `%${searchTerm}%`
      }),
      where(cast(col('Bill.payment_method'), 'TEXT'), {
        [Op.iLike]: `%${searchTerm}%`
      }),
      
      // Patient
      { '$patient.first_name$': { [Op.iLike]: `%${searchTerm}%` } },
      { '$patient.last_name$': { [Op.iLike]: `%${searchTerm}%` } },

      // Creator
      { '$creator.fname$': { [Op.iLike]: `%${searchTerm}%` } },
      { '$creator.lname$': { [Op.iLike]: `%${searchTerm}%` } },

      // Appointment
      { '$appointment.reason$': { [Op.iLike]: `%${searchTerm}%` } },

      // Clinical
      { '$appointment.clinicalNote.diagnosis$': { [Op.iLike]: `%${searchTerm}%` } },
      { '$appointment.clinicalNote.assessment$': { [Op.iLike]: `%${searchTerm}%` } },
    ];
  }
  try {
      const { count, rows } = await Bill.findAndCountAll({
      where: globalWhere, // Apply global search here
      limit: limitInt,
      offset,
      order: [['createdAt', 'DESC']],
      // subQuery: false is REQUIRED when searching across associations with limit/offset
      subQuery: false,
      distinct: true,
      include: [
        {
          model: Patient,
          as: 'patient',
          required: true,
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: User,
          as: 'creator',
          required:false,
          attributes: ['id', 'fName', 'lName'] 
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'reason', 'appointmentDate','appointmentTime', 'totalAmount', 'amountPaid', 'paymentStatus'],
          include: [{
            model: ClinicalNote,
            as: 'clinicalNote',
            required: false,
            attributes: ['id', 'diagnosis', 'assessment', 'plan']
          }]
        }
      ]
    });

    return {
      total: count,
      rows: rows.map(formatBillList),
      page: Number(page),
      page: pageInt,
      pages: Math.ceil(count / limitInt)
    };
  }catch (err) {
    reportError(err, { service: 'BillingService', operation: 'listBills' });
    throw err;
  }
  
}
/**
 * getPendingBills()
 * Finds appointments that are clinically 'completed' but financially 'unpaid' or 'partially_paid'.
 */

export async function getPendingBills({ page, pageSize, search = '' }) {
  const offset = (page - 1) * pageSize;

  // Build search filter for Patient name or phone
  const searchFilter = search ? {
    [Op.or]: [
        { '$patient.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$patient.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$patient.phone$': { [Op.iLike]: `%${search}%` } }
      ]
  } : {};

    try {
        const { count, rows } = await Appointment.findAndCountAll({
        where: {
          status: 'completed',
          paymentStatus: { [Op.or]: ['unpaid', 'partially_paid'] },
          ...searchFilter
        },
        include: [
          {
            model: Patient,
            as: 'patient',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
            required: !!search 
          },
          {
            model: User,
            as: 'staff',
            attributes: ['id', 'fName', 'lName'] 
          },
          {
            model: ClinicalNote,
            as: 'clinicalNote',
            attributes: ['id', 'diagnosis']
          }
        ],
        limit: pageSize,
        offset: offset,
        order: [['updatedAt', 'DESC']],
        subQuery: false // Necessary when filtering on included models with limit/offset
      });

      return {
        items: rows,
        total: count,
        page,
        pageSize
      };
    } catch (err) {
    reportError(err, { service: 'BillingService', operation: 'getPendingBills' });
    throw err;
  }
}
/**
 * Get a single bill by ID
 */
export async function getBill(id) {
  try { 
    const bill = await Bill.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient',
          required: true,
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
        },
        {
          model: User,
          as: 'creator',
          required:false,
          attributes: ['id', 'fName', 'lName'] 
        },
        {
          model: Appointment,
          as: 'appointment',
          attributes: ['id', 'reason', 'appointmentDate','appointmentTime', 'totalAmount', 'amountPaid', 'paymentStatus'],
          include: [{
            model: ClinicalNote,
            as: 'clinicalNote',
            required: false,
            attributes: ['id', 'diagnosis', 'assessment', 'plan']
          }]
        }
      ]
    });

    if (!bill) throw new ApiError(404, 'Bill record not found');;

    return {
      id: bill.id,
      patientId: bill.patientId,
      appointmentId: bill.appointmentId,
      appointment:bill.appointment,
      amount: bill.amount,
      status: bill.status,
      paymentMethod: bill.paymentMethod,
      dueDate: bill.dueDate,
      notes: bill.notes,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
      patient: bill.patient ? { id: bill.patient.id, fullName: bill.patient.firstName + ' ' + bill.patient.lastName } : null,
    };
  }
  catch (err) {
    reportError(err, { service: 'BillingService', operation: 'getBill' });
    throw err;
  }
  
}

/**
 * Create a bill and sync the linked Appointment status
 */

export async function createBill(data) {
  const transaction = await sequelize.transaction();

  try {
    const { 
      patientId, appointmentId, amount, status,
      createdBy, paymentMethod, dueDate, notes 
    } = data;

    let appt = null;
    // 1. Fetch the Appointment to get the "Source of Truth"
    if (appointmentId) {
      appt = await Appointment.findByPk(appointmentId, { transaction });
      if (!appt) throw new ApiError(404, 'Linked Appointment not found');
    }
    
    const totalExpected = parseFloat(amount);

    // 2. THE GUARDIAN: Prevent Overpayment
    if (totalExpected === undefined || totalExpected < 1) {
      throw new ApiError(400, `Total bill amount not specified`);
    }

    // 4. Create the Bill
    const bill = await Bill.create({
      patientId,
      appointmentId,
      amount: totalExpected,
      createdBy,
      paymentMethod,
      dueDate,
      notes,
      status
    }, { transaction });

    const apptPaymentStatus = status === 'paid' ? 'fully_paid' : 'unpaid';
    if (status === 'paid') { 
      // 5. Create the Payment Record
      await Payment.create({
        billId: bill.id,
        amountPaid: totalExpected,      
        method: paymentMethod || 'cash',
        status: 'completed',
        reference: `PAY-${bill.id.split('-')[0].toUpperCase()}`,
      }, { transaction });
    }
    
    // 6. Update the Appointment (The Single Source of Truth)
    await Appointment.update({
      paymentStatus: apptPaymentStatus,
      amountPaid: totalExpected,
      totalAmount:totalExpected
    }, { 
      where: { id: appointmentId }, 
      transaction 
    });

    await transaction.commit();
    return bill;

  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'BillingService', operation: 'createBill' });
    throw err;
  }
}

/**
 * Processes payment and locks bill from further edits
 */
export async function updateBill(id, changes, userId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Fetch Bill with Appointment context
    const bill = await Bill.findByPk(id, { 
      include: [
        { model: Patient, as: 'patient' },
        { model: Appointment, as: 'appointment' }
      ],
      transaction 
    });

    if (!bill) throw new ApiError(404, 'Bill not found');

    // 2. Audit Integrity: If bill is already paid, lock it down
    if (bill.status === 'paid') {
      throw new ApiError(403, 'Audit Integrity Violation: Finalized (PAID) bills cannot be modified.');
    }

    // 3. Binary Payment Logic (Pending -> Paid)
    // We only process financial side-effects if the status is changing to 'paid'
    if (changes.status === 'paid') {
      const totalCost = parseFloat(bill.amount);

      // A. Update Appointment: Mirror the Bill amount to amountPaid
      await Appointment.update(
        { 
          amountPaid: totalCost, 
          paymentStatus: 'fully_paid',
          updatedBy: userId 
        },
        { where: { id: bill.appointmentId }, transaction }
      );

      // B. Create Payment Record: Transaction History
      await Payment.create({
        billId: bill.id,
        appointmentId: bill.appointmentId,
        patientId: bill.patientId,
        amountPaid: totalCost,
        method: changes.paymentMethod || 'cash',
        recordedBy: userId,
        notes: `Full payment captured for: ${bill.appointment?.reason || 'Medical Service'}`
      }, { transaction });

      // C. Sync local object
      bill.status = 'paid';
    }

    // 4. Update Non-Financial Metadata
    // Note: 'amount' and 'patientId' are ignored here to enforce demo constraints
    if (changes.dueDate) bill.dueDate = changes.dueDate;
    if (changes.paymentMethod) bill.paymentMethod = changes.paymentMethod;
    if (changes.notes !== undefined) bill.notes = changes.notes;

    // Persist changes to the Bill table
    await bill.save({ transaction });
    
    await transaction.commit();

    return {
      id: bill.id,
      amount: bill.amount,
      status: bill.status,
      patient: bill.patient ? { 
        id: bill.patient.id, 
        fullName: `${bill.patient.firstName} ${bill.patient.lastName}` 
      } : null,
      updatedAt: bill.updatedAt
    };

  } catch (err) {
    await transaction.rollback();
    reportError(err, { service: 'BillingService', operation: 'updateBill', billId: id });
    throw err;
  }
}

/**
 * Delete a bill
 */
export async function deleteBill(id) {
  try {
      const deleted = await Bill.destroy({ where: { id } });
      if (!deleted) throw new ApiError(404, 'Bill not found');
      return true;  
  } catch (err) {
    reportError(err, { service: 'BillingService', operation: 'deleteBill', billId: id });
    throw err;
  }
  
}

/**
 * Standardized DTO for frontend consumption
 */
function formatBillList(bill) {
  
  const b = bill.get({ plain: true });
  
  return {
    id: b.id,
    amount: b.amount,
    status: b.status,
    paymentMethod:b.paymentMethod,
    dueDate: b.dueDate,
    notes: b.notes,
    createdAt: b.createdAt,
    patient: b.patient ? {
      fullName: `${b.patient.firstName} ${b.patient.lastName}`,
      phone: b.patient.phone
    } : null,
    details: {
      diagnosis: b.appointment.clinicalNote.diagnosis,
      assessment: b.appointment.clinicalNote.assessment,
      plan: b.appointment.clinicalNote.plan,
      reason: b.appointment.reason,
      appointmentDate: b.appointment.clinicalNote.appointmentDate,
      appointmentTime: b.appointment.clinicalNote.appointmentTime,
      totalAmount: b.appointment.totalAmount,
      amountPaid: b.appointment.amountPaid,
      paymentStatus: b.appointment.paymentStatus
    },
    creator: b.creator ? `${b.creator.fName} ${b.creator.lName}` : 'System',
    visitBalance: b.appointment ? (parseFloat(b.appointment.totalAmount) - parseFloat(b.appointment.amountPaid)) : 0
  };
}