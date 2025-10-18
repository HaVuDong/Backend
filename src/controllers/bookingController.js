/* eslint-disable no-console */
/* eslint-disable no-undef */
/* eslint-disable quotes */
import { StatusCodes } from "http-status-codes"
import { bookingService } from "~/services/bookingService.js"

// 🧩 Tạo booking mới
const createNew = async (req, res, next) => {
  try {
    const newBooking = await bookingService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({ success: true, data: newBooking })
  } catch (error) {
    console.error("❌ createNew error:", error.message)
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message })
  }
}

// 🧩 Lấy tất cả bookings (admin)
const getAll = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAll()
    res.status(StatusCodes.OK).json({ success: true, data: bookings })
  } catch (error) {
    next(error)
  }
}

// 🧩 Lấy booking theo ID
const getById = async (req, res, next) => {
  try {
    const booking = await bookingService.getById(req.params.id)
    if (!booking) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Booking not found"
      })
    }
    res.status(StatusCodes.OK).json({ success: true, data: booking })
  } catch (error) {
    next(error)
  }
}

// 🧩 Cập nhật booking
const update = async (req, res, next) => {
  try {
    const { id } = req.params
    const updated = await bookingService.update(id, req.body)
    if (!updated) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Booking not found"
      })
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking updated successfully",
      data: updated
    })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Error updating booking"
    })
  }
}

// 🧩 Xóa booking
const remove = async (req, res, next) => {
  try {
    const deleted = await bookingService.remove(req.params.id)
    if (!deleted) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Booking not found"
      })
    }
    res.status(StatusCodes.OK).json({ success: true, message: "Booking deleted successfully" })
  } catch (error) {
    next(error)
  }
}

// 🧩 Người dùng hủy booking
const cancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(req.params.id, "user")
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking cancelled successfully",
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// 🧩 Admin hủy booking
const adminCancelBooking = async (req, res, next) => {
  try {
    const result = await bookingService.cancelBooking(req.params.id, "admin")
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking cancelled by admin",
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// 🧩 Lấy danh sách booking theo userId (cho trang “Lịch đã đặt”)
const getByUserId = async (req, res) => {
  try {
    const { userId } = req.params
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing userId parameter"
      })
    }

    const bookings = await bookingService.getByUserId(userId)
    return res.status(StatusCodes.OK).json({ success: true, data: bookings })
  } catch (error) {
    console.error("❌ getByUserId error:", error)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Error fetching user bookings" })
  }
}

export const bookingController = {
  createNew,
  getAll,
  getById,
  update,
  remove,
  cancelBooking,
  adminCancelBooking,
  getByUserId
}
