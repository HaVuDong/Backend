// backend/src/services/orderService.js
/* eslint-disable no-useless-catch */
import { orderModel } from '~/models/orderModel'
import { userModel } from '~/models/userModel'
import { cartModel } from '~/models/cartModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createOrder = async (data) => {
  try {
    const { userId, shippingAddress, paymentMethod } = data

    console.log('📦 [orderService] ===== CREATE ORDER START =====')
    console.log('📦 [orderService] Input:', { userId, shippingAddress, paymentMethod })

    // 1️⃣ LẤY USER INFO TỪ DATABASE
    console.log('👤 [orderService] Fetching user info...')
    const user = await userModel.findOneById(userId)
    
    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
    }

    const userInfo = {
      name: user.username || 'Unknown',
      email: user.email,
      phone: user.phone || ''
    }

    console.log('✅ [orderService] User info:', userInfo)

    // 2️⃣ LẤY CART TỪ DATABASE
    console.log('🛒 [orderService] Fetching cart...')
    const cart = await cartModel.getByUserId(userId)
    
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Cart is empty')
    }

    console.log('✅ [orderService] Cart found:', cart.items.length, 'items')

    // 3️⃣ KIỂM TRA TỒN KHO (nếu cần)
    // TODO: Implement stock checking

    // 4️⃣ TẠO ORDER DATA HOÀN CHỈNH
    // ⭐ SỬA: CONVERT productId SANG STRING
    const orderData = {
      userId,
      userInfo,
      items: cart.items.map(item => {
        // ⭐ QUAN TRỌNG: Extract productId và convert sang STRING
        let productId = item.productId;
        
        // Nếu productId là object (có _id), lấy _id
        if (productId && typeof productId === 'object' && productId._id) {
          productId = productId._id;
        }
        
        // Convert sang string (chắc chắn 100%)
        const productIdString = String(productId);
        
        console.log(`📦 [orderService] Item productId:`, {
          original: item.productId,
          extracted: productId,
          final: productIdString,
          type: typeof productIdString
        });
        
        return {
          productId: productIdString, // ⭐ ĐẢM BẢO LÀ STRING
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image || ''
        };
      }),
      shippingAddress,
      paymentMethod,
      totalPrice: cart.totalPrice
    }

    console.log('📦 [orderService] Order data:', JSON.stringify(orderData, null, 2))

    // 5️⃣ TẠO ORDER
    const order = await orderModel.createNew(orderData)

    console.log('✅ [orderService] Order created:', order._id)

    // 6️⃣ TẠO PAYMENT (nếu cần)
    const payment = {
      _id: 'payment_' + order._id,
      orderId: order._id,
      amount: order.totalPrice,
      method: paymentMethod,
      status: 'pending'
    }

    console.log('💳 [orderService] Payment created:', payment._id)

    // 7️⃣ XÓA CART
    await cartModel.clear(userId)

    console.log('✅ [orderService] Cart cleared')
    console.log('📦 [orderService] ===== CREATE ORDER END =====')

    return { order, payment }
  } catch (error) {
    console.error('❌ [orderService] Create order error:', error)
    throw error
  }
}

const getOrderById = async (orderId, userId = null) => {
  try {
    const order = await orderModel.findOneById(orderId)
    
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    if (userId && order.userId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
    }
    
    return order
  } catch (error) {
    throw error
  }
}

const getUserOrders = async (userId, options = {}) => {
  try {
    return await orderModel.findByUserId(userId, options)
  } catch (error) {
    throw error
  }
}

const getAllOrders = async (options = {}) => {
  try {
    return await orderModel.getAll(options)
  } catch (error) {
    throw error
  }
}

const updateOrderStatus = async (orderId, status) => {
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

const cancelOrder = async (orderId, userId = null) => {
  try {
    const order = await orderModel.cancelOrder(orderId, userId)
    
    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Order not found')
    }
    
    return order
  } catch (error) {
    throw error
  }
}

export const orderService = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
}