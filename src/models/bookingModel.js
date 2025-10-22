/* eslint-disable no-console */
/* eslint-disable quotes */
import Joi from "joi"
import { ObjectId } from "mongodb"
import { GET_DB } from "~/config/mongodb"

export const BOOKING_COLLECTION_NAME = "bookings"

export const BOOKING_COLLECTION_SCHEMA = Joi.object({
  fieldId: Joi.alternatives().try(Joi.string(), Joi.object()).required(),
  userId: Joi.alternatives().try(Joi.string(), Joi.allow(null, "")),

  userName: Joi.string().allow("", null),
  userPhone: Joi.string()
    .pattern(/^(0|\+84)\d{9,10}$/)
    .message("Số điện thoại không hợp lệ")
    .allow("", null),
  userEmail: Joi.string().email().allow("", null),

  bookingDate: Joi.date().required(),
  startTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  endTime: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),

  totalPrice: Joi.number().min(0).optional(),
  depositAmount: Joi.number().min(0).default(0),
  isDeposited: Joi.boolean().default(false),
  vietqrUrl: Joi.string().allow("", null),

  notes: Joi.string().max(500).allow("", null),

  status: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "cancelled_refunded",
      "cancelled_no_refund",
      "cancelled_admin",
      "completed"
    )
    .default("pending"),

  refundAmount: Joi.number().min(0).default(0),
  cancelledBy: Joi.string().valid("user", "admin").allow(null, ""),

  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
})

// ✅ Validate trước khi tạo mới
const validateBeforeCreate = async (data) => {
  return await BOOKING_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// ✅ Tạo mới booking
const createNew = async (data) => {

  // ✅ ép userId thành ObjectId nếu hợp lệ
  if (data.userId && ObjectId.isValid(data.userId)) {
    data.userId = new ObjectId(data.userId)
  }
  // Chuẩn hóa dữ liệu
  if (data.isDeposited === "true" || data.isDeposited === "false") {
    data.isDeposited = data.isDeposited === "true"
  }
  if (typeof data.isDeposited !== "boolean") {
    delete data.isDeposited
  }
  if (typeof data.totalPrice === "string") {
    data.totalPrice = Number(data.totalPrice)
  }

  if (data.fieldId && ObjectId.isValid(data.fieldId)) {
    data.fieldId = new ObjectId(data.fieldId)
  }

  if (data.bookingDate && !(data.bookingDate instanceof Date)) {
    data.bookingDate = new Date(data.bookingDate)
  }

  const validData = await BOOKING_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
  const result = await GET_DB().collection(BOOKING_COLLECTION_NAME).insertOne(validData)
  return { _id: result.insertedId, ...validData }
}

// ✅ Tìm booking theo ID
const findOneById = async (id) => {
  if (!ObjectId.isValid(id)) return null
  return await GET_DB()
    .collection(BOOKING_COLLECTION_NAME)
    .findOne({ _id: new ObjectId(id) })
}

// ✅ Lấy tất cả bookings
const getAll = async () => {
  return await GET_DB()
    .collection(BOOKING_COLLECTION_NAME)
    .find()
    .sort({ createdAt: -1 })
    .toArray()
}

// ✅ Cập nhật booking
const updateOne = async (id, data) => {
  try {
    if (!ObjectId.isValid(id)) return null

    const collection = GET_DB().collection(BOOKING_COLLECTION_NAME)

    if (data.isDeposited === "true" || data.isDeposited === "false") {
      data.isDeposited = data.isDeposited === "true"
    }
    if (typeof data.isDeposited !== "boolean") {
      delete data.isDeposited
    }

    const updateData = {
      ...data,
      updatedAt: Date.now()
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.modifiedCount > 0) {
      const updatedDoc = await collection.findOne({ _id: new ObjectId(id) })
      console.log("✅ Booking update thành công:", updatedDoc._id)
      return updatedDoc
    }

    console.log("⚠️ Booking không tìm thấy khi update:", id)
    return null
  } catch (error) {
    console.error("❌ Lỗi trong updateOne:", error)
    throw error
  }
}

// ✅ Xóa booking
const deleteOne = async (id) => {
  if (!ObjectId.isValid(id)) return null
  return await GET_DB()
    .collection(BOOKING_COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(id) })
}

// ✅ Kiểm tra trùng giờ
const findOverlap = async (fieldId, bookingDate, startTime, endTime) => {
  if (ObjectId.isValid(fieldId)) fieldId = new ObjectId(fieldId)

  return await GET_DB()
    .collection(BOOKING_COLLECTION_NAME)
    .findOne({
      fieldId,
      bookingDate: new Date(bookingDate),
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
      status: { $in: ["pending", "confirmed"] }
    })
}

export const bookingModel = {
  BOOKING_COLLECTION_NAME,
  BOOKING_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getAll,
  updateOne,
  deleteOne,
  findOverlap
}

export { ObjectId }
