
import pkg from "../app/generated/prisma/index.js";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function checkTables() {
  try {

    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log("Tables in database:", tables);
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();