/* eslint-disable no-undef */
/* eslint-disable no-console */
/* eslint-disable quotes */
import { userService } from "~/services/userService"

// 🟢 Đăng ký
const register = async (req, res) => {
  try {
    const user = await userService.register(req.body)

    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: user
    })
  } catch (error) {
    console.error("❌ Lỗi register:", error.message)

    // 🎯 Những lỗi do người dùng nhập sai → trả về 400
    const badRequestErrors = [
      "Thiếu dữ liệu",
      "Username đã tồn tại",
      "Email đã tồn tại",
      "Username chỉ được chứa chữ thường, số hoặc dấu gạch dưới, không dấu và không khoảng trắng!"
    ]

    if (badRequestErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    // 🎯 Các lỗi khác: server lỗi, database lỗi → 500
    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}


// 🟢 Đăng nhập
// 🟢 Đăng nhập
const login = async (req, res) => {
  try {
    const result = await userService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token: result.token,
      user: result.user
    });

  } catch (error) {
    console.error("❌ Lỗi login:", error.message);

    // ⭐ Nếu là lỗi người dùng → trả về 400
    const userErrors = [
      "Thiếu username/email hoặc mật khẩu",
      "User not found",
      "Sai mật khẩu",
      "Thiếu dữ liệu"
    ];

    if (userErrors.includes(error.message)) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // ⭐ Còn lại là lỗi server thật → 500
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


const getCurrentUser = async (req, res, next) => {
  try {
    console.log('👤 [getCurrentUser] Fetching current user info...')
    console.log('User from token:', req.user)

    // ⬅️ SỬA: Token lưu `id` chứ không phải `userId`
    const userId = req.user.id || req.user.userId

    if (!userId) {
      throw new Error('Missing userId in token')
    }

    console.log('🔍 Finding user with ID:', userId)

    const user = await userService.findOneById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    console.log('✅ User found:', user.username)

    res.status(200).json({
      success: true,
      message: 'Get current user successfully',
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  } catch (error) {
    console.error('❌ [getCurrentUser] Error:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}
// 🟢 CRUD khác
const getAll = async (req, res) => {
  try {
    const users = await userService.getAll()
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getById = async (req, res) => {
  try {
    const user = await userService.getById(req.params.id)
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy user" })
    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const newUser = await userService.create(req.body)
    res.status(201).json({ success: true, data: newUser })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const updated = await userService.update(req.params.id, req.body)
    if (!updated) return res.status(404).json({ success: false, message: "Không tìm thấy user" })
    res.status(200).json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    const deleted = await userService.remove(req.params.id)
    if (!deleted) return res.status(404).json({ success: false, message: "Không tìm thấy user" })
    res.status(200).json({ success: true, message: "Xóa thành công" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const resetPassword = async (req, res) => {
  try {
    const { username, phone, newPassword } = req.body;

    if (!username || !phone || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: username, phone hoặc mật khẩu mới"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mới phải có ít nhất 6 ký tự"
      });
    }

    const result = await userService.resetPassword(username, phone, newPassword);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error("❌ Lỗi reset password:", error.message);

    const userErrors = [
      "Không tìm thấy tài khoản với thông tin này"
    ];

    if (userErrors.includes(error.message)) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

export const userController = {
  register,
  login,
  getCurrentUser,
  getAll,
  getById,
  create,
  update,
  remove,
  resetPassword
}
