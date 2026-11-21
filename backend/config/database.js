const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const RETRYABLE_DATABASE_ERRORS = new Set(["P1001", "P1002", "P1017", "P2024"]);

async function retryDatabaseQuery(query, maxAttempts = 4) {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await query();
    } catch (error) {
      if (!RETRYABLE_DATABASE_ERRORS.has(error.code) || attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** (attempt - 1)));
    }
  }
}

async function connectDatabase() {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await prisma.$connect();
      await retryDatabaseQuery(() => prisma.$queryRaw`SELECT 1`);
      console.log("✅ PostgreSQL database connected");
      return;
    } catch (error) {
      if (error.code !== "P1001" || attempt === maxAttempts) {
        console.error("❌ Database connection failed:", error);
        throw error;
      }

      console.error(
        `Database connection attempt ${attempt}/${maxAttempts} failed; retrying.`,
        error
      );
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
}

module.exports = {
  prisma,
  connectDatabase,
  retryDatabaseQuery,
};
