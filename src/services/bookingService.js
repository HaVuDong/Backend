/* eslint-disable quotes */
import { bookingModel, ObjectId } from "~/models/bookingModel.js"
import { fieldModel } from "~/models/fieldModel.js"
import { GET_DB } from "~/config/mongodb.js"

// ⚙️ Tính số giờ giữa hai khung giờ
const calculateHours = (start, end) => {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

// ⚙️ Tạo link VietQR thanh toán cọc
const generateVietQR = (amount, content = "DAT_SAN") => {
  const base = "https://img.vietqr.io/image/MB-0367189928-compact2.png"
  return `${base}?amount=${Math.round(amount)}&addInfo=${encodeURIComponent(
    content
  )}&accountName=${encodeURIComponent("HA VU DONG")}`
}

// ✅ Tạo booking mới
const createNew = async (data) => {
  const field = await fieldModel.findOneById(data.fieldId)
  if (!field) throw new Error("Field not found")

  const overlap = await bookingModel.findOverlap(
    data.fieldId,
    data.bookingDate,
    data.startTime,
    data.endTime
  )
  if (overlap) throw new Error("Time slot already booked")

  const hours = calculateHours(data.startTime, data.endTime)
  if (hours < 1) throw new Error("Booking must be at least 1 hour")

  const totalPrice = Number(field.pricePerHour) * hours
  const depositAmount = Math.round(totalPrice * 0.3)

  const vietqrUrl = generateVietQR(
    depositAmount,
    `DAT_SAN_${field.name}_${data.userName || "User"}`
  )

  const isDeposited = false
  const status = isDeposited ? "confirmed" : "pending"

  const booking = await bookingModel.createNew({
    ...data,
    totalPrice,
    depositAmount,
    isDeposited,
    status,
    vietqrUrl
  })

  return { ...booking, vietqrUrl, depositAmount, totalPrice }
}

// ✅ Hủy đặt sân
const cancelBooking = async (id, cancelledBy = "user") => {
  const booking = await bookingModel.findOneById(id)
  if (!booking) throw new Error("Booking not found")

  if (booking.status?.startsWith("cancelled")) return booking

  return await bookingModel.updateOne(id, {
    status: "cancelled_no_refund",
    cancelledBy,
    updatedAt: Date.now()
  })
}

// ✅ Lấy danh sách booking theo userId (join tên sân)
const getByUserId = async (userId) => {
  const db = GET_DB()

  // ✅ match cả string và ObjectId để không bỏ sót dữ liệu cũ
  const ids = [userId]
  if (ObjectId.isValid(userId)) ids.push(new ObjectId(userId))

  const result = await db
    .collection("bookings")
    .aggregate([
      { $match: { userId: { $in: ids } } },
      {
        $lookup: {
          from: "fields",
          localField: "fieldId",
          foreignField: "_id",
          as: "fieldInfo"
        }
      },
      { $unwind: { path: "$fieldInfo", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ])
    .toArray()

  return result
}

export const bookingService = {
  createNew,
  getById: (id) => bookingModel.findOneById(id),
  getAll: () => bookingModel.getAll(),
  update: (id, data) => bookingModel.updateOne(id, data),
  remove: (id) => bookingModel.deleteOne(id),
  cancelBooking,
  getByUserId
}
