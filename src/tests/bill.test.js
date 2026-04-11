import request from 'supertest';
import app from '../app.js';
import { setupDB, teardownDatabase, createTestUser, createTestPatient } from './testHelper.js';

let tokens = {};
let billId;
let testPatientId;

beforeAll(async () => {
  await setupDB();
  
  // Logic: Use 'receptionist' to match your Role seeder
  const reception = await createTestUser({ 
    role: 'receptionist', 
    email: 'billing.staff@busade-emr-demo.com' 
  });
  tokens.reception = reception.accessToken;

  // Logic: Create a real patient to satisfy UUID foreign key constraints
  const patient = await createTestPatient();
  testPatientId = patient.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Financial Module: Billing Integration', () => {
  
  it('should generate a new invoice (201 Created)', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${tokens.reception}`)
      .send({ 
        patientId: testPatientId, 
        amount: 500.00,
        description: 'Consultation Fee',
        status: 'pending' // Following standard EMR financial workflow
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('id');
    expect(Number(res.body.data.amount)).toBe(500.00);
    
    billId = res.body.data.id;
  });

  it('should retrieve specific bill details with patient association', async () => {
    const res = await request(app)
      .get(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(billId);
    // Logic: Verify eager loading of patient data for the invoice UI
    expect(res.body.data).toHaveProperty('Patient');
  });

  it('should update billing amount or status (200 OK)', async () => {
    const res = await request(app)
      .patch(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`)
      .send({ 
        amount: 600.50,
        status: 'partial' 
      });

    expect(res.status).toBe(200);
    expect(Number(res.body.data.amount)).toBe(600.50);
    expect(res.body.data.status).toBe('partial');
  });

  it('should archive/delete a bill record', async () => {
    const res = await request(app)
      .delete(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);

    expect([200, 204]).toContain(res.status);

    // Final integrity check
    const check = await request(app)
      .get(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);
    
    expect(check.status).toBe(404);
  });
});