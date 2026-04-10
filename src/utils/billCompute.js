export function computeBillStatus(bill, payments) {
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);

  if (totalPaid === 0) return 'pending';
  if (totalPaid < bill.amount) return 'partially_paid';
  return 'paid';
}