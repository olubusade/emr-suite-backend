import request from "supertest";
import app from "../app.js";
import { setupDatabase, teardownDatabase, createTestUser, createTestPatient } from "./testHelper.js"; // 🔑 Import createTestPatient

let tokens = {};
let vitalId;
let testPatientId; // 🔑 Variable to hold the dynamically created patient ID

beforeAll(async () => {
  await setupDatabase();
  const nurse = await createTestUser({ role: "nurse" });
  tokens.nurse = nurse.accessToken;

  // 🔑 SETUP: Create a test patient to ensure a valid foreign key exists
  const patient = await createTestPatient(); 
  testPatientId = patient.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe("Vital Module CRUD", () => {
  
  // ------------------------------------------------------------------
  // 🔑 TEST 1: CREATE VITAL RECORD (Full Payload & BMI Calculation Check)
  // ------------------------------------------------------------------
  it("should create a vital record and calculate BMI", async () => {
    const res = await request(app)
      .post("/api/vitals")
      .set("Authorization", `Bearer ${tokens.nurse}`)
      .send({
        // 🔑 REQUIRED: Use the dynamically created patient ID
        patientId: testPatientId, 
        // 🔑 REQUIRED: Use ISO 8601 datetime format
        readingAt: new Date().toISOString(), 
        
        // Vitals data for calculation:
        // Weight: 70 kg, Height: 175 cm (1.75 m). BMI = 70 / (1.75^2) ≈ 22.86
        weightKg: 70.0, 
        heightCm: 175.0, 
        
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.8,
        spo2: 98,
        painScale: 2,
        notes: "Routine check-in."
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    
    // 🔑 VERIFY: Check the BMI calculation (rounded to 1 decimal place)
    expect(res.body.data.bmi).toBeCloseTo(22.9, 1); 
    expect(res.body.data.weightKg).toBe(70.0);
    expect(res.body.data.spo2).toBe(98);
    
    vitalId = res.body.data.id;
  });

  // ------------------------------------------------------------------
  // TEST 2: GET VITAL RECORD
  // ------------------------------------------------------------------
  it("should get a vital record and include associated data", async () => {
    const res = await request(app)
      .get(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", vitalId);
    expect(res.body.data).toHaveProperty("patientId", testPatientId);
    
    // 🔑 VERIFY: Check if associations (Patient/Nurse) are included (if service is set up)
    expect(res.body.data).toHaveProperty("Patient"); 
    expect(res.body.data).toHaveProperty("nurse");
    
    // Check specific updated fields
    expect(res.body.data.bmi).toBeCloseTo(22.9, 1);
  });

  // ------------------------------------------------------------------
  // 🔑 TEST 3: UPDATE VITAL RECORD (Recalculate BMI Check)
  // ------------------------------------------------------------------
  it("should update weight and trigger BMI recalculation", async () => {
    // New weight: 80 kg. Height remains 175 cm. BMI = 80 / (1.75^2) ≈ 26.12
    const res = await request(app)
      .patch(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`)
      .send({ 
        temperature: 37.2, 
        weightKg: 80.0 // Update weight
      });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", vitalId);
    expect(res.body.data.temperature).toBe(37.2);
    
    // 🔑 VERIFY: BMI is successfully recalculated
    expect(res.body.data.bmi).toBeCloseTo(26.1, 1); 
  });
  
  // ------------------------------------------------------------------
  // TEST 4: DELETE VITAL RECORD
  // ------------------------------------------------------------------
  it("should delete a vital record", async () => {
    const res = await request(app)
      .delete(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ success: true });
    
    // 🔑 VERIFY: Ensure it's truly deleted (optional, but good practice)
    const getRes = await request(app)
      .get(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);
    
    expect(getRes.status).toBe(404);
  });
});