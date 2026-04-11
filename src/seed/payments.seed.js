import { v4 as uuidv4 } from 'uuid';
import { reportError } from '../utils/monitoring.js';
export async function seedPayments(Payment, bills) {
  const paymentsData = [];

  bills.forEach((bill) => {
    const amount = parseFloat(bill.amount);

    // FULL PAYMENT
    if (bill.status === 'paid') {
      paymentsData.push({
        id: uuidv4(),
        billId: bill.id,
        amountPaid: amount,
        method: 'card',
        status: 'completed',
        reference: `SEED-FULL-${uuidv4().substring(0,8)}`,
      });
    }

    // PARTIAL PAYMENT (Matches the 5,000 paid in Appointment seed)
    if (bill.status === 'partially_paid') {
      paymentsData.push({
        id: uuidv4(),
        billId: bill.id,
        amountPaid: 5000.00,
        method: 'transfer',
        status: 'completed',
        reference: `SEED-PART-${uuidv4().substring(0,8)}`,
      });
    }
  });

  if (paymentsData.length === 0) {
    process.stdout.write('ℹ️  No billable transactions found to reconcile.\n');
    return [];
  }

  try {
    process.stdout.write(`⏳ Reconciling ${paymentsData.length} payment transactions... `);

    const created = await Payment.bulkCreate(paymentsData, { returning: true });

    process.stdout.write('Success (Ledger balanced)\n');
    
    return created.map(p => p.get({ plain: true }));
  } catch (error) {
    process.stdout.write('❌ Failed\n');
    
    reportError(error, { 
      service: 'Seeder', 
      operation: 'seedPayments',
      context: 'Finalizing financial transactions for demo records'
    });

    throw error;
  }
}