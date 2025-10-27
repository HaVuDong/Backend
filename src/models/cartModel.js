/* eslint-disable no-unused-vars */
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

// ⭐ Helper: Tính tổng tiền
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0)
}

// ⭐ GET CART by userId
const getByUserId = async (userId) => {
  try {
    const userObjectId = new ObjectId(userId)
    const cart = await GET_DB().collection(CART_COLLECTION_NAME).findOne({
      userId: userObjectId
    })
    console.log(`📦 [getByUserId] Cart for user ${userId}:`, cart ? 'Found' : 'Not found')
    return cart
  } catch (error) {
    console.error('❌ Error in getByUserId:', error)
    throw error
  }
}

// ⭐ CREATE NEW CART
const createNew = async (userId) => {
  try {
    const cart = {
      userId: new ObjectId(userId),
      items: [],
      totalPrice: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    const result = await GET_DB().collection(CART_COLLECTION_NAME).insertOne(cart)
    console.log(`✅ [createNew] Created new cart for user ${userId}`)
    return { ...cart, _id: result.insertedId }
  } catch (error) {
    console.error('❌ Error in createNew:', error)
    throw error
  }
}

// ⭐ ADD ITEM (ĐÃ FIX LỖI NULL)
const addItem = async (userId, product) => {
  try {
    const { productId, name, price, quantity, image } = product
    
    console.log('📦 [addItem] Input:', { userId, product })
    
    // ⭐ Validate productId
    if (!productId) {
      throw new Error('Product ID is required')
    }
    
    // ⭐ Kiểm tra cart tồn tại, nếu không thì tạo mới
    let cart = await getByUserId(userId)
    if (!cart) {
      console.log('🆕 Cart not found, creating new cart...')
      cart = await createNew(userId)
    }
    
    console.log('📋 Current cart:', cart)
    
    // ⭐ Convert productId to ObjectId
    let productObjectId
    try {
      productObjectId = new ObjectId(productId)
    } catch (err) {
      console.error('❌ Invalid productId:', productId)
      throw new Error(`Invalid product ID: ${productId}`)
    }
    
    // ⭐ Kiểm tra sản phẩm đã tồn tại chưa
    const existingIndex = cart.items.findIndex(
      item => item.productId.toString() === productObjectId.toString()
    )
    
    let updatedItems
    if (existingIndex > -1) {
      // Tăng quantity nếu đã tồn tại
      console.log('✏️ Updating existing item quantity')
      updatedItems = [...cart.items]
      updatedItems[existingIndex].quantity += quantity
    } else {
      // Thêm mới
      console.log('➕ Adding new item to cart')
      updatedItems = [...cart.items, {
        productId: productObjectId,
        name,
        price,
        quantity,
        image: image || null
      }]
    }
    
    const totalPrice = calculateTotal(updatedItems)
    
    console.log('💾 Updating cart with items:', updatedItems)
    
    // ⭐ FIX: Sử dụng updateOne thay vì findOneAndUpdate + check result
    const updateResult = await GET_DB().collection(CART_COLLECTION_NAME).updateOne(
      { userId: new ObjectId(userId) },
      { 
        $set: { 
          items: updatedItems, 
          totalPrice, 
          updatedAt: Date.now() 
        } 
      }
    )
    
    console.log('✅ Update result:', updateResult)
    
    // ⭐ Lấy lại cart sau khi update
    const updatedCart = await getByUserId(userId)
    
    console.log('✅ Cart updated successfully:', updatedCart)
    
    return updatedCart
  } catch (error) {
    console.error('❌ Error in addItem:', error)
    throw error
  }
}

// ⭐ UPDATE QUANTITY (ĐÃ FIX)
const updateQuantity = async (userId, productId, quantity) => {
  try {
    console.log('🔄 [updateQuantity]:', { userId, productId, quantity })
    
    const cart = await getByUserId(userId)
    if (!cart) throw new Error('Cart not found')
    
    const updatedItems = cart.items.map(item =>
      item.productId.toString() === productId
        ? { ...item, quantity: parseInt(quantity) }
        : item
    )
    
    const totalPrice = calculateTotal(updatedItems)
    
    await GET_DB().collection(CART_COLLECTION_NAME).updateOne(
      { userId: new ObjectId(userId) },
      { $set: { items: updatedItems, totalPrice, updatedAt: Date.now() } }
    )
    
    const updatedCart = await getByUserId(userId)
    console.log('✅ Quantity updated successfully')
    
    return updatedCart
  } catch (error) {
    console.error('❌ Error in updateQuantity:', error)
    throw error
  }
}

// ⭐ REMOVE ITEM (ĐÃ FIX)
const removeItem = async (userId, productId) => {
  try {
    console.log('🗑️ [removeItem]:', { userId, productId })
    
    const cart = await getByUserId(userId)
    if (!cart) throw new Error('Cart not found')
    
    const updatedItems = cart.items.filter(
      item => item.productId.toString() !== productId
    )
    
    const totalPrice = calculateTotal(updatedItems)
    
    await GET_DB().collection(CART_COLLECTION_NAME).updateOne(
      { userId: new ObjectId(userId) },
      { $set: { items: updatedItems, totalPrice, updatedAt: Date.now() } }
    )
    
    const updatedCart = await getByUserId(userId)
    console.log('✅ Item removed successfully')
    
    return updatedCart
  } catch (error) {
    console.error('❌ Error in removeItem:', error)
    throw error
  }
}

// ⭐ CLEAR CART (ĐÃ FIX)
const clear = async (userId) => {
  try {
    console.log('🧹 [clear] cart:', { userId })
    
    await GET_DB().collection(CART_COLLECTION_NAME).updateOne(
      { userId: new ObjectId(userId) },
      { $set: { items: [], totalPrice: 0, updatedAt: Date.now() } }
    )
    
    const updatedCart = await getByUserId(userId)
    console.log('✅ Cart cleared successfully')
    
    return updatedCart
  } catch (error) {
    console.error('❌ Error in clear:', error)
    throw error
  }
}

export const cartModel = {
  getByUserId,
  createNew,
  addItem,
  updateQuantity,
  removeItem,
  clear
}