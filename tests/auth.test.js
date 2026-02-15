import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("Auth flow", () => {
  const email = `test_${Date.now()}@example.com`;
  const password = "Password123!";
  let token;

  beforeAll(async () => {
    // Ensure DB is reachable
    await prisma.$connect();
  });

  afterAll(async () => {
    // Cleanup test user
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it("registers a user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email, password })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.email).toBe(email);
    expect(typeof res.body.token).toBe("string");
  });

  it("logs in and returns a token", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email, password })
      .set("Content-Type", "application/json");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.email).toBe(email);
    expect(typeof res.body.token).toBe("string");

    token = res.body.token;
  });

  it("gets /auth/me with token", async () => {
    const res = await request(app)
      .get("/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.user.email).toBe(email);
  });
});
