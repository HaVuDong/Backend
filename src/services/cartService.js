/* eslint-disable no-useless-catch */
import { cartModel } from '~/models/cartModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const getCart = async (userId) => {
  try {
    let cart = await cartModel.getByUserId(userId)
    
    // Nếu chưa có giỏ hàng, tạo mới
    if (!cart) {
      cart = await cartModel.createNew(userId)
    }
    
    return cart
  } catch (error) {
    throw error
  }
}

const addItem = async (userId, productData) => {
  try {
    const { productId, name, price, quantity, image } = productData
    
    // Validate dữ liệu
    if (!productId || !name || price === undefined || !quantity) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing required product information')
    }
    
    // Thêm sản phẩm vào giỏ
    const cart = await cartModel.addItem(userId, {
      productId,
      name,
      price,
      quantity,
      image: image || null
    })
    
    return cart
  } catch (error) {
    throw error
  }
}

const updateQuantity = async (userId, productId, quantity) => {
  try {
    if (quantity < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Quantity must be at least 1')
    }
    
    const cart = await cartModel.updateQuantity(userId, productId, quantity)
    
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found')
    }
    
    return cart
  } catch (error) {
    throw error
  }
}

const removeItem = async (userId, productId) => {
  try {
    const cart = await cartModel.removeItem(userId, productId)
    
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found')
    }
    
    return cart
  } catch (error) {
    throw error
  }
}

const clearCart = async (userId) => {
  try {
    const cart = await cartModel.clear(userId)
    
    if (!cart) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Cart not found')
    }
    
    return cart
  } catch (error) {
    throw error
  }
}

export const cartService = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
}