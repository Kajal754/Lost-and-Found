const { prisma } = require("../config/database");

async function adminMiddleware(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { role: true } });
    if (!user || user.role !== "ADMIN") return res.status(403).json({ success: false, message: "Administrator access is required" });
    next();
  } catch (error) {
    console.error("Admin authorization error:", error);
    return res.status(500).json({ success: false, message: "Could not verify administrator access" });
  }
}

module.exports = adminMiddleware;
