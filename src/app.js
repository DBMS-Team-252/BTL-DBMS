const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.mdw");

BigInt.prototype.toJSON = function () {
    return this.toString();
};

const app = express();

// Middlewares
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

// Route test thử hệ thống
app.get("/api/ping", (req, res) => {
    res.json({ message: "Server đang chạy ngon lành!" });
});

// API routes
app.use("/api", routes);

// Global error handler (phải đặt sau cùng)
app.use(errorMiddleware);

module.exports = app;
