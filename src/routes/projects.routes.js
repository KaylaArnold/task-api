/**
 * @openapi
 * tags:
 *   - name: Projects
 *     description: Project management endpoints
 */

import { Router } from "express";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

const router = Router();
router.get("/ping", (req, res) => res.json({ ok: true, route: "projects" }));


/**
 * POST /projects
 * Create a project and auto-add creator as OWNER.
 */
router.post("/", auth, async (req, res) => {
  const { name } = req.body || {};
  if (!name || !String(name).trim()) {
    return res.status(400).json({ ok: false, error: "Project name is required" });
  }

  const project = await prisma.project.create({
    data: {
      name: String(name).trim(),
      createdById: req.user.id,
      members: {
        create: {
          userId: req.user.id,
          role: "OWNER",
        },
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      createdById: true,
    },
  });

  return res.status(201).json({ ok: true, project });
});

/**
 * GET /projects
 * List projects where current user is a member.
 */
router.get("/", auth, async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      members: {
        some: { userId: req.user.id },
      },
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      members: {
        select: { userId: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ ok: true, projects });
});

/**
 * POST /projects/:id/members
 * Add a member (OWNER/ADMIN only)
 * Body: { email, role }
 */
router.post("/:id/members", auth, async (req, res) => {
  const projectId = req.params.id;
  const { email, role } = req.body || {};

  const normalizedEmail = String(email || "").trim().toLowerCase();
  const desiredRole = role || "MEMBER";

  if (!normalizedEmail) {
    return res.status(400).json({ ok: false, error: "Member email is required" });
  }
  if (!["MEMBER", "ADMIN"].includes(desiredRole)) {
    return res.status(400).json({ ok: false, error: "Role must be MEMBER or ADMIN" });
  }

  // 1) Check requester membership + role
  const requester = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: req.user.id } },
  });

  if (!requester) {
    return res.status(404).json({ ok: false, error: "Project not found" });
  }
  if (!["OWNER", "ADMIN"].includes(requester.role)) {
    return res.status(403).json({ ok: false, error: "Forbidden" });
  }

  // 2) Find user by email
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    return res.status(404).json({ ok: false, error: "User not found" });
  }

  // 3) Upsert membership (create if not exists; update role if exists)
  const membership = await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId: user.id } },
    update: { role: desiredRole },
    create: { projectId, userId: user.id, role: desiredRole },
    select: { projectId: true, userId: true, role: true, createdAt: true },
  });

  return res.status(201).json({ ok: true, membership });
});

export default router;
