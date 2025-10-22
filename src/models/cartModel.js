import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const CART_COLLECTION_NAME = 'carts'

const CART_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      name: Joi.string().required(),
      price: Joi.number().min(0).required(),
      quantity: Joi.number().integer().min(1).required(),
      image: Joi.string().allow(null, '').optional()
    })
  ).default([]),
  totalPrice: Joi.number().min(0).default(0),
  updatedAt: Joi.date().timestamp().default(Date.now),
  createdAt: Joi.date().timestamp().default(Date.now)
})

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

const getByUserId = async (userId) => {
  return await GET_DB().collection(CART_COLLECTION_NAME).findOne({
    userId: new ObjectId(userId)
  })
}

const createNew = async (userId) => {
  const cart = {
    userId: new ObjectId(userId),
    items: [],
    totalPrice: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
  
  const result = await GET_DB().collection(CART_COLLECTION_NAME).insertOne(cart)
  return { ...cart, _id: result.insertedId }
}

const addItem = async (userId, product) => {
  const { productId, name, price, quantity, image } = product
  
  let cart = await getByUserId(userId)
  if (!cart) {
    cart = await createNew(userId)
  }
  
  const existingIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  )
  
  let updatedItems
  if (existingIndex > -1) {
    updatedItems = [...cart.items]
    updatedItems[existingIndex].quantity += quantity
  } else {
    updatedItems = [...cart.items, {
      productId: new ObjectId(productId),
      name,
      price,
      quantity,
      image
    }]
  }
  
  const totalPrice = calculateTotal(updatedItems)
  
  const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $set: { items: updatedItems, totalPrice, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  
  return result.value
}

const updateQuantity = async (userId, productId, quantity) => {
  const cart = await getByUserId(userId)
  if (!cart) throw new Error('Cart not found')
  
  const updatedItems = cart.items.map(item =>
    item.productId.toString() === productId
      ? { ...item, quantity: parseInt(quantity) }
      : item
  )
  
  const totalPrice = calculateTotal(updatedItems)
  
  const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $set: { items: updatedItems, totalPrice, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  
  return result.value
}

const removeItem = async (userId, productId) => {
  const cart = await getByUserId(userId)
  if (!cart) throw new Error('Cart not found')
  
  const updatedItems = cart.items.filter(
    item => item.productId.toString() !== productId
  )
  
  const totalPrice = calculateTotal(updatedItems)
  
  const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $set: { items: updatedItems, totalPrice, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  
  return result.value
}

const clear = async (userId) => {
  const result = await GET_DB().collection(CART_COLLECTION_NAME).findOneAndUpdate(
    { userId: new ObjectId(userId) },
    { $set: { items: [], totalPrice: 0, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  
  return result.value
}

export const cartModel = {
  getByUserId,
  createNew,
  addItem,
  updateQuantity,
  removeItem,
  clear
}