/* eslint-disable no-useless-catch */
import { paymentModel } from '~/models/paymentModel'
import { orderModel } from '~/models/orderModel'
import { createMoMoPayment } from '~/providers/momoProvider'
import { createVNPayPayment } from '~/providers/vnpayProvider'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// ============================================
// COMMON PAYMENT FUNCTIONS
// ============================================

// Tạo payment cho order
const createPaymentForOrder = async (orderId, userId) => {
  try {
    const order = await orderModel.findOneById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    if (order.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission')
    }
    
    const existingPayment = await paymentModel.findByOrderId(orderId)
    if (existingPayment) {
      return existingPayment
    }
    
    const payment = await paymentModel.createNew({
      referenceType: 'order',
      referenceId: orderId,
      userId,
      amount: order.totalPrice,
      method: order.paymentMethod,
      description: `Thanh toán đơn hàng #${orderId.toString().slice(-8).toUpperCase()}`
    })
    
    return payment
  } catch (error) {
    throw error
  }
}

// Lấy thông tin payment
const getPaymentByOrderId = async (orderId, userId = null) => {
  try {
    const payment = await paymentModel.findByOrderId(orderId)
    
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    if (userId && payment.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission')
    }
    
    return payment
  } catch (error) {
    throw error
  }
}

// ============================================
// COD PAYMENT
// ============================================

// Xác nhận thanh toán COD
const confirmCODPayment = async (orderId, userId = null) => {
  try {
    const payment = await paymentModel.findByOrderId(orderId)
    
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    if (userId && payment.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission')
    }
    
    if (payment.method !== 'cod') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'This is not a COD payment')
    }
    
    const updatedPayment = await paymentModel.markAsPaid(payment._id.toString(), `COD-${Date.now()}`)
    await orderModel.updateStatus(orderId, 'confirmed')
    
    return updatedPayment
  } catch (error) {
    throw error
  }
}

// ============================================
// MOMO PAYMENT
// ============================================

// Tạo MoMo payment link
const createMoMoPaymentLink = async (orderId, userId, ipAddr = '127.0.0.1') => {
  try {
    const order = await orderModel.findOneById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    if (order.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
    }
    
    // Tạo/lấy payment
    let payment = await paymentModel.findByOrderId(orderId)
    if (!payment) {
      payment = await createPaymentForOrder(orderId, userId)
    }
    
    // Tạo MoMo payment request
    const orderInfo = `Thanh toan don hang #${orderId.toString().slice(-8).toUpperCase()}`
    const extraData = JSON.stringify({ userId, orderId: orderId.toString() })
    
    const momoResponse = await createMoMoPayment(
      orderId,
      order.totalPrice,
      orderInfo,
      extraData
    )
    
    if (momoResponse.resultCode !== 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, momoResponse.message || 'MoMo payment failed')
    }
    
    // Cập nhật payment
    await paymentModel.updateOne(payment._id.toString(), {
      method: 'momo',
      paymentGateway: 'momo',
      metadata: {
        requestId: momoResponse.requestId,
        payUrl: momoResponse.payUrl
      }
    })
    
    return {
      paymentUrl: momoResponse.payUrl,
      orderId: orderId.toString(),
      amount: order.totalPrice,
      requestId: momoResponse.requestId
    }
  } catch (error) {
    throw error
  }
}

// Xử lý MoMo callback
const handleMoMoCallback = async (callbackData) => {
  try {
    const { orderId, resultCode, transId, message } = callbackData
    
    const payment = await paymentModel.findByOrderId(orderId)
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    // resultCode = 0: Thành công
    if (resultCode === 0) {
      await paymentModel.markAsPaid(payment._id.toString(), transId)
      await orderModel.updateStatus(orderId, 'confirmed')
      
      return {
        success: true,
        message: 'Payment successful',
        orderId,
        transactionId: transId
      }
    } else {
      await paymentModel.markAsFailed(payment._id.toString(), message)
      
      return {
        success: false,
        message: message || 'Payment failed',
        orderId,
        resultCode
      }
    }
  } catch (error) {
    throw error
  }
}

// Xử lý MoMo IPN
const handleMoMoIPN = async (ipnData) => {
  try {
    // Xử lý giống callback nhưng không redirect
    return await handleMoMoCallback(ipnData)
  } catch (error) {
    throw error
  }
}

// ============================================
// VNPAY PAYMENT
// ============================================

