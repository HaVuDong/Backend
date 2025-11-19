/* eslint-disable no-unused-vars */
/* eslint-disable quotes */
/* eslint-disable semi */
/* eslint-disable no-console */
import express from 'express'
import path from "path"
import exitHook from 'exit-hook'
import cors from 'cors' // 👈 Quan trọng!
import bcrypt from 'bcrypt'
import { CLOSE_DB, CONNECT_DB, GET_DB } from '~/config/mongodb.js'
import { env } from '~/config/environment.js'
import { API_V1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import { startAutoCrawler } from '~/cron/autoFootballNews.js'

// =====================
// 🚀 KHỞI TẠO SERVER
// =====================
const START_SERVER = () => {
  const app = express()

  // Cho phép đọc JSON body
  app.use(express.json())

  // =====================
  // ⚙️ CẤU HÌNH CORS (cho phép frontend gọi API)
  // =====================
  app.use(
    cors({
      origin: [
        "https://frontend-two-sable-gob38m9y77.vercel.app",
        "http://localhost:3000"// local dev
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    })
  )

  // 👉 Nếu bạn muốn cho phép tất cả domain (test nhanh):
  // app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }))

  // =====================
  // 📂 CẤU HÌNH STATIC FILES
  // =====================
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

  // =====================
  // 🧩 MOUNT API V1
  // =====================
  app.use('/v1', API_V1)

  // =====================
  // 🧱 XỬ LÝ LỖI TẬP TRUNG
  // =====================
  app.use(errorHandlingMiddleware)

  // =====================
  // 🚀 KHỞI ĐỘNG SERVER
  // =====================
  const PORT = process.env.PORT || 8017
  app.listen(PORT, () => {
    console.log(`✅ Server running and listening on PORT ${PORT}`)
  })

  // =====================
  // 🧹 CLEANUP KHI DỪNG SERVER
  // =====================
  exitHook(() => {
    console.log('🧹 Server is shutting down...')
    CLOSE_DB()
    console.log('❎ Disconnected from MongoDB Atlas.')
  })
}

// =====================
// ⚡ KẾT NỐI DATABASE VÀ CHẠY SERVER
// =====================
CONNECT_DB()
  .then(async () => {
    console.log('✅ Connected to MongoDB Cloud Atlas!')
    
    // 🤖 Kích hoạt auto crawler tin bóng đá
    startAutoCrawler()
  })
  .then(() => START_SERVER())
  .catch(error => {
    console.error('❌ Database connection failed:', error)
    process.exit(0)
  })
