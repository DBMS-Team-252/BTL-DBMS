const { Prisma } = require("@prisma/client");
const { getPrisma } = require("../configs/database");

/**
 * Tổng quan (overview)
 * Sử dụng Subquery và Aggregate
 */
const getOverview = async () => {
    const prisma = getPrisma();
    
    // Câu lệnh SQL RAW chứa subquery và aggregate
    const result = await prisma.$queryRaw`
        SELECT 
            (SELECT COUNT(id) FROM users WHERE role = 'USER' AND status != 'DELETED') AS total_users,
            (SELECT COUNT(id) FROM orders WHERE status != 'CANCELLED') AS total_orders,
            (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'PAID') AS total_revenue
    `;

    // $queryRaw trả về mảng, lấy phần tử đầu tiên
    const overview = result[0];

    return {
        total_users: Number(overview.total_users),
        total_orders: Number(overview.total_orders),
        total_revenue: Number(overview.total_revenue || 0)
    };
};

/**
 * Phân tích (analytics)
 * Sử dụng JOIN, Aggregate, Subquery
 */
const getAnalytics = async (startDate, endDate) => {
    const prisma = getPrisma();

    // Điều kiện thời gian cho SQL
    let dateFilter = Prisma.empty;
    if (startDate && endDate) {
        // Cần đảm bảo định dạng date chuẩn hoặc convert
        dateFilter = Prisma.sql`AND o.created_at BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}`;
    }

    // 1. Doanh thu theo thời gian (sử dụng GROUP BY, Aggregate)
    const revenueByTimeRaw = await prisma.$queryRaw`
        SELECT DATE(o.created_at) as date, SUM(o.total) as revenue
        FROM orders o
        WHERE o.status = 'PAID' ${dateFilter}
        GROUP BY DATE(o.created_at)
        ORDER BY date ASC
    `;

    const revenueByTime = revenueByTimeRaw.map(r => ({
        date: r.date,
        revenue: Number(r.revenue || 0)
    }));

    // 2. Top sản phẩm bán chạy nhất (JOIN 3 bảng, Aggregate)
    const topProductsRaw = await prisma.$queryRaw`
        SELECT p.id, p.name, CAST(SUM(oi.quantity) AS UNSIGNED) as total_sold
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status = 'PAID' ${dateFilter}
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 5
    `;

    const topProducts = topProductsRaw.map(p => ({
        id: p.id.toString(),
        name: p.name,
        total_sold: Number(p.total_sold)
    }));

    // 3. Top khách hàng (JOIN 2 bảng, Aggregate)
    const topCustomersRaw = await prisma.$queryRaw`
        SELECT u.id, u.name, u.email, SUM(o.total) as total_spent
        FROM users u
        JOIN orders o ON u.id = o.user_id
        WHERE o.status = 'PAID' ${dateFilter}
        GROUP BY u.id, u.name, u.email
        ORDER BY total_spent DESC
        LIMIT 5
    `;

    const topCustomers = topCustomersRaw.map(c => ({
        id: c.id.toString(),
        name: c.name,
        email: c.email,
        total_spent: Number(c.total_spent)
    }));

    // 4. Tỷ lệ chuyển đổi (Subquery, Aggregate)
    // Tỷ lệ chuyển đổi = (Số đơn hàng PAID / Tổng số đơn hàng) * 100
    // Chú ý: Ở đây không thể inject dateFilter thẳng vào điều kiện subquery được dễ dàng nếu alias khác nhau, 
    // Tuy nhiên Prisma cho phép dùng string template nếu biến đó không phụ thuộc alias hoặc ta viết riêng.
    let dateFilterForConversion = Prisma.empty;
    if (startDate && endDate) {
        dateFilterForConversion = Prisma.sql`AND created_at BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}`;
    }

    const conversionRateRaw = await prisma.$queryRaw`
        SELECT 
            (SELECT COUNT(*) FROM orders WHERE status = 'PAID' ${dateFilterForConversion}) as paid_orders,
            (SELECT COUNT(*) FROM orders WHERE 1=1 ${dateFilterForConversion}) as total_orders
    `;

    const paidOrders = Number(conversionRateRaw[0].paid_orders);
    const totalOrders = Number(conversionRateRaw[0].total_orders);
    const conversionRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(2) : 0;

    return {
        revenueByTime,
        topProducts,
        topCustomers,
        conversionRate: Number(conversionRate)
    };
};

module.exports = {
    getOverview,
    getAnalytics
};
