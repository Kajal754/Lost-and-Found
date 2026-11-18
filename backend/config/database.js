const { PrismaClient } = require("../generated/prisma");

const prisma = new PrismaClient();

async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL database connected");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

module.exports = {
  prisma,
  connectDatabase,
};
