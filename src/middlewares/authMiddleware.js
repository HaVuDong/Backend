/* eslint-disable no-console */
/* eslint-disable quotes */
import jwt from "jsonwebtoken"

// ============================================
// 1. AUTH MIDDLEWARE - Kiểm tra JWT Token
// ============================================
export const authMiddleware = (req, res, next) => {
  try {
    console.log("🔐 [authMiddleware] Checking authentication...")

    // Lấy token từ header Authorization: Bearer <token>
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    console.log("🎫 JWT Token:", token ? "✅ Có" : "❌ Không có")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token xác thực. Vui lòng đăng nhập."
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    console.log("✅ Token hợp lệ!")
    console.log("👤 Decoded token:", decoded)

    // ⭐ CHUẨN HÓA req.user (luôn có _id)
    req.user = {
      _id: decoded._id || decoded.userId || decoded.id, // ⭐ Ưu tiên _id
      userId: decoded.userId || decoded._id || decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    }

    console.log("✅ req.user standardized:", req.user)

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

// ============================================
// 2. IS ADMIN - Kiểm tra role Admin
// ============================================
export const isAdmin = (req, res, next) => {
  try {
    console.log("👑 [isAdmin] Checking admin permission...")
    console.log("User role:", req.user?.role)

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập trước"
      })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập. Chỉ Admin mới được phép."
      })
    }

    console.log("✅ Admin permission granted!")
    next()
  } catch (error) {
    console.error("❌ [isAdmin] Error:", error.message)
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    })
  }
}

// ============================================
// 3. IS USER - Kiểm tra role User
// ============================================
export const isUser = (req, res, next) => {
  try {
    console.log("👤 [isUser] Checking user permission...")

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập trước"
      })
    }

    // User hoặc Admin đều có thể truy cập
    if (req.user.role !== 'user' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Không có quyền truy cập"
      })
    }

    console.log("✅ User permission granted!")
    next()
  } catch (error) {
    console.error("❌ [isUser] Error:", error.message)
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    })
  }
}

// ============================================
// 4. IS OWNER - Kiểm tra quyền sở hữu
// ============================================
export const isOwner = (req, res, next) => {
  try {
    console.log("🔑 [isOwner] Checking ownership...")

    // Lấy userId từ params, query hoặc body
    const targetUserId = req.params.userId || req.query.userId || req.body.userId

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập trước"
      })
    }

    // Admin có thể truy cập mọi data
    if (req.user.role === 'admin') {
      console.log("✅ Admin can access all data")
      return next()
    }

    // User chỉ truy cập data của mình
    if (req.user._id.toString() !== targetUserId) {
      return res.status(403).json({
        success: false,
        message: "Bạn chỉ có thể truy cập dữ liệu của chính mình"
      })
    }

    console.log("✅ Owner verified!")
    next()
  } catch (error) {
    console.error("❌ [isOwner] Error:", error.message)
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập"
    })
  }
}