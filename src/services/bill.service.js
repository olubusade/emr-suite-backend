import { Bill, ClinicalNote, Patient,Appointment, User,Payment,sequelize } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { Op, fn, col, cast, where  } from 'sequelize';
/**
 * List bills with pagination and filters
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
  const mappedRows = rows.map((bill) => {
    const plainBill = bill.get({ plain: true });
    
    return {
      id: plainBill.id,
      amount: plainBill.amount,
      status: plainBill.status,
      dueDate: plainBill.dueDate,
      paymentMethod: plainBill.paymentMethod,
      createdAt: plainBill.createdAt,
      
      // Flattened for easy Frontend consumption
      patient: plainBill.patient ? {
        id: plainBill.patient.id,
        fullName: `${plainBill.patient.firstName} ${plainBill.patient.lastName}`,
        phone: plainBill.patient.phone
      } : null,

      staff: plainBill.creator ? {
        fullName: `${plainBill.creator.fName} ${plainBill.creator.lName}`
      } : null,

      details: plainBill.appointment ? {
        appointmentId: plainBill.appointment.id,
        reason: plainBill.appointment.reason,
        date: plainBill.appointment.appointmentDate,
        diagnosis: plainBill.appointment.clinicalNote?.diagnosis || 'N/A',
        
        // Financial Summary for the frontend "Balance" column
        visitTotal: plainBill.appointment.totalAmount,
        visitPaid: plainBill.appointment.amountPaid,
        visitBalance: parseFloat(plainBill.appointment.totalAmount) - parseFloat(plainBill.appointment.amountPaid),
        visitStatus: plainBill.appointment.paymentStatus
      } : { reason: 'General Service', diagnosis: 'N/A', visitBalance: 0 }
    };
  });


  return {
    total: count,
    rows: mappedRows,
    page: Number(page),
    page: pageInt,
    pages: Math.ceil(count / limitInt)
  };
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
      { '$patient.first_name$': { [Op.iLike]: `%${search}%` } },
      { '$patient.last_name$': { [Op.iLike]: `%${search}%` } },
      { '$patient.phone$': { [Op.iLike]: `%${search}%` } }
    ]
  } : {};

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
        attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
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
      /* {
        model: Bill,
        as: 'bill',
        attributes: ['id', 'amount', 'status']
      } */
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
}
/**
 * Get a single bill by ID
 */
export async function getBill(id) {
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

  if (!bill) return null;

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

/**
 * Create a new bill
 */

export async function createBill(data) {
  const { 
    patientId, appointmentId, amount, status,
    createdBy, paymentMethod, dueDate, notes 
  } = data;

  console.log('data>>>', data);
  console.log('appointmentId>>>',appointmentId);

  const transaction = await sequelize.transaction();

  try {
    let appt = null;
    // 1. Fetch the Appointment to get the "Source of Truth"
    if (appointmentId) {
      appt = await Appointment.findByPk(appointmentId, { transaction });
      if (!appt) throw new ApiError(404, 'Linked Appointment not found');
    }
    console.log('Appt::',appt);
    
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

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Update an existing bill
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

  } catch (error) {
    if (transaction) await transaction.rollback();
    throw error;
  }
}

/**
 * Delete a bill
 */
export async function deleteBill(id) {
  const deleted = await Bill.destroy({ where: { id } });
  if (!deleted) throw new ApiError(404, 'Bill not found');
  return true;
}
