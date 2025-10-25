import { StatusCodes } from 'http-status-codes'
import { cartService } from '~/services/cartService'

const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id // Từ middleware authentication
    
    const cart = await cartService.getCart(userId)
    
    res.status(StatusCodes.OK).json(cart)
  } catch (error) {
    next(error)
  }
}

const addItem = async (req, res, next) => {
  try {
    const userId = req.user._id
    const productData = req.body
    
    const cart = await cartService.addItem(userId, productData)
    
    res.status(StatusCodes.OK).json({
      message: 'Product added to cart successfully',
      cart
    })
  } catch (error) {
    next(error)
  }
}

const updateQuantity = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { productId } = req.params
    const { quantity } = req.body
    
    const cart = await cartService.updateQuantity(userId, productId, quantity)
    
    res.status(StatusCodes.OK).json({
      message: 'Cart updated successfully',
      cart
    })
  } catch (error) {
    next(error)
  }
}

const removeItem = async (req, res, next) => {
  try {
    const userId = req.user._id
    const { productId } = req.params
    
    const cart = await cartService.removeItem(userId, productId)
    
    res.status(StatusCodes.OK).json({
      message: 'Product removed from cart successfully',
      cart
    })
  } catch (error) {
    next(error)
  }
}

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id
    
    const cart = await cartService.clearCart(userId)
    
    res.status(StatusCodes.OK).json({
      message: 'Cart cleared successfully',
      cart
    })
  } catch (error) {
    next(error)
  }
}

export const cartController = {
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart
}