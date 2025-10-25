import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createOrder = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    shippingAddress: Joi.object({
      fullName: Joi.string().required().trim().strict(),
      phone: Joi.string().pattern(/^[0-9]{10,11}$/).required(),
      address: Joi.string().required().trim().strict(),
      city: Joi.string().required().trim().strict(),
      district: Joi.string().allow(null, '').optional(),
      ward: Joi.string().allow(null, '').optional()
    }).required(),
    paymentMethod: Joi.string().valid('cod', 'momo', 'vnpay', 'bank').required()
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