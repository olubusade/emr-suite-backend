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
      .post('/bills')
      .set('Authorization', `Bearer ${tokens.reception}`)
      .send({ patientId: 1, amount: 500 });
    expect(res.status).toBe(201);
    billId = res.body.id;
  });

  it('should get bill', async () => {
    const res = await request(app)
      .get(`/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);
    expect(res.status).toBe(200);
  });

  it('should update bill', async () => {
    const res = await request(app)
      .patch(`/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`)
      .send({ amount: 600 });
    expect(res.status).toBe(200);
  });

  it('should delete bill', async () => {
    const res = await request(app)
      .delete(`/bills/${billId}`)
      .set('Authorization', `Bearer ${tokens.reception}`);
    expect([200, 204]).toContain(res.status);
  });
});
