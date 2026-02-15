import { Router } from "express";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";

const router = Router();

// Helper: ensure user is a member of project
async function requireMembership(projectId, userId) {
  return prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
}

/**
 * POST /projects/:projectId/tasks
 * Create task in a project (member-only).
 * Body: { title, description?, assignedToId? }
 */
router.post("/projects/:projectId/tasks", auth, async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedToId } = req.body || {};

  if (!title || !String(title).trim()) {
    return res.status(400).json({ ok: false, error: "Title is required" });
  }

  const membership = await requireMembership(projectId, req.user.id);
  if (!membership) {
    return res.status(404).json({ ok: false, error: "Project not found" });
  }

  // Optional: if assigning, ensure assignee is also a project member
  if (assignedToId) {
    const assigneeMembership = await requireMembership(projectId, assignedToId);
    if (!assigneeMembership) {
      return res.status(400).json({ ok: false, error: "Assignee must be a project member" });
    }
  }

  const task = await prisma.task.create({
    data: {
      title: String(title).trim(),
      description: description ? String(description) : null,
      projectId,
      createdById: req.user.id,
      assignedToId: assignedToId || null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      projectId: true,
      createdById: true,
      assignedToId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(201).json({ ok: true, task });
});

/**
 * GET /projects/:projectId/tasks
 * List tasks in a project (member-only).
 */
router.get("/projects/:projectId/tasks", auth, async (req, res) => {
  const { projectId } = req.params;

  const membership = await requireMembership(projectId, req.user.id);
  if (!membership) {
    return res.status(404).json({ ok: false, error: "Project not found" });
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      projectId: true,
      createdById: true,
      assignedToId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({ ok: true, tasks });
});

/**
 * PATCH /tasks/:taskId
 * Update task fields with permissions.
 * Body can include: { title?, description?, status?, assignedToId? }
 *
 * Rules:
 * - Must be a project member to edit anything
 * - Any member can update status/title/description
 * - Only task creator OR project OWNER/ADMIN can change assignedToId
 */
router.patch("/tasks/:taskId", auth, async (req, res) => {
  const { taskId } = req.params;
  const { title, description, status, assignedToId } = req.body || {};

  // 1) Load task (need projectId + createdById)
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      createdById: true,
      assignedToId: true,
    },
  });

  if (!task) {
    return res.status(404).json({ ok: false, error: "Task not found" });
  }

  // 2) Must be a member of the task’s project
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    select: { role: true },
  });

  if (!membership) {
    return res.status(404).json({ ok: false, error: "Task not found" }); // hide existence
  }

  // 3) Validate status if provided
  if (status && !["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
    return res.status(400).json({ ok: false, error: "Invalid status" });
  }

  // 4) If assigning, enforce permissions
  const wantsToChangeAssignee = Object.prototype.hasOwnProperty.call(req.body || {}, "assignedToId");
  if (wantsToChangeAssignee) {
    const canAssign =
      task.createdById === req.user.id || ["OWNER", "ADMIN"].includes(membership.role);

    if (!canAssign) {
      return res.status(403).json({ ok: false, error: "Forbidden to change assignee" });
    }

    // If assigning to a user (not null), ensure assignee is a project member
    if (assignedToId) {
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: task.projectId, userId: assignedToId } },
      });
      if (!assigneeMembership) {
        return res.status(400).json({ ok: false, error: "Assignee must be a project member" });
      }
    }
  }

  // 5) Build update data safely
  const data = {};
  if (title !== undefined) data.title = title ? String(title).trim() : "";
  if (description !== undefined) data.description = description ? String(description) : null;
  if (status !== undefined) data.status = status;
  if (wantsToChangeAssignee) data.assignedToId = assignedToId || null;

  if (data.title === "") {
    return res.status(400).json({ ok: false, error: "Title cannot be empty" });
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data,
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      projectId: true,
      createdById: true,
      assignedToId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.json({ ok: true, task: updated });
});

export default router;