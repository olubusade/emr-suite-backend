import request from "supertest";
import app from "../app.js";
import { setupDatabase, teardownDatabase, createTestUser } from "./testHelper.js";

let tokens = {};
let clinicalNoteId;

beforeAll(async () => {
  await setupDatabase();
  const doctor = await createTestUser({ role: "doctor" });
  tokens.doctor = doctor.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe("Clinical Note Module CRUD", () => {
  it("should create a clinical note", async () => {
    const res = await request(app)
      .post("/api/clinical-notes")
      .set("Authorization", `Bearer ${tokens.doctor}`)
      .send({ patientId: 1, note: "Patient shows improvement" });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    clinicalNoteId = res.body.data.id;
  });

  it("should get a clinical note", async () => {
    const res = await request(app)
      .get(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", clinicalNoteId);
    expect(res.body.data).toHaveProperty("patientId");
    expect(res.body.data).toHaveProperty("note");
  });

  it("should update a clinical note", async () => {
    const res = await request(app)
      .patch(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`)
      .send({ note: "Patient stable, no new complaints" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", clinicalNoteId);
    expect(res.body.data.note).toBe("Patient stable, no new complaints");
  });

  it("should delete a clinical note", async () => {
    const res = await request(app)
      .delete(`/api/clinical-notes/${clinicalNoteId}`)
      .set("Authorization", `Bearer ${tokens.doctor}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ success: true });
  });
});
