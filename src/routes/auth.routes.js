/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: Authentication endpoints
 */

console.log("✅ AUTH ROUTES LOADED", import.meta.url);

import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import auth from "../middleware/auth.js";
import { signToken } from "../utils/jwt.js";

const router = Router();

router.get("/ping", (req, res) => res.json({ ok: true, route: "auth router working" }));

// POST /auth/register
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                example: "test@example.com"
 *              password:
 *                type: string
 *                example: "Password123!"
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Missing or invalid fields
 *       409:
 *         description: Email already exists
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required" });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ ok: false, error: "Password must be at least 8 characters" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ ok: false, error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email: normalizedEmail, passwordHash },
      select: { id: true, email: true, createdAt: true },
    });

    const token = signToken({ sub: user.id });

    return res.status(201).json({ ok: true, user, token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ ok: false, error: "Invalid credentials" });
    }

    const token = signToken({ sub: user.id });

    return res.json({
      ok: true,
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

// GET /auth/me (protected)
router.get("/me", auth, async (req, res) => {
  return res.json({ ok: true, user: req.user });
});

export default router;
