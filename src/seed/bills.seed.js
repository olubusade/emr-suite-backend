import { v4 as uuidv4 } from 'uuid';

export async function seedBills(Bill, patients, createdBy) {
  const billsData = [
    {
      id: uuidv4(),
      patient_id: patients[0].id,
      amount: 1500,
      status: 'paid',
      created_by: createdBy.id
    },
    {
      id: uuidv4(),
      patient_id: patients[1].id,
      amount: 2500,
      status: 'unpaid',
      created_by: createdBy.id
    },
    {
      id: uuidv4(),
      patient_id: patients[2].id,
      amount: 1800,
      status: 'paid',
      created_by: createdBy.id
    }
  ];

  const bills = await Bill.bulkCreate(billsData, { returning: true });
  console.log('Demo bills created');
  return bills;
}
