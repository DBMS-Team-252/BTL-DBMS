const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPrisma } = require("../configs/database");
const AppError = require("../utils/AppError");


// In-memory blacklist cho refresh token (logout)
// Lưu ý: sẽ mất khi restart server — phù hợp môi trường học tập/bài tập
const refreshTokenBlacklist = new Set();

/**
 * Sinh cặp access + refresh token
 * @param {{ id: BigInt, role: string }} user
 */
const generateTokens = (user) => {
    const payload = {
        sub: user.id.toString(), // BigInt → string để JSON serializable
        role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    });

    return { accessToken, refreshToken };
};

/**
 * Đăng ký user mới
 */
const register = async ({ name, email, phone, password }) => {
    // Kiểm tra email trùng
    const existing = await getPrisma().users.findUnique({ where: { email } });
    if (existing) {
        throw new AppError("Email đã được sử dụng", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await getPrisma().users.create({
        data: { name, email, phone, password: hashedPassword },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            created_at: true,
        },
    });

    // BigInt → string
    return { ...user, id: user.id.toString() };
};

/**
 * Đăng nhập
 */
const login = async (email, password) => {
    const user = await getPrisma().users.findUnique({ where: { email } });
    if (!user) {
        throw new AppError("Email không tồn tại", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Mật khẩu không đúng", 401);
    }

    const { accessToken, refreshToken } = generateTokens(user);

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

/**
 * Đăng xuất — blacklist refresh token
 */
const logout = (refreshToken) => {
    refreshTokenBlacklist.add(refreshToken);
};

/**
 * Làm mới access token bằng refresh token
 */
const refresh = async (refreshToken) => {
    // Kiểm tra blacklist
    if (refreshTokenBlacklist.has(refreshToken)) {
        throw new AppError("Refresh token đã bị thu hồi", 401);
    }

    let payload;
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            throw new AppError("Refresh token đã hết hạn, vui lòng đăng nhập lại", 401);
        }
        throw new AppError("Refresh token không hợp lệ", 401);
    }

    // Kiểm tra user còn tồn tại trong DB
    const user = await getPrisma().users.findUnique({
        where: { id: BigInt(payload.sub) },
        select: { id: true, role: true },
    });
    if (!user) {
        throw new AppError("User không tồn tại", 401);
    }

    const newAccessToken = jwt.sign(
        { sub: user.id.toString(), role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m" }
    );

    return { accessToken: newAccessToken };
};

module.exports = { register, login, logout, refresh };
