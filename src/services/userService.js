/* eslint-disable no-useless-catch */
/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { userModel } from "~/models/userModel"

// 🟢 Đăng ký tài khoản mới
const register = async (data) => {
  console.log("📩 Dữ liệu nhận được:", data)

  // ✅ 1. kiểm tra thiếu dữ liệu TRƯỚC, dùng raw data, không trim
  const { email, username, password, phone, role } = data || {}

  if (!email || !username || !password || !phone) {
    throw new Error("Thiếu dữ liệu")
  }

  // ✅ 2. Sau khi chắc chắn có đủ field mới trim/chuẩn hóa
  const cleanEmail = email.trim().toLowerCase()
  const cleanUsername = username.trim()
  const cleanPhone = phone.trim()

  // Nếu trim xong còn rỗng -> cũng coi là thiếu dữ liệu
  if (!cleanEmail || !cleanUsername || !cleanPhone || !password.trim()) {
    throw new Error("Thiếu dữ liệu")
  }

  // ✅ 3. Validate định dạng username
  const usernameRegex = /^[a-z0-9_]+$/
  if (!usernameRegex.test(cleanUsername)) {
    throw new Error(
      "Username chỉ được chứa chữ thường, số hoặc dấu gạch dưới, không dấu và không khoảng trắng!"
    )
  }

  // ✅ 4. Kiểm tra trùng username
  const existUsername = await userModel.findByUsername(cleanUsername.toLowerCase())
  if (existUsername) {
    throw new Error("Username đã tồn tại")
  }

  // ✅ 5. Kiểm tra trùng email
  const existEmail = await userModel.findByEmail(cleanEmail)
  if (existEmail) {
    throw new Error("Email đã tồn tại")
  }

  // ✅ 6. Hash password & tạo user
  const hashedPassword = await bcrypt.hash(password, 10)

  const result = await userModel.createNew({
    username: cleanUsername.toLowerCase(),
    email: cleanEmail,
    password: hashedPassword,
    phone: cleanPhone,
    role: role || "user",
    createdAt: new Date(),
    updatedAt: new Date()
  })

  console.log("✅ Đăng ký thành công:", result.insertedId)

  return {
    id: result.insertedId,
    username: cleanUsername.toLowerCase(),
    email: cleanEmail,
    phone: cleanPhone,
    role: role || "user"
  }
}

// 🟢 Đăng nhập
const login = async ({ identifier, password }) => {
  const loginInput = identifier?.trim().toLowerCase()
  if (!loginInput || !password)
    throw new Error("Thiếu username/email hoặc mật khẩu")

  const user =
    (await userModel.findByEmail(loginInput)) ||
    (await userModel.findByUsername(loginInput))

  if (!user) throw new Error("User not found")

  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error("Sai mật khẩu")

  // ✅ Token có đầy đủ userId, username, role
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  )

  console.log("✅ Đăng nhập thành công:", user.username)

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  }
}


// ⭐ THÊM FUNCTION NÀY - QUAN TRỌNG!
const findOneById = async (id) => {
  try {
    console.log('🔍 [userService.findOneById] Looking for user ID:', id)
    const user = await userModel.findOneById(id)
    console.log('✅ [userService.findOneById] Found:', user ? 'YES' : 'NO')
    return user
  } catch (error) {
    console.error('❌ [userService.findOneById] Error:', error)
    throw error
  }
}
const resetPassword = async (username, phone, newPassword) => {
  try {
    // Tìm user theo username và phone
    const user = await userModel.findByUsernameAndPhone(username, phone)
    if (!user) {
      throw new Error("Không tìm thấy tài khoản với thông tin này")
    }

    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Cập nhật mật khẩu
    const updated = await userModel.updatePassword(user._id.toString(), hashedPassword)

    return {
      success: true,
      message: "Đặt lại mật khẩu thành công"
    };
  } catch (error) {
    throw error
  }
}

// 🟢 Các hàm khác
const getAll = async () => userModel.getAll()
const getById = async (id) => userModel.findOneById(id)
const create = async (data) => userModel.createNew(data)
const update = async (id, data) => userModel.update(id, data)
const remove = async (id) => userModel.deleteOne(id)

// ⭐ EXPORT ĐẦY ĐỦ
export const userService = {
  register,
  login,
  findOneById,
  getAll,
  getById,
  create,
  update,
  remove,
  resetPassword
}