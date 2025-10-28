// backend/src/validations/orderValidation.js
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createOrder = async (req, res, next) => {
  console.log('📋 [orderValidation] ===== VALIDATION START =====')
  console.log('📋 [orderValidation] Request body:', JSON.stringify(req.body, null, 2))
  
  // ⭐ CHỈ VALIDATE 3 FIELDS
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    shippingAddress: Joi.string().required().min(10).trim().strict(),
    paymentMethod: Joi.string().valid('cod', 'momo', 'vnpay', 'bank').required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    console.log('✅ [orderValidation] Validation passed')
    next()
  } catch (error) {
    console.error('❌ [orderValidation] Validation failed:', error.message)
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

const updateStatus = async (req, res, next) => {
  const correctCondition = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').required()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = new Error(error).message
    const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(customError)
  }
}

export const orderValidation = {
  createOrder,
  updateStatus
}