import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const addToCart = async (req, res, next) => {
  const correctCondition = Joi.object({
    productId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    name: Joi.string().required().trim().strict(),
    price: Joi.number().min(0).required(),
    quantity: Joi.number().integer().min(1).required(),
    image: Joi.string().uri().allow(null, '').optional()
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

const updateQuantity = async (req, res, next) => {
  const correctCondition = Joi.object({
    quantity: Joi.number().integer().min(1).required()
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

export const cartValidation = {
  addToCart,
  updateQuantity
}