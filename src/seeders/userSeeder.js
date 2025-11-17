/* eslint-disable quotes */
/* eslint-disable no-console */
import bcrypt from "bcryptjs"
import { CONNECT_DB, GET_DB } from "../config/mongodb.js"
import { USER_COLLECTION_NAME } from "../models/userModel.js"

// ----------------------------
// 🔹 Helper random functions
// ----------------------------
const randomUsername = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789_"
  const length = Math.floor(Math.random() * 6) + 5 // 5–10 ký tự
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

const randomPhone = () => {
  const prefix = ["090", "091", "093", "094", "096", "097", "098", "099", "088", "089", "086"]
  const chosen = prefix[Math.floor(Math.random() * prefix.length)]
  const middle = Math.floor(100 + Math.random() * 900)
  const last = Math.floor(1000 + Math.random() * 9000)
  return `${chosen}${middle}${last}`
}

const randomEmail = (username) => {
  const domains = ["gmail.com", "yahoo.com", "example.com", "test.com"]
  return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`
}

// ----------------------------
// 🔥 Seeder chính
// ----------------------------
const seedUsers = async () => {
  try {
    await CONNECT_DB()
    const db = GET_DB()
    const collection = db.collection(USER_COLLECTION_NAME)

    console.log("🚀 Bắt đầu seed 100 users (KHÔNG xoá dữ liệu cũ)...")

    const hashedPassword = await bcrypt.hash("123456", 10)
    const users = []

    for (let i = 0; i < 100; i++) {
      const username = randomUsername()
      users.push({
        username,
        email: randomEmail(username),
        password: hashedPassword,
        phone: randomPhone(),
        role: Math.random() > 0.9 ? "admin" : "user",
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }

    const result = await collection.insertMany(users)
    console.log(`🎉 Seed thành công! Đã thêm ${result.insertedCount} users.`)
  } catch (error) {
    console.error("❌ Lỗi khi seed user:", error)
  } finally {
    process.exit()
  }
}

seedUsers()
