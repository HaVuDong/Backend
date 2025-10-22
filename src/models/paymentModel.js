/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const PAYMENT_COLLECTION_NAME = 'payments'

// ============================================
// SCHEMA - HỖ TRỢ CẢ BOOKING & ORDER
// ============================================
const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  // Reference polymorphic - có thể trỏ đến booking hoặc order
  referenceType: Joi.string().valid('booking', 'order').required(),
  referenceId: Joi.string().required(), // ID của booking hoặc order
  
  // Thông tin thanh toán
  amount: Joi.number().min(0).required(),
  method: Joi.string().valid('cash', 'bank', 'momo', 'vnpay', 'cod').required(),
  status: Joi.string().valid('pending', 'paid', 'failed', 'refunded').default('pending'),
  
  // Thông tin giao dịch (cho payment gateway)
  transactionId: Joi.string().allow(null, '').optional(),
  paymentGateway: Joi.string().allow(null, '').optional(), // 'momo', 'vnpay', 'paypal'
  
  // Metadata bổ sung
  userId: Joi.string().required(), // User thực hiện thanh toán
  description: Joi.string().allow(null, '').optional(),
  metadata: Joi.object().optional(), // Lưu thêm thông tin nếu cần
  
  // Thời gian
  paidAt: Joi.date().timestamp().allow(null).optional(),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now),
  
  // Backward compatibility (giữ lại cho dữ liệu cũ)
  bookingId: Joi.string().optional()
})

// ============================================
// VALIDATION
// ============================================
const validateBeforeCreate = async (data) => {
  return await PAYMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// ============================================
// CREATE - TẠO PAYMENT MỚI
// ============================================
const createNew = async (data) => {
  try {
    // Backward compatibility: nếu có bookingId, tự động set referenceType
    if (data.bookingId && !data.referenceType) {
      data.referenceType = 'booking'
      data.referenceId = data.bookingId
    }
    
    const validated = await validateBeforeCreate(data)
    
    // Convert referenceId to ObjectId if valid
    if (ObjectId.isValid(validated.referenceId)) {
      validated.referenceId = new ObjectId(validated.referenceId)
    }
    
    if (validated.userId && ObjectId.isValid(validated.userId)) {
      validated.userId = new ObjectId(validated.userId)
    }
    
    const result = await GET_DB().collection(PAYMENT_COLLECTION_NAME).insertOne(validated)
    return { ...validated, _id: result.insertedId }
  } catch (error) {
    throw new Error(`Create payment failed: ${error.message}`)
  }
}

// ============================================
// READ - ĐỌC DỮ LIỆU
// ============================================

// Tìm payment theo ID
const findOneById = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).findOne({ _id: queryId })
  } catch (error) {
    throw error
  }
}

// Tìm payment theo referenceId (booking hoặc order)
const findByReference = async (referenceType, referenceId) => {
  try {
    const queryId = ObjectId.isValid(referenceId) ? new ObjectId(referenceId) : referenceId
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).findOne({
      referenceType,
      referenceId: queryId
    })
  } catch (error) {
    throw error
  }
}

// Tìm payment theo booking (backward compatibility)
const findByBookingId = async (bookingId) => {
  try {
    return await findByReference('booking', bookingId)
  } catch (error) {
    throw error
  }
}

// Tìm payment theo order
const findByOrderId = async (orderId) => {
  try {
    return await findByReference('order', orderId)
  } catch (error) {
    throw error
  }
}

// Tìm payment theo transactionId (từ payment gateway)
const findByTransactionId = async (transactionId) => {
  try {
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).findOne({ transactionId })
  } catch (error) {
    throw error
  }
}

// Lấy tất cả payments của user
const findByUserId = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, referenceType, status } = options
    
    const filter = { userId: new ObjectId(userId) }
    
    if (referenceType) filter.referenceType = referenceType
    if (status) filter.status = status
    
    const skip = (page - 1) * limit
    
    const payments = await GET_DB()
      .collection(PAYMENT_COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()
    
    const total = await GET_DB().collection(PAYMENT_COLLECTION_NAME).countDocuments(filter)
    
    return {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    throw error
  }
}

// Lấy tất cả payments (Admin)
const getAll = async (options = {}) => {
  try {
    const { page, limit, status, referenceType, method } = options
    
    const filter = {}
    if (status) filter.status = status
    if (referenceType) filter.referenceType = referenceType
    if (method) filter.method = method
    
    // Nếu có phân trang
    if (page && limit) {
      const skip = (page - 1) * limit
      const payments = await GET_DB()
        .collection(PAYMENT_COLLECTION_NAME)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .toArray()
      
      const total = await GET_DB().collection(PAYMENT_COLLECTION_NAME).countDocuments(filter)
      
      return {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    }
    
    // Không phân trang
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).find(filter).toArray()
  } catch (error) {
    throw error
  }
}

