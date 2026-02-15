import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import prisma from "../src/lib/prisma.js";

describe("RBAC", () => {
  const ownerEmail = `owner_${Date.now()}@example.com`;
  const memberEmail = `member_${Date.now()}@example.com`;
  const password = "Password123!";

  let ownerToken, memberToken;
  let ownerId, memberId;
  let projectId, taskId;

  beforeAll(async () => {
    await prisma.$connect();

    // register owner
    const r1 = await request(app).post("/auth/register").send({ email: ownerEmail, password });
    ownerToken = r1.body.token;
    ownerId = r1.body.user.id;

    // register member
    const r2 = await request(app).post("/auth/register").send({ email: memberEmail, password });
    memberToken = r2.body.token;
    memberId = r2.body.user.id;

    // owner creates project
    const p = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ name: "RBAC Project" });
   
    const ping = await request(app).get("/projects/ping");
    if (ping.status !== 200) {
      throw new Error(`GET /projects/ping failed: ${ping.status} ${ping.text}`);
    }

    if (p.status !== 201) {
      // This will show EXACTLY what's happening (404, 401, etc.)
      throw new Error(`POST /projects failed: ${p.status} ${JSON.stringify(p.body)}`);
    }

    projectId = p.body.project.id;

    // owner adds member
    await request(app)
      .post(`/projects/${projectId}/members`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ email: memberEmail, role: "MEMBER" });

    // owner creates task
    const t = await request(app)
      .post(`/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "RBAC Task" });
    taskId = t.body.task.id;
  });

  afterAll(async () => {
    // clean up (delete project cascades tasks + members)
    if (projectId) await prisma.project.delete({ where: { id: projectId } });
    await prisma.user.deleteMany({ where: { email: { in: [ownerEmail, memberEmail] } } });
    await prisma.$disconnect();
  });

  it("member cannot change assignee", async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ assignedToId: ownerId });

    expect(res.status).toBe(403);
    expect(res.body.ok).toBe(false);
  });

  it("owner can change assignee", async () => {
    const res = await request(app)
      .patch(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ assignedToId: memberId });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.task.assignedToId).toBe(memberId);
  });
});
