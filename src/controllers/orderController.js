import { StatusCodes } from 'http-status-codes'
import { orderService } from '~/services/orderService'

const createOrder = async (req, res, next) => {
  try {
    const { userId, ...orderData } = req.body
    
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'userId is required in request body'
      })
    }
    
    const result = await orderService.createOrder(userId, orderData)
    
    res.status(StatusCodes.CREATED).json({
      message: 'Order created successfully',
      ...result
    })
  } catch (error) {
    next(error)
  }
}

const getOrders = async (req, res, next) => {
  try {
    const { userId, page, limit, status } = req.query
    
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'userId is required in query params'
      })
    }
    
    const result = await orderService.getOrders(userId, { page, limit, status })
    
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    
    const order = await orderService.getOrderById(id, userId)
    
    res.status(StatusCodes.OK).json(order)
  } catch (error) {
    next(error)
  }
}

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    
    if (!userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'userId is required in request body'
      })
    }
    
    const order = await orderService.cancelOrder(id, userId)
    
    res.status(StatusCodes.OK).json({
      message: 'Order cancelled successfully',
      order
    })
  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const order = await orderService.updateStatus(id, status)
    
    res.status(StatusCodes.OK).json({
      message: 'Order status updated successfully',
      order
    })
  } catch (error) {
    next(error)
  }
}

const getAllOrders = async (req, res, next) => {
  try {
    const { page, limit, status } = req.query
    
    const result = await orderService.getAllOrders({ page, limit, status })
    
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const orderController = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateStatus,
  getAllOrders
}