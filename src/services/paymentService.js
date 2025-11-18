/* eslint-disable no-useless-catch */
import { paymentModel } from '~/models/paymentModel'
import { orderModel } from '~/models/orderModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// ============================================
// COD PAYMENT
// ============================================
const confirmCODPayment = async (orderId, userId) => {
  try {
    console.log('💵 [paymentService] Confirming COD:', { orderId, userId })
    
    const payment = await paymentModel.findByOrderId(orderId)
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    if (payment.userId.toString() !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
    }
    
    if (payment.method !== 'cod') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment method must be COD')
    }
    
    if (payment.status === 'paid') {
      return payment
    }
    
    const transactionId = `COD_${Date.now()}_${orderId.slice(-6)}`
    const updatedPayment = await paymentModel.markAsPaid(payment._id, transactionId)
    
    await orderModel.updateStatus(orderId, 'confirmed')
    
    console.log('✅ [paymentService] COD payment confirmed')
    
    return updatedPayment
  } catch (error) {
    throw error
  }
}

// ============================================
// BANK TRANSFER PAYMENT
// ============================================
const confirmBankTransferPayment = async (orderId, userId) => {
  try {
    console.log('🏦 [paymentService] User confirming bank transfer:', { orderId, userId })
    
    // 1. Tìm payment
    const payment = await paymentModel.findByOrderId(orderId)
    if (!payment) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Payment not found')
    }
    
    console.log('💳 Payment found:', payment)
    
    // 2. Kiểm tra owner
    if (payment.userId.toString() !== userId.toString()) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
    }
    
    // 3. Kiểm tra payment method
    if (payment.method !== 'bank') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment method must be bank transfer')
    }
    
    // 4. Kiểm tra trạng thái
    if (payment.status === 'paid') {
      console.log('⚠️ Payment already paid')
      return payment
    }
    
    // 5. ✅ QUAN TRỌNG: Cập nhật order status thành "awaiting_confirmation"
    // Để admin biết user đã xác nhận chuyển khoản
    await orderModel.updateStatus(orderId, 'awaiting_confirmation')
    console.log('✅ Order status updated to awaiting_confirmation')
    
    // 6. Cập nhật payment với note
    const transactionId = `BANK_PENDING_${Date.now()}_${orderId.slice(-6)}`
    const updateData = {
      transactionId,
      status: 'pending', // Vẫn pending, chờ admin xác nhận
      metadata: {
        userConfirmedAt: Date.now(),
        note: 'User confirmed bank transfer, awaiting admin verification'
      }
    }
    
    const updatedPayment = await paymentModel.updateOne(payment._id, updateData)
    console.log('✅ Payment updated with user confirmation')
    
    return updatedPayment
  } catch (error) {
    console.error('❌ Bank transfer confirm error:', error)
    throw error
  }
}

// ============================================
// ADMIN: XÁC NHẬN THANH TOÁN BANK TRANSFER
// ============================================
const adminConfirmBankTransfer = async (orderId) => {
  try {
    console.log('👮 [paymentService] Admin confirming bank transfer:', { orderId })
    
    // 1. Tìm hoặc tạo payment
    let payment = await paymentModel.findByOrderId(orderId)
    
    // ✅ Nếu chưa có payment (order cũ), tự động tạo
    if (!payment) {
      console.log('⚠️ Payment not found, creating new payment for old order...')
      
      const order = await orderModel.findOneById(orderId)
      if (!order) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
      }
      
      // Tạo payment mới cho order cũ
      const paymentData = {
        referenceType: 'order',
        referenceId: orderId,
        userId: order.userId.toString(),
        amount: order.totalPrice,
        method: order.paymentMethod,
        status: 'pending',
        description: `Payment for order ${orderId} (created retroactively)`
      }
      
      payment = await paymentModel.createNew(paymentData)
      console.log('✅ Payment created for old order:', payment._id)
    }
    
    if (payment.method !== 'bank') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment method must be bank transfer')
    }
    
    if (payment.status === 'paid') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Payment already confirmed')
    }
    
    // Cập nhật payment thành paid
    const transactionId = `BANK_ADMIN_${Date.now()}_${orderId.slice(-6)}`
    const updatedPayment = await paymentModel.markAsPaid(payment._id, transactionId)
    console.log('✅ Payment marked as paid by admin')
    
    // Cập nhật order status thành confirmed
    await orderModel.updateStatus(orderId, 'confirmed')
    console.log('✅ Order status updated to confirmed')
    
    return updatedPayment
  } catch (error) {
    throw error
  }
}

// ============================================
// EXPORTS
// ============================================
export const paymentService = {
  confirmCODPayment,
  confirmBankTransferPayment,
  adminConfirmBankTransfer
}