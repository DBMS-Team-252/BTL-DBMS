const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const mariadb = require("mariadb");
require("dotenv").config();

const pool = mariadb.createPool({
    host: process.env.DATABASE_IP,
    user: "root",
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5,
});

const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Kết nối MySQL qua Prisma thành công!");
    } catch (error) {
        console.error("❌ Lỗi kết nối Database:", error);
        process.exit(1);
    }
};

module.exports = { prisma, connectDB };
