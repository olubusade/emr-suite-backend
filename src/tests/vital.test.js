import request from "supertest";
import app from "../app.js";
import { setupDatabase, teardownDatabase, createTestUser } from "./testHelper.js";

let tokens = {};
let vitalId;

beforeAll(async () => {
  await setupDatabase();
  const nurse = await createTestUser({ role: "nurse" });
  tokens.nurse = nurse.accessToken;
});

afterAll(async () => {
  await teardownDatabase();
});

describe("Vital Module CRUD", () => {
  it("should create a vital record", async () => {
    const res = await request(app)
      .post("/api/vitals")
      .set("Authorization", `Bearer ${tokens.nurse}`)
      .send({
        patientId: 1,
        bloodPressure: "120/80",
        heartRate: 72,
        temperature: 36.8,
      });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    vitalId = res.body.data.id;
  });

  it("should get a vital record", async () => {
    const res = await request(app)
      .get(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", vitalId);
    expect(res.body.data).toHaveProperty("bloodPressure");
    expect(res.body.data).toHaveProperty("heartRate");
    expect(res.body.data).toHaveProperty("temperature");
  });

  it("should update a vital record", async () => {
    const res = await request(app)
      .patch(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`)
      .send({ temperature: 37.2 });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", vitalId);
    expect(res.body.data.temperature).toBe(37.2);
  });

  it("should delete a vital record", async () => {
    const res = await request(app)
      .delete(`/api/vitals/${vitalId}`)
      .set("Authorization", `Bearer ${tokens.nurse}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({ success: true });
  });
});
