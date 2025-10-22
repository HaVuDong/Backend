import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createCategory = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().trim().strict(),
    slug: Joi.string().required().trim().strict().lowercase(),
    description: Joi.string().allow('', null).optional(),
    image: Joi.string().uri().allow('', null).optional(),
    parentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
    order: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid('active', 'inactive').optional()
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

const updateCategory = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().trim().strict().optional(),
    slug: Joi.string().trim().strict().lowercase().optional(),
    description: Joi.string().allow('', null).optional(),
    image: Joi.string().uri().allow('', null).optional(),
    parentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null).optional(),
    order: Joi.number().integer().min(0).optional(),
    status: Joi.string().valid('active', 'inactive').optional()
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

export const categoryValidation = {
  createCategory,
  updateCategory
}