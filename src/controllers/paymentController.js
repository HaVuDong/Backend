import { StatusCodes } from 'http-status-codes'
import { paymentService } from '~/services/paymentService'
import { verifyMoMoSignature } from '~/providers/momoProvider'
import { verifyVNPaySignature, parseVNPayResponse } from '~/providers/vnpayProvider'
import { env } from '~/config/environment'

// ============================================
// COMMON PAYMENT ENDPOINTS
// ============================================

// Tạo payment cho order
const createPayment = async (req, res, next) => {
  try {
    const { orderId, userId } = req.body
    
    const payment = await paymentService.createPaymentForOrder(orderId, userId)
    
    res.status(StatusCodes.CREATED).json({
      message: 'Payment created successfully',
      payment
    })
  } catch (error) {
    next(error)
  }
}

// Lấy payment theo orderId
const getPaymentByOrderId = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { userId } = req.query
    
    const payment = await paymentService.getPaymentByOrderId(orderId, userId)
    
    res.status(StatusCodes.OK).json(payment)
  } catch (error) {
    next(error)
  }
}

// ============================================
// COD PAYMENT
// ============================================

// Xác nhận thanh toán COD
const confirmCODPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { userId } = req.body
    
    const payment = await paymentService.confirmCODPayment(orderId, userId)
    
    res.status(StatusCodes.OK).json({
      message: 'COD payment confirmed successfully',
      payment
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// MOMO PAYMENT
// ============================================

// Tạo MoMo payment link
const createMoMoPayment = async (req, res, next) => {
  try {
    const { orderId, userId } = req.body
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1'
    
    const result = await paymentService.createMoMoPaymentLink(orderId, userId, ipAddr)
    
    res.status(StatusCodes.OK).json({
      message: 'MoMo payment link created successfully',
      ...result
    })
  } catch (error) {
    next(error)
  }
}

// MoMo Callback (Redirect từ MoMo về)
const handleMoMoCallback = async (req, res, next) => {
  try {
    const callbackData = req.query
    
    // Verify signature
    const isValid = verifyMoMoSignature(callbackData)
    if (!isValid) {
      return res.redirect(`${env.CLIENT_URL}/payment/failed?reason=invalid_signature`)
    }
    
    // Xử lý callback
    const result = await paymentService.handleMoMoCallback(callbackData)
    
    // Redirect về frontend
    if (result.success) {
      return res.redirect(`${env.CLIENT_URL}/payment/success?orderId=${result.orderId}&transactionId=${result.transactionId}`)
    } else {
      return res.redirect(`${env.CLIENT_URL}/payment/failed?orderId=${result.orderId}&reason=${encodeURIComponent(result.message)}`)
    }
  } catch (error) {
    console.error('MoMo callback error:', error)
    return res.redirect(`${env.CLIENT_URL}/payment/failed?reason=system_error`)
  }
}

// MoMo IPN (Server to Server notification)
const handleMoMoIPN = async (req, res, next) => {
  try {
    const ipnData = req.body
    
    // Verify signature
    const isValid = verifyMoMoSignature(ipnData)
    if (!isValid) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid signature',
        resultCode: 97
      })
    }
    
    // Xử lý IPN
    const result = await paymentService.handleMoMoIPN(ipnData)
    
    // Trả về response cho MoMo
    if (result.success) {
      return res.status(StatusCodes.OK).json({
        message: 'IPN processed successfully',
        resultCode: 0
      })
    } else {
      return res.status(StatusCodes.OK).json({
        message: 'IPN processed but payment failed',
        resultCode: ipnData.resultCode
      })
    }
  } catch (error) {
    console.error('MoMo IPN error:', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'System error',
      resultCode: 99
    })
  }
}

// ============================================
// VNPAY PAYMENT
// ============================================

// Tạo VNPay payment link
const createVNPayPayment = async (req, res, next) => {
  try {
    const { orderId, userId } = req.body
    const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1'
    
    const result = await paymentService.createVNPayPaymentLink(orderId, userId, ipAddr)
    
    res.status(StatusCodes.OK).json({
      message: 'VNPay payment link created successfully',
      ...result
    })
  } catch (error) {
    next(error)
  }
}

