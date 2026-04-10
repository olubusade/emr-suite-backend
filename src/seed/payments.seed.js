import { v4 as uuidv4 } from 'uuid';

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

  if (paymentsData.length === 0) return [];

  const created = await Payment.bulkCreate(paymentsData, { returning: true });
  console.log(`✅ Created ${created.length} payment transactions.`);
  return created.map(p => p.get({ plain: true }));
}