// backend/src/models/orderModel.js
/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const ORDER_COLLECTION_NAME = 'orders'

// ⭐ SCHEMA ĐƠN GIẢN - BACKEND TỰ THÊM userInfo
const ORDER_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  
  userInfo: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().allow(null, '').optional()
  }).required(),

  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().integer().min(1).required(),
      image: Joi.string().allow(null, '').optional()
    })
  ).min(1).required(),

  shippingAddress: Joi.string().required().min(10).trim(),
  
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
    console.log('📦 [orderModel] Creating order with data:', data)

    const validated = await validateBeforeCreate(data)

    console.log('✅ [orderModel] Validation passed')

    // Convert IDs to ObjectId
    validated.userId = new ObjectId(validated.userId)
    validated.items = validated.items.map((item) => ({
      ...item,
      productId: new ObjectId(item.productId)
    }))

    const result = await GET_DB().collection(ORDER_COLLECTION_NAME).insertOne(validated)
    
    console.log('✅ [orderModel] Order created with ID:', result.insertedId)

    return { ...validated, _id: result.insertedId }
  } catch (error) {
    console.error('❌ [orderModel] Create order error:', error)
    throw error
  }
}

const findOneById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) return null
    return await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
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

    const total = await GET_DB()
      .collection(ORDER_COLLECTION_NAME)
      .countDocuments(filter)

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
    const db = GET_DB()

    const orders = await db
      .collection(ORDER_COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()

    const total = await db.collection(ORDER_COLLECTION_NAME).countDocuments(filter)

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
    if (!validStatuses.includes(status)) throw new Error(`Invalid status: ${status}`)

    const db = GET_DB()
    const result = await db.collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )

    return result.value
  } catch (error) {
    throw error
  }
}

const cancelOrder = async (id, userId = null) => {
  try {
    const db = GET_DB()
    const filter = { _id: new ObjectId(id) }
    if (userId) filter.userId = new ObjectId(userId)

    const order = await db.collection(ORDER_COLLECTION_NAME).findOne(filter)
    if (!order) throw new Error('Order not found')

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error(`Cannot cancel order with status: ${order.status}`)
    }

    const result = await db.collection(ORDER_COLLECTION_NAME).findOneAndUpdate(
      filter,
      { $set: { status: 'cancelled', updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )

    return result.value
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
  cancelOrder
}