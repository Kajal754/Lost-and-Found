const { prisma } = require("../config/database");

async function getOverview(req, res) {
  try {
    const [users, lostItems, foundItems, pendingClaims, returnedClaims, returnedEvents, lost, found] = await Promise.all([
      prisma.user.count(), prisma.lostItem.count(), prisma.foundItem.count(),
      prisma.recoveryClaim.count({ where: { status: "pending" } }),
      prisma.recoveryClaim.count({ where: { status: "returned" } }),
      prisma.recoveryVerification.findMany({ where: { action: "returned" }, select: { createdAt: true } }),
      prisma.lostItem.findMany({ where: { status: { in: ["lost", "returned"] } }, select: { id: true, title: true, category: true, location: true, status: true, createdAt: true, user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 500 }),
      prisma.foundItem.findMany({ where: { status: { in: ["found", "returned"] } }, select: { id: true, title: true, category: true, location: true, status: true, createdAt: true, user: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 500 }),
    ]);
    const monthCounts = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (5 - index));
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return { month: key, returned: returnedEvents.filter((event) => event.createdAt.toISOString().slice(0, 7) === key).length };
    });
    const allItems = [...lost.map((item) => ({ ...item, type: "lost" })), ...found.map((item) => ({ ...item, type: "found" }))];
    const normalize = (text) => String(text || "").toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim();
    const suspicious = allItems.filter((item, index) => {
      const title = normalize(item.title);
      return title.length > 3 && allItems.some((other, otherIndex) => otherIndex !== index && item.type === other.type && item.category.toLowerCase() === other.category.toLowerCase() && (title === normalize(other.title) || title.includes(normalize(other.title)) || normalize(other.title).includes(title)));
    }).slice(0, 30);
    return res.json({ success: true, stats: { users, lostItems, foundItems, pendingClaims, returnedClaims, monthlyRecoveries: monthCounts }, suspicious, recentItems: allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 30) });
  } catch (error) {
    console.error("Admin overview error:", error);
    return res.status(500).json({ success: false, message: "Failed to load admin dashboard" });
  }
}

async function listUsers(req, res) {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { lostItems: true, foundItems: true } } }, orderBy: { createdAt: "desc" }, take: 500 });
    return res.json({ success: true, users });
  } catch (error) { console.error("Admin users error:", error); return res.status(500).json({ success: false, message: "Failed to fetch users" }); }
}

async function setUserRole(req, res) {
  const userId = Number(req.params.id), role = req.body.role;
  if (!Number.isInteger(userId) || userId < 1 || !["USER", "ADMIN"].includes(role)) return res.status(400).json({ success: false, message: "Invalid user or role" });
  if (userId === req.user.id && role !== "ADMIN") return res.status(409).json({ success: false, message: "You cannot remove your own administrator role" });
  try {
    const user = await prisma.user.update({ where: { id: userId }, data: { role }, select: { id: true, name: true, email: true, role: true } });
    return res.json({ success: true, user });
  } catch (error) { console.error("Admin role update error:", error); return res.status(500).json({ success: false, message: "Failed to update role" }); }
}

async function updateItemStatus(req, res) {
  const id = Number(req.params.id), { type } = req.params, { status } = req.body;
  const model = type === "lost" ? prisma.lostItem : type === "found" ? prisma.foundItem : null;
  const allowed = type === "lost" ? ["lost", "returned"] : ["found", "claimed", "returned"];
  if (!model || !Number.isInteger(id) || id < 1 || !allowed.includes(status)) return res.status(400).json({ success: false, message: "Invalid report status" });
  try { const item = await model.update({ where: { id }, data: { status } }); return res.json({ success: true, item }); }
  catch (error) { console.error("Admin report status error:", error); return res.status(404).json({ success: false, message: "Report not found" }); }
}

async function deleteItem(req, res) {
  const id = Number(req.params.id), model = req.params.type === "lost" ? prisma.lostItem : req.params.type === "found" ? prisma.foundItem : null;
  if (!model || !Number.isInteger(id) || id < 1) return res.status(400).json({ success: false, message: "Invalid report" });
  try { await model.delete({ where: { id } }); return res.json({ success: true }); }
  catch (error) { console.error("Admin report delete error:", error); return res.status(404).json({ success: false, message: "Report not found" }); }
}

module.exports = { getOverview, listUsers, setUserRole, updateItemStatus, deleteItem };
