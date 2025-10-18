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

  // Làm sạch dữ liệu đầu vào
  const cleanEmail = data.email?.trim().toLowerCase()
  const cleanUsername = data.username?.trim()
  const cleanPhone = data.phone?.trim()

  // 🧩 Validate đầu vào
  if (!cleanEmail || !data.password || !cleanPhone || !cleanUsername) {
    throw new Error("Thiếu dữ liệu")
  }

  // 🔎 Kiểm tra username hợp lệ: chỉ chữ thường, không dấu, không khoảng trắng
  const usernameRegex = /^[a-z0-9_]+$/
  if (!usernameRegex.test(cleanUsername)) {
    throw new Error(
      "Username chỉ được chứa chữ thường, số hoặc dấu gạch dưới, không dấu và không khoảng trắng!"
    )
  }

  // Kiểm tra trùng username (không phân biệt hoa thường)
  const existUsername = await userModel.findByUsername(cleanUsername.toLowerCase())
  if (existUsername) throw new Error("Username đã tồn tại")

  // Kiểm tra trùng email
  const existEmail = await userModel.findByEmail(cleanEmail)
  if (existEmail) throw new Error("Email đã tồn tại")

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Lưu vào database
  const result = await userModel.createNew({
    username: cleanUsername.toLowerCase(), // luôn lưu dạng chữ thường
    email: cleanEmail,
    password: hashedPassword,
    phone: cleanPhone,
    role: data.role || "user",
    createdAt: new Date(),
    updatedAt: new Date()
  })

  console.log("✅ Đăng ký thành công:", result.insertedId)

  return {
    id: result.insertedId,
    username: cleanUsername.toLowerCase(),
    email: cleanEmail,
    phone: cleanPhone,
    role: data.role || "user"
  }
}

// 🟢 Đăng nhập
const login = async ({ identifier, password }) => {
  const loginInput = identifier?.trim().toLowerCase()
  if (!loginInput || !password)
    throw new Error("Thiếu username/email hoặc mật khẩu")

  // Tìm user bằng email hoặc username (đều lowercase)
  const user =
    (await userModel.findByEmail(loginInput)) ||
    (await userModel.findByUsername(loginInput))

  if (!user) throw new Error("User not found")

  // So khớp mật khẩu
  const match = await bcrypt.compare(password, user.password)
  if (!match) throw new Error("Sai mật khẩu")

  // Tạo token JWT
  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
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

// 🟢 Các hàm khác
const getAll = async () => userModel.getAll()
const getById = async (id) => userModel.findOneById(id)
const create = async (data) => userModel.createNew(data)
const update = async (id, data) => userModel.update(id, data)
const remove = async (id) => userModel.deleteOne(id)

// 🟢 Export tất cả
export const userService = {
  register,
  login,
  getAll,
  getById,
  create,
  update,
  remove
}
