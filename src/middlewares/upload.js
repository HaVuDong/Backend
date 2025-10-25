/* eslint-disable quotes */
import multer from "multer"
import path from "path"
import fs from "fs"

// ✅ Tạo thư mục uploads/fields nếu chưa có
const uploadDir = path.join(process.cwd(), "uploads", "fields")
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// ✅ Cấu hình nơi lưu và cách đặt tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, unique + ext)
  },
})

// ✅ Bộ lọc: chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/
  const ext = path.extname(file.originalname).toLowerCase()
  if (allowed.test(ext)) cb(null, true)
  else cb(new Error("❌ Chỉ cho phép file ảnh (.jpg, .jpeg, .png, .webp)"))
}

export const upload = multer({ storage, fileFilter })
