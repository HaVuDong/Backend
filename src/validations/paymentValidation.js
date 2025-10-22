import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createPayment = async (req, res, next) => {
  const correctCondition = Joi.object({
    orderId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)
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

const confirmCOD = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/)
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

const cancelPayment = async (req, res, next) => {
  const correctCondition = Joi.object({
    userId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    reason: Joi.string().allow(null, '').optional()
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

const refundPayment = async (req, res, next) => {
  const correctCondition = Joi.object({
    reason: Joi.string().allow(null, '').optional()
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

export const paymentValidation = {
  createPayment,
  confirmCOD,
  cancelPayment,
  refundPayment
}