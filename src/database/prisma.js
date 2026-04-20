const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL, // porta 6543, rápido
});

const prisma = new PrismaClient({ adapter });

module.exports = prisma;