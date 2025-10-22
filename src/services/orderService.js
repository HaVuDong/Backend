/* eslint-disable no-undef */
/* eslint-disable no-useless-catch */
import { orderModel } from '~/models/orderModel'
import { cartModel } from '~/models/cartModel'
import { paymentModel } from '~/models/paymentModel'
import { productModel } from '~/models/productModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// TẠO ĐƠN HÀNG
const createOrder = async (userId, orderData) => {
  try {
    const { shippingAddress, paymentMethod } = orderData
    
    // 1. Lấy giỏ hàng
    const cart = await cartModel.getByUserId(userId)
    if (!cart || cart.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty')
    }
    
    // 2. KIỂM TRA VÀ GIẢM STOCK CỦA TỪNG SẢN PHẨM
    for (const item of cart.items) {
      try {
        await productModel.decreaseStock(item.productId.toString(), item.quantity)
      } catch (error) {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Product ${item.name} is out of stock`)
      }
    }
    
    // 3. Tạo đơn hàng
    const order = await orderModel.createNew({
      userId,
      items: cart.items,
      shippingAddress,
      paymentMethod,
      totalPrice: cart.totalPrice
    })
    
    // 4. Tạo payment record
    const payment = await paymentModel.createNew({
      referenceType: 'order',
      referenceId: order._id.toString(),
      userId,
      amount: cart.totalPrice,
      method: paymentMethod,
      description: `Thanh toán đơn hàng #${order._id.toString().slice(-8).toUpperCase()}`
    })
    
    // 5. Xóa giỏ hàng
    await cartModel.clear(userId)
    
    return { order, payment }
  } catch (error) {
    throw error
  }
}

// LẤY DANH SÁCH ĐƠN HÀNG CỦA USER
const getOrders = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options
    
    return await orderModel.findByUserId(userId, { page, limit, status })
  } catch (error) {
    throw error
  }
}

// LẤY CHI TIẾT ĐƠN HÀNG
const getOrderById = async (orderId, userId = null) => {
  try {
    const order = await orderModel.findOneById(orderId)
    
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    // Kiểm tra quyền truy cập (nếu có userId)
    if (userId && order.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You do not have permission to access this order')
    }
    
    return order
  } catch (error) {
    throw error
  }
}

// HỦY ĐƠN HÀNG - TĂNG LẠI STOCK
const cancelOrder = async (orderId, userId) => {
  try {
    const order = await orderModel.cancelOrder(orderId, userId)
    
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found or cannot be cancelled')
    }
    
    // HOÀN LẠI STOCK CHO TỪNG SẢN PHẨM
    for (const item of order.items) {
      await productModel.increaseStock(item.productId.toString(), item.quantity)
    }
    
    // Cập nhật payment
    const payment = await paymentModel.findByOrderId(orderId)
    if (payment && payment.status === 'paid') {
      await paymentModel.updateStatus(payment._id.toString(), 'refunded')
    }
    
    return order
  } catch (error) {
    throw error
  }
}

// CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
const updateStatus = async (orderId, status) => {
  try {
    const order = await orderModel.updateStatus(orderId, status)
    
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    return order
  } catch (error) {
    throw error
  }
}

// ADMIN - LẤY TẤT CẢ ĐƠN HÀNG
const getAllOrders = async (options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options
    
    return await orderModel.getAll({ page, limit, status })
  } catch (error) {
    throw error
  }
}

export const orderService = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateStatus,
  getAllOrders
}