// Tạo VNPay payment link
const createVNPayPaymentLink = async (orderId, userId, ipAddr = '127.0.0.1') => {
  try {
    const order = await orderModel.findOneById(orderId)
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    if (order.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
    }
    
    // Tạo/lấy payment
    let payment = await paymentModel.findByOrderId(orderId)
    if (!payment) {
      payment = await createPaymentForOrder(orderId, userId)
    }
    
    // Tạo VNPay payment URL
    const orderInfo = `Thanh toan don hang #${orderId.toString().slice(-8).toUpperCase()}`
    
    const vnpayResponse = createVNPayPayment(
      orderId,
      order.totalPrice,
      orderInfo,
      ipAddr
    )
    
    // Cập nhật payment
    await paymentModel.updateOne(payment._id.toString(), {
      method: 'vnpay',
      paymentGateway: 'vnpay',
      metadata: {
        createDate: vnpayResponse.createDate,
        expireDate: vnpayResponse.expireDate
      }
    })
    
    return {
      paymentUrl: vnpayResponse.paymentUrl,
      orderId: vnpayResponse.orderId,
      amount: order.totalPrice,
      createDate: vnpayResponse.createDate,
      expireDate: vnpayResponse.expireDate
    }
  } catch (error) {
    throw error
  }
}

// Xử lý VNPay callback
const handleVNPayCallback = async (vnpParams) => {
  try {
    const orderId = vnpParams.vnp_TxnRef
    const responseCode = vnpParams.vnp_ResponseCode
    const transactionNo = vnpParams.vnp_TransactionNo
    
    const payment = await paymentModel.findByOrderId(orderId)
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    // responseCode = 00: Thành công
    if (responseCode === '00') {
      await paymentModel.markAsPaid(payment._id.toString(), transactionNo)
      await orderModel.updateStatus(orderId, 'confirmed')
      
      return {
        success: true,
        message: 'Payment successful',
        orderId,
        transactionId: transactionNo
      }
    } else {
      const message = `VNPay error code: ${responseCode}`
      await paymentModel.markAsFailed(payment._id.toString(), message)
      
      return {
        success: false,
        message: 'Payment failed',
        orderId,
        errorCode: responseCode
      }
    }
  } catch (error) {
    throw error
  }
}

// Xử lý VNPay IPN
const handleVNPayIPN = async (vnpParams) => {
  try {
    // Xử lý giống callback nhưng không redirect
    return await handleVNPayCallback(vnpParams)
  } catch (error) {
    throw error
  }
}

// ============================================
// CANCEL & REFUND
// ============================================

// Hủy thanh toán
const cancelPayment = async (orderId, userId, reason = null) => {
  try {
    const payment = await paymentModel.findByOrderId(orderId)
    
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    if (payment.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission')
    }
    
    if (payment.status === 'paid') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cannot cancel paid payment. Use refund instead.')
    }
    
    const updatedPayment = await paymentModel.markAsFailed(payment._id.toString(), reason)
    await orderModel.cancelOrder(orderId, userId)
    
    return updatedPayment
  } catch (error) {
    throw error
  }
}

// Hoàn tiền
const refundPayment = async (orderId, reason = null) => {
  try {
    const payment = await paymentModel.findByOrderId(orderId)
    
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    if (payment.status !== 'paid') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment is not paid yet')
    }
    
    const updatedPayment = await paymentModel.refund(payment._id.toString(), reason)
    await orderModel.updateStatus(orderId, 'cancelled')
    
    return updatedPayment
  } catch (error) {
    throw error
  }
}

// ============================================
// ADMIN & STATS
// ============================================

// Lấy payments của user
const getUserPayments = async (userId, options = {}) => {
  try {
    return await paymentModel.findByUserId(userId, options)
  } catch (error) {
    throw error
  }
}

// Admin - Lấy tất cả payments
const getAllPayments = async (options = {}) => {
  try {
    return await paymentModel.getAll(options)
  } catch (error) {
    throw error
  }
}

// Admin - Thống kê
const getPaymentStats = async () => {
  try {
    return await paymentModel.getDashboardStats()
  } catch (error) {
    throw error
  }
}

// ============================================
// EXPORTS
// ============================================

export const paymentService = {
  // Common
  createPaymentForOrder,
  getPaymentByOrderId,
  
  // COD
  confirmCODPayment,
  
  // MoMo
  createMoMoPaymentLink,
  handleMoMoCallback,
  handleMoMoIPN,
  
  // VNPay
  createVNPayPaymentLink,
  handleVNPayCallback,
  handleVNPayIPN,
  
  // Cancel & Refund
  cancelPayment,
  refundPayment,
  
  // User & Admin
  getUserPayments,
  getAllPayments,
  getPaymentStats
}