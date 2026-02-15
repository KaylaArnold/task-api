import prisma from "../lib/prisma.js";
import { verifyToken } from "../utils/jwt.js";

export default async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const [type, token] = header.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ ok: false, error: "Missing Bearer token" });
    }

    const decoded = verifyToken(token); // { sub: userId, ... }

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      return res.status(401).json({ ok: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: "Invalid or expired token" });
  }
}