// ============================================
// UPDATE - CẬP NHẬT
// ============================================

// Cập nhật payment
const updateOne = async (id, data) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    
    const result = await GET_DB().collection(PAYMENT_COLLECTION_NAME).findOneAndUpdate(
      { _id: queryId },
      { $set: { ...data, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw error
  }
}

// Cập nhật trạng thái payment
const updateStatus = async (id, status, additionalData = {}) => {
  try {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded']
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }
    
    const updateData = {
      status,
      updatedAt: Date.now()
    }
    
    // Nếu thanh toán thành công, lưu thời gian
    if (status === 'paid' && !additionalData.paidAt) {
      updateData.paidAt = Date.now()
    }
    
    // Merge additional data
    Object.assign(updateData, additionalData)
    
    return await updateOne(id, updateData)
  } catch (error) {
    throw error
  }
}

// Đánh dấu đã thanh toán
const markAsPaid = async (id, transactionId = null) => {
  try {
    const updateData = {
      status: 'paid',
      paidAt: Date.now(),
      updatedAt: Date.now()
    }
    
    if (transactionId) {
      updateData.transactionId = transactionId
    }
    
    return await updateOne(id, updateData)
  } catch (error) {
    throw error
  }
}

// Đánh dấu thanh toán thất bại
const markAsFailed = async (id, reason = null) => {
  try {
    const updateData = {
      status: 'failed',
      updatedAt: Date.now()
    }
    
    if (reason) {
      updateData.metadata = { failureReason: reason }
    }
    
    return await updateOne(id, updateData)
  } catch (error) {
    throw error
  }
}

// Hoàn tiền
const refund = async (id, reason = null) => {
  try {
    const updateData = {
      status: 'refunded',
      updatedAt: Date.now()
    }
    
    if (reason) {
      updateData.metadata = { refundReason: reason }
    }
    
    return await updateOne(id, updateData)
  } catch (error) {
    throw error
  }
}

// ============================================
// DELETE - XÓA
// ============================================
const deleteOne = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).deleteOne({ _id: queryId })
  } catch (error) {
    throw error
  }
}

// ============================================
// STATISTICS - THỐNG KÊ
// ============================================

// Thống kê theo loại (booking vs order)
const getStatsByType = async () => {
  try {
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).aggregate([
      {
        $group: {
          _id: {
            referenceType: '$referenceType',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.referenceType': 1, '_id.status': 1 }
      }
    ]).toArray()
  } catch (error) {
    throw error
  }
}

// Thống kê doanh thu theo khoảng thời gian
const getRevenueByPeriod = async (startDate, endDate, referenceType = null) => {
  try {
    const matchStage = {
      status: 'paid',
      paidAt: {
        $gte: startDate,
        $lte: endDate
      }
    }
    
    if (referenceType) {
      matchStage.referenceType = referenceType
    }
    
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$referenceType',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]).toArray()
  } catch (error) {
    throw error
  }
}

// Thống kê theo phương thức thanh toán
const getStatsByMethod = async () => {
  try {
    return await GET_DB().collection(PAYMENT_COLLECTION_NAME).aggregate([
      {
        $group: {
          _id: {
            method: '$method',
            status: '$status'
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.method': 1, '_id.status': 1 }
      }
    ]).toArray()
  } catch (error) {
    throw error
  }
}

// Thống kê tổng quan
const getDashboardStats = async () => {
  try {
    const stats = await GET_DB().collection(PAYMENT_COLLECTION_NAME).aggregate([
      {
        $facet: {
          // Tổng doanh thu
          totalRevenue: [
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ],
          // Số lượng thanh toán theo trạng thái
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          // Doanh thu theo loại
          byType: [
            { $match: { status: 'paid' } },
            {
              $group: {
                _id: '$referenceType',
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ],
          // Doanh thu theo phương thức
          byMethod: [
            { $match: { status: 'paid' } },
            {
              $group: {
                _id: '$method',
                revenue: { $sum: '$amount' },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]).toArray()
    
    return stats[0]
  } catch (error) {
    throw error
  }
}

// ============================================
// EXPORT
// ============================================
export const paymentModel = {
  // Create
  createNew,
  
  // Read
  findOneById,
  findByReference,
  findByBookingId,
  findByOrderId,
  findByTransactionId,
  findByUserId,
  getAll,
  
  // Update
  updateOne,
  updateStatus,
  markAsPaid,
  markAsFailed,
  refund,
  
  // Delete
  deleteOne,
  
  // Statistics
  getStatsByType,
  getRevenueByPeriod,
  getStatsByMethod,
  getDashboardStats
}