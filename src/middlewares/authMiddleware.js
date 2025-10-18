/* eslint-disable no-console */
/* eslint-disable quotes */
import jwt from "jsonwebtoken"

export const authMiddleware = (req, res, next) => {
  try {
    console.log("🔐 [authMiddleware] Checking authentication...")

    // ✅ Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    console.log("🎫 JWT Token:", token ? "✅ Có" : "❌ Không có")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực. Vui lòng đăng nhập."
      })
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("✅ Token hợp lệ!")
    console.log("👤 User info:", {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    })

    // Gắn thông tin user vào request
    req.user = decoded
    next()
  } catch (error) {
    console.error("❌ [authMiddleware] Lỗi xác thực:", error.message)

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn. Vui lòng đăng nhập lại."
      })
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ."
      })
    }

    return res.status(401).json({
      success: false,
      message: "Xác thực thất bại"
    })
  }
}
