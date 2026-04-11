import request from "supertest";
import app from "../app.js";
import { setupDB, teardownDatabase, createTestUser, createTestPatient } from "./testHelper.js";

let tokens = {};
let vitalId;
let testPatientId;

beforeAll(async () => {
  // Logic: Using standardized setupDB for clean state
  await setupDB();
  
  const nurse = await createTestUser({ 
    role: "nurse", 
    email: "nurse.triage@busade-emr-demo.com" 
  });
  tokens.nurse = nurse.accessToken;

  // Logic: Satisfy foreign key constraints for Patient table
  const patient = await createTestPatient(); 
  testPatientId = patient.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe("Clinical Vitals Module Integration", () => {
  
  it("should create a triage record and verify auto-calculated BMI", async () => {
    const res = await request(app)
      .post("/api/vitals")
      .set("Authorization", `Bearer ${tokens.nurse}`)
      .send({
        patientId: testPatientId, 
        readingAt: new Date().toISOString(), 
        weightKg: 70.0, 
        heightCm: 175.0, 
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.8,
        spo2: 98,
        painScale: 2,
        notes: "Initial triage check."
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty("id");
    
    // Logic: Verification of BMI (70 / 1.75^2 ≈ 22.857)
    // toBeCloseTo prevents failure due to minor floating point variances
    expect(Number(res.body.data.bmi)).toBeCloseTo(22.9, 1); 
    
    vitalId = res.body.data.id;
  });

  it("should retrieve triage record with associated patient metadata", async () => {
    const res = await request(app)
      .get(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(vitalId);
    
    // Logic: Confirm associations are eager-loaded for the UI
    expect(res.body.data).toHaveProperty("Patient");
    expect(res.body.data.Patient.id).toBe(testPatientId);
  });

  it("should recalculate BMI when weight is modified via PATCH", async () => {
    // New weight: 80 kg. New BMI: 80 / 1.75^2 ≈ 26.12
    const res = await request(app)
      .patch(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`)
      .send({ 
        temperature: 37.2, 
        weightKg: 80.0 
      });

    expect(res.status).toBe(200);
    expect(Number(res.body.data.bmi)).toBeCloseTo(26.1, 1); 
    expect(res.body.data.temperature).toBe(37.2);
  });
  
  it("should archive/delete a vital record and enforce 404 on subsequent lookups", async () => {
    const res = await request(app)
      .delete(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    
    const getRes = await request(app)
      .get(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);
    
    expect(getRes.status).toBe(404);
  });
});