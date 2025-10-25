/* eslint-disable quotes */
import express from "express"
import { userController } from "~/controllers/userController"
import { authMiddleware } from "~/middlewares/authMiddleware"
import { isAdmin } from "~/middlewares/roleMiddleware"

const Router = express.Router()

// Auth routes
Router.post("/register", userController.register)
Router.post("/login", userController.login)

// Route chỉ dành cho admin test
Router.get("/admin-only", authMiddleware, isAdmin, (req, res) => {
  res.json({ success: true, message: "Welcome Admin!" })
})
Router.get('/me',
  authMiddleware, // ⬅️ Yêu cầu JWT token
  userController.getCurrentUser
)

// CRUD người dùng
Router.route("/")
  .get(authMiddleware, isAdmin, userController.getAll) // 🟢 Chỉ admin mới xem danh sách
  .post(authMiddleware, isAdmin, userController.create) // 🟢 Tạo user mới (nếu cần)

// Các thao tác theo id
Router.route("/:id")
  .get(authMiddleware, userController.getById)
  .put(authMiddleware, userController.update)
  .delete(authMiddleware, isAdmin, userController.remove)

export const usersRoute = Router
