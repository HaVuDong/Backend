// backend/src/controllers/orderController.js
import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/orderService'

const createOrder = async (req, res, next) => {
  try {
    console.log('📦 [orderController] ===== CREATE ORDER START =====')
    console.log('📦 [orderController] Request body:', JSON.stringify(req.body, null, 2))
    
    const result = await orderService.createOrder(req.body)
    
    console.log('✅ [orderController] Order created successfully')
    console.log('📦 [orderController] ===== CREATE ORDER END =====')
    
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Order created successfully',
      ...result
    })
  } catch (error) {
    console.error('❌ [orderController] Create order error:', error.message)
    next(error)
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.query.userId
    
    const order = await orderService.getOrderById(id, userId)
    
    res.status(StatusCodes.OK).json({
      success: true,
      order
    })
  } catch (error) {
    next(error)
  }
}

const getUserOrders = async (req, res, next) => {
  try {
    const { userId, page, limit, status } = req.query
    
    const result = await orderService.getUserOrders(userId, { page, limit, status })
    
    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query
    
    const result = await orderService.getAllOrders({ page, limit, status })
    
    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const order = await orderService.updateOrderStatus(id, status)
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order status updated',
      order
    })
  } catch (error) {
    next(error)
  }
}

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    
    const order = await orderService.cancelOrder(id, userId)
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Order cancelled',
      order
    })
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  createOrder,
  getOrderById,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
}