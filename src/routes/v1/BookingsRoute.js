/* eslint-disable quotes */
import express from "express"
import { bookingController } from "~/controllers/bookingController"

const router = express.Router()

// ⚙️ Lấy toàn bộ danh sách booking (admin)
router.get("/", bookingController.getAll)

// ⚙️ Lấy danh sách booking theo userId (cho trang "Lịch đã đặt")
router.get("/user/:userId", bookingController.getByUserId)

// ⚙️ Lấy chi tiết 1 booking theo id
router.get("/:id", bookingController.getById)

// ⚙️ Tạo mới booking (khi người dùng đặt sân)
router.post("/", bookingController.createNew)

// ⚙️ Cập nhật booking (nếu có logic admin chỉnh sửa)
router.put("/:id", bookingController.update)

// ⚙️ Người dùng hủy booking của mình
router.put("/:id/cancel", bookingController.cancelBooking)

// ⚙️ Admin hủy booking (dashboard)
router.put("/:id/admin-cancel", bookingController.adminCancelBooking)

// ⚙️ Xóa booking (thường chỉ admin)
router.delete("/:id", bookingController.remove)

export const bookingRoute = router
