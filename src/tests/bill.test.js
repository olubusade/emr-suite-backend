// src/test/bill.test.js
import request from 'supertest';
import app from '../app.js';
import { setupDatabase, teardownDatabase, createTestUser } from './testHelper.js';

let tokens = {};
let billId;

beforeAll(async () => {
  await setupDatabase();
  const reception = await createTestUser({ role: 'reception' });
  tokens.reception = reception.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Bill Module CRUD', () => {
  it('should create a bill', async () => {
    const res = await request(app)
      .post('/api/bills')
      .set('Authorization', `Bearer ${tokens.reception}`)
      .send({ patientId: 1, amount: 500 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.id).toBeDefined();
    billId = res.body.data.id;
  });

  it('should get a bill', async () => {
    const res = await request(app)
      .get(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.id).toBe(billId);
  });

  it('should update a bill', async () => {
    const res = await request(app)
      .patch(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`)
      .send({ amount: 600 });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.amount).toBe(600);
  });

  it('should delete a bill', async () => {
    const res = await request(app)
      .delete(`/api/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);

    expect([200, 204]).toContain(res.status);
  });
});
