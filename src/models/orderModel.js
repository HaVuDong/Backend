/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const ORDER_COLLECTION_NAME = 'orders'

const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().integer().min(1).required(),
      image: Joi.string().allow(null, '').optional()
    })
  ).min(1).required(),
  
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    district: Joi.string().optional(),
    ward: Joi.string().optional()
  }).required(),
  
  status: Joi.string()
    .valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')
    .default('pending'),
  
  paymentMethod: Joi.string().valid('cod', 'momo', 'vnpay', 'bank').required(),
  totalPrice: Joi.number().min(0).required(),
  
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await ORDER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validated = await validateBeforeCreate(data)
    
    // Convert IDs to ObjectId
    validated.userId = new ObjectId(validated.userId)
    validated.items = validated.items.map(item => ({
      ...item,
      productId: new ObjectId(item.productId)
    }))
    
    const result = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(validated)
    return { ...validated, _id: result.insertedId }
  } catch (error) {
    throw error
  }
}

const findOneById = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    return await GET_DB().collection(ORDER_COLLECTION_NAME).findOne({ _id: queryId })
  } catch (error) {
    throw error
  }
}

const findByUserId = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options
    
    const filter = { userId: new ObjectId(userId) }
    if (status) filter.status = status
    
    const skip = (page - 1) * limit
    
    const orders = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()
    
    const total = await GET_DB().collection(ORDER_COLLECTION_NAME).countDocuments(filter)
    
    return {
      orders,
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

const getAll = async (options = {}) => {
  try {
    const { page = 1, limit = 10, status } = options
    
    const filter = {}
    if (status) filter.status = status
    
    const skip = (page - 1) * limit
    
    const orders = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()
    
    const total = await GET_DB().collection(ORDER_COLLECTION_NAME).countDocuments(filter)
    
    return {
      orders,
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

const updateStatus = async (id, status) => {
  try {
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`)
    }
    
    const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    
    return result
  } catch (error) {
    throw error
  }
}

const cancelOrder = async (id, userId = null) => {
  try {
    const filter = { _id: new ObjectId(id) }
    if (userId) filter.userId = new ObjectId(userId)
    
    const order = await GET_DB().collection(ORDER_COLLECTION_NAME).findOne(filter)
    if (!order) throw new Error('Order not found')
    
    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`)
    }
    
    const result = await GET_DB().collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
      filter,
      { $set: { status: 'cancelled', updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    
    return result
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    return await GET_DB().collection(ORDER_COLLECTION_NAME).deleteOne({ _id: queryId })
  } catch (error) {
    throw error
  }
}

export const orderModel = {
  createNew,
  findOneById,
  findByUserId,
  getAll,
  updateStatus,
  cancelOrder,
  deleteOne
}