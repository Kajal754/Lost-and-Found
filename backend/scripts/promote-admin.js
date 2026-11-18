const dotenv = require("dotenv");
dotenv.config();
const { prisma } = require("../config/database");

async function promoteAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new Error("Set ADMIN_EMAIL in backend/.env first.");
  const result = await prisma.user.updateMany({ where: { email }, data: { role: "ADMIN" } });
  if (!result.count) throw new Error(`No registered account found for ${email}. Register that account before promoting it.`);
  console.log(`Administrator role granted to ${email}.`);
}

promoteAdmin().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
