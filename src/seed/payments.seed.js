import { v4 as uuidv4 } from 'uuid';

export async function seedPayments(Payment, bills) {
  const paymentsData = [
    {
      id: uuidv4(),
      billId: bills[0].id,
      amountPaid: 1500.00,
      paymentDate: new Date(),
      method: 'cash',
      reference: 'PAY-' + Math.floor(Math.random() * 1000000),
    },
    {
      id: uuidv4(),
      billId: bills[1].id,
      amountPaid: 1000.00,
      paymentDate: new Date(),
      method: 'card',
      reference: 'PAY-' + Math.floor(Math.random() * 1000000),
    },
    {
      id: uuidv4(),
      billId: bills[2].id,
      amountPaid: 1800.00,
      paymentDate: new Date(),
      method: 'transfer',
      reference: 'PAY-' + Math.floor(Math.random() * 1000000),
    },
  ];

  await Payment.bulkCreate(paymentsData);
  console.log('Demo payments created');
}
