import request from "supertest";
import app from "../app.js";
import { setupDB, teardownDatabase, createTestUser, createTestPatient } from "./testHelper.js";

let tokens = {};
let clinicalNoteId;
let testPatientId;

beforeAll(async () => {
  await setupDB();
  
  // Logic: Only a Doctor should be authorized to finalize clinical notes
  const doctor = await createTestUser({ 
    role: "doctor", 
    email: "dr.ade@busade-emr-demo.com" 
  });
  tokens.doctor = doctor.accessToken;

  const patient = await createTestPatient(); 
  testPatientId = patient.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe("Clinical Documentation (SOAP Notes) Integration", () => {
  
  it("should create a comprehensive SOAP note (201 Created)", async () => {
    const res = await request(app)
      .post("/api/clinical-notes")
      .set("Authorization", `Bearer ${tokens.doctor}`)
      .send({
          patientId: testPatientId,
          diagnosis: 'Acute viral pharyngitis (J02.9)', 
          subjective: 'Patient reports sore throat for 3 days and slight fever.',
          objective: 'Oropharynx is erythematous, no tonsillar exudates. Temp 37.5C.',
          assessment: 'Viral Pharyngitis.',
          plan: 'Prescribed warm saline gargles and paracetamol. Follow up in 3 days.',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.diagnosis).toContain('J02.9');
    
    clinicalNoteId = res.body.data.id;
  });

  it("should retrieve the clinical note with doctor/staff association", async () => {
    const res = await request(app)
      .get(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(clinicalNoteId);
    // Logic: Verify that the response identifies which doctor wrote the note
    expect(res.body.data).toHaveProperty("Staff"); 
  });

  it("should allow a doctor to append/update their notes (200 OK)", async () => {
    const res = await request(app)
      .patch(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`)
      .send({ 
        plan: "Rest, fluids, and return if symptoms worsen." 
      });

    expect(res.status).toBe(200);
    expect(res.body.data.plan).toBe("Rest, fluids, and return if symptoms worsen.");
  });

  it("should archive/delete a clinical record (200/204)", async () => {
    const res = await request(app)
      .delete(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    // Final integrity check
    const check = await request(app)
      .get(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`);
    
    expect(check.status).toBe(404);
  });
});