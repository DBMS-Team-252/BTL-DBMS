const { getPrisma } = require("../configs/database");
const { getPaginationOptions, formatPagingData } = require("../utils/pagination");

/**
 * Lấy danh sách người dùng với phân trang
 */
const getUsers = async (query) => {
    const prisma = getPrisma();
    const { page, limit } = query;

    const { skip, take } = getPaginationOptions(page, limit);

    // Xây dựng điều kiện lọc
    const whereCondition = {};
    if (query.search) {
        whereCondition.OR = [
            { name: { contains: query.search } },
            { email: { contains: query.search } },
            { phone: { contains: query.search } }
        ];
    }
    if (query.role) {
        whereCondition.role = query.role;
    }
    if (query.status) {
        whereCondition.status = query.status;
    }

    // Thực hiện đếm tổng số bản ghi và lấy dữ liệu
    const [totalItems, usersData] = await Promise.all([
        prisma.users.count({ where: whereCondition }),
        prisma.users.findMany({
            where: whereCondition,
            skip,
            take,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                created_at: true,
            },
            orderBy: {
                created_at: 'desc' // Người dùng mới nhất lên trước
            }
        })
    ]);

    // Format lại dữ liệu (chuyển đổi BigInt sang String)
    const formattedData = usersData.map(user => ({
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        created_at: user.created_at
    }));

    // Trả về dữ liệu đã được chuẩn hóa theo chuẩn phân trang
    return formatPagingData(formattedData, page, limit, totalItems);
};

/**
 * Cập nhật thông tin user (tên, số điện thoại)
 */
const updateUser = async (id, data) => {
    const prisma = getPrisma();
    const user = await prisma.users.update({
        where: { id: BigInt(id) },
        data: {
            name: data.name,
            phone: data.phone
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
        }
    });
    return { ...user, id: user.id.toString() };
};

/**
 * Thay đổi quyền của user
 */
const changeRole = async (id, role) => {
    const prisma = getPrisma();
    const user = await prisma.users.update({
        where: { id: BigInt(id) },
        data: { role },
        select: {
            id: true,
            role: true,
        }
    });
    return { ...user, id: user.id.toString() };
};

/**
 * Vô hiệu hóa user (đổi status thành DISABLE)
 */
const disableUser = async (id) => {
    const prisma = getPrisma();
    const user = await prisma.users.update({
        where: { id: BigInt(id) },
        data: { status: 'DISABLE' },
        select: {
            id: true,
            status: true,
        }
    });
    return { ...user, id: user.id.toString() };
};

module.exports = {
    getUsers,
    updateUser,
    changeRole,
    disableUser
};
