/* eslint-disable indent */
/**
 * Orders collection - quản lý đơn đặt sân (có thể chứa nhiều bookings)
 */
import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

// Define Collection (Name & Schema)
const ORDER_COLLECTION_NAME = 'orders'
const ORDER_COLLECTION_SCHEMA = Joi.object({
  // Người đặt (nếu là user đã đăng ký tài khoản)
  userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),

  // Người đặt (nếu là khách vãng lai)
  customerId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),

  // Danh sách bookings thuộc đơn hàng này (ít nhất 1)
  bookingIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).min(1).required(),

  // Tổng tiền của toàn bộ bookings trong đơn
  totalAmount: Joi.number().required().min(0),

  // Trạng thái đơn hàng
  status: Joi.string().valid('pending', 'paid', 'cancelled').default('pending'),

  // Ghi chú thêm (nếu có)
  notes: Joi.string().max(500).allow('', null),

  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
})

export const orderModel = {
  ORDER_COLLECTION_NAME,
  ORDER_COLLECTION_SCHEMA
}
