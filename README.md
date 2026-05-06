# 🛒 E-Commerce Backend System (Node.js & Prisma)

Hệ thống Backend cho ứng dụng thương mại điện tử được xây dựng trên nền tảng Node.js, sử dụng Prisma làm ORM để tương tác với cơ sở dữ liệu MariaDB/MySQL. **Controller-Service-Model** giúp tách biệt logic nghiệp vụ và dễ dàng mở rộng.

## 🚀 Công nghệ sử dụng

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MariaDB / MySQL .
- **ORM:** Prisma .
- **Authentication:** JSON Web Token (JWT) với cơ chế Access & Refresh Token .
- **Validation:** Joi
- **Security:** Helmet, CORS, Bcryptjs

## 📂 Cấu trúc thư mục

```text
src
├── configs/          # Cấu hình Database (Prisma), Env .
├── controllers/      # Tiếp nhận Request và trả về Response qua Service .
├── middlewares/      # Xác thực (Auth), Phân quyền (Role), Bắt lỗi (Error) .
├── models/           # Định nghĩa các Model (Dựa trên Prisma Schema) .
├── routes/           # Khai báo các điểm cuối API (Endpoints) .
├── services/         # Xử lý logic nghiệp vụ lõi và tương tác DB .
├── utils/            # Các hàm tiện ích (Pagination, Response chuẩn hóa, AppError)
└── validations/      # Schema kiểm tra dữ liệu đầu vào (Joi)
```

## 🛠️ Cài đặt & Chạy dự án

1. **Clone dự án và cài đặt thư viện:**
   ```bash
   npm install
   ```

2. **Cấu hình môi trường:**
   Tạo file `.env` ở thư mục gốc và cấu hình các biến sau:
   ```env
   PORT=3000
   DATABASE_URL="mysql://user:password@localhost:3306/db_name"
   JWT_ACCESS_SECRET=your_access_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   ```

3. **Đồng bộ Database (Prisma):**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Chạy server:**
   ```bash
   # Chế độ phát triển
   npm run dev
   # Chế độ sản xuất
   npm start
   ```

## 🔐 Tính năng chính

### Người dùng (User Side)
- **Hệ thống Auth:** Đăng ký, đăng nhập và tự động làm mới token.
- **Sản phẩm:** Xem danh sách, lọc theo danh mục, giá, đánh giá và tìm kiếm.
- **Giỏ hàng:** Quản lý thêm/sửa/xóa sản phẩm trong giỏ.
- **Đơn hàng:** Quy trình Checkout (tạo đơn hàng, trừ giỏ hàng) và xem lịch sử.

### Quản trị viên (Admin Side)
- **Quản lý Sản phẩm & Danh mục:** CRUD đầy đủ cho sản phẩm và hệ thống danh mục đa cấp (Parent-Child).
- **Quản lý Tồn kho:** Theo dõi biến động stock, thực hiện giao dịch (IMPORT, EXPORT, ADJUST) và xem lịch sử giao dịch.
- **Quản lý Đơn hàng:** Cập nhật trạng thái đơn hàng. *Đặc biệt: Tự động hoàn kho khi hủy đơn*.
- **Thống kê (Dashboard):** Xem tổng quan doanh thu, người dùng, top sản phẩm bán chạy qua các câu lệnh SQL tối ưu.
- **Duyệt Đánh giá:** Kiểm soát và gỡ bỏ các đánh giá không phù hợp.

## 📝 Lưu ý cho Nhà phát triển

- **Xử lý BigInt:** Do cơ sở dữ liệu sử dụng kiểu `BigInt` cho các trường ID, hệ thống đã được cấu hình toàn cục trong `app.js` để tự động chuyển đổi `BigInt` sang `String` khi trả về JSON.
- **Xử lý lỗi:** Luôn sử dụng `catchAsync` khi viết Controller và ném lỗi qua `AppError` để `error.mdw.js` có thể xử lý và trả về định dạng lỗi chuẩn hóa.
- **Inventory Logic:** Khi cập nhật số lượng tồn kho, hãy luôn ghi lại vào bảng `inventory_transactions` để phục vụ việc truy xuất lịch sử biến động.