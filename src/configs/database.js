const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
require("dotenv").config({ override: true });


let prisma = null;

/**
 * Kết nối DB — lazy init để đảm bảo env đã được load trước.
 * Truyền DATABASE_URL (connection string) trực tiếp vào PrismaMariaDb adapter.
 */
const connectDB = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error("Missing DATABASE_URL in environment variables.");
        }

        const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
        prisma = new PrismaClient({ adapter });

        await prisma.$connect();
        console.log("✅ Kết nối MySQL qua Prisma thành công!");
    } catch (error) {
        console.error("❌ Lỗi kết nối Database:", error);
        process.exit(1);
    }
};

/**
 * Lấy prisma instance (đảm bảo đã gọi connectDB trước)
 */
const getPrisma = () => {
    if (!prisma) throw new Error("Database chưa được kết nối. Hãy gọi connectDB() trước.");
    return prisma;
};

module.exports = { getPrisma, connectDB };
