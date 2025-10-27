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

  const cleanEmail = data.email?.trim().toLowerCase()
  const cleanUsername = data.username?.trim()
  const cleanPhone = data.phone?.trim()

  if (!cleanEmail || !data.password || !cleanPhone || !cleanUsername) {
    throw new Error("Thiếu dữ liệu")
  }

  const usernameRegex = /^[a-z0-9_]+$/
  if (!usernameRegex.test(cleanUsername)) {
    throw new Error(
      "Username chỉ được chứa chữ thường, số hoặc dấu gạch dưới, không dấu và không khoảng trắng!"
    )
  }

  const existUsername = await userModel.findByUsername(cleanUsername.toLowerCase())
  if (existUsername) throw new Error("Username đã tồn tại")

  const existEmail = await userModel.findByEmail(cleanEmail)
  if (existEmail) throw new Error("Email đã tồn tại")

  const hashedPassword = await bcrypt.hash(data.password, 10)

  const result = await userModel.createNew({
    username: cleanUsername.toLowerCase(),
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
  findOneById,  // ⬅️ THÊM DÒNG NÀY
  getAll,
  getById,
  create,
  update,
  remove
}