// VNPay Callback (Redirect từ VNPay về)
const handleVNPayCallback = async (req, res, next) => {
  try {
    const vnpParams = req.query
    
    // Verify signature
    const isValid = verifyVNPaySignature(vnpParams)
    if (!isValid) {
      return res.redirect(`${env.CLIENT_URL}/payment/failed?reason=invalid_signature`)
    }
    
    // Parse response
    const parsedData = parseVNPayResponse(vnpParams)
    
    // Xử lý callback
    const result = await paymentService.handleVNPayCallback(parsedData)
    
    // Redirect về frontend
    if (result.success) {
      return res.redirect(`${env.CLIENT_URL}/payment/success?orderId=${result.orderId}&transactionId=${result.transactionId}`)
    } else {
      return res.redirect(`${env.CLIENT_URL}/payment/failed?orderId=${result.orderId}&errorCode=${result.errorCode}`)
    }
  } catch (error) {
    console.error('VNPay callback error:', error)
    return res.redirect(`${env.CLIENT_URL}/payment/failed?reason=system_error`)
  }
}

// VNPay IPN (Server to Server notification)
const handleVNPayIPN = async (req, res, next) => {
  try {
    const vnpParams = req.query
    
    // Verify signature
    const isValid = verifyVNPaySignature(vnpParams)
    if (!isValid) {
      return res.status(StatusCodes.OK).json({
        RspCode: '97',
        Message: 'Invalid signature'
      })
    }
    
    // Parse response
    const parsedData = parseVNPayResponse(vnpParams)
    
    // Xử lý IPN
    const result = await paymentService.handleVNPayIPN(parsedData)
    
    // Trả về response cho VNPay
    if (result.success) {
      return res.status(StatusCodes.OK).json({
        RspCode: '00',
        Message: 'Confirm Success'
      })
    } else {
      return res.status(StatusCodes.OK).json({
        RspCode: parsedData.responseCode,
        Message: 'Payment failed'
      })
    }
  } catch (error) {
    console.error('VNPay IPN error:', error)
    return res.status(StatusCodes.OK).json({
      RspCode: '99',
      Message: 'System error'
    })
  }
}

// ============================================
// CANCEL & REFUND
// ============================================

// Hủy payment
const cancelPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { userId, reason } = req.body
    
    const payment = await paymentService.cancelPayment(orderId, userId, reason)
    
    res.status(StatusCodes.OK).json({
      message: 'Payment cancelled successfully',
      payment
    })
  } catch (error) {
    next(error)
  }
}

// Hoàn tiền (Admin)
const refundPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params
    const { reason } = req.body
    
    const payment = await paymentService.refundPayment(orderId, reason)
    
    res.status(StatusCodes.OK).json({
      message: 'Payment refunded successfully',
      payment
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// USER & ADMIN
// ============================================

// Lấy payments của user
const getUserPayments = async (req, res, next) => {
  try {
    const { userId } = req.query
    const { page, limit, status, referenceType } = req.query
    
    const result = await paymentService.getUserPayments(userId, {
      page,
      limit,
      status,
      referenceType
    })
    
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// Admin - Lấy tất cả payments
const getAllPayments = async (req, res, next) => {
  try {
    const { page, limit, status, referenceType, method } = req.query
    
    const result = await paymentService.getAllPayments({
      page,
      limit,
      status,
      referenceType,
      method
    })
    
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

// Admin - Thống kê payments
const getPaymentStats = async (req, res, next) => {
  try {
    const stats = await paymentService.getPaymentStats()
    
    res.status(StatusCodes.OK).json({
      message: 'Payment statistics',
      stats
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// EXPORTS
// ============================================

export const paymentController = {
  // Common
  createPayment,
  getPaymentByOrderId,
  
  // COD
  confirmCODPayment,
  
  // MoMo
  createMoMoPayment,
  handleMoMoCallback,
  handleMoMoIPN,
  
  // VNPay
  createVNPayPayment,
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