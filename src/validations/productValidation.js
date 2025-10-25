import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createProduct = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().required().trim().strict(),
    description: Joi.string().required().trim(),
    price: Joi.number().min(0).required(),
    originalPrice: Joi.number().min(0).optional(),
    
    categoryId: Joi.string().required().pattern(/^[0-9a-fA-F]{24}$/),
    
    images: Joi.array().items(Joi.string().uri()).min(1).required(),
    
    stock: Joi.number().integer().min(0).default(0),
    
    specifications: Joi.object({
      brand: Joi.string().optional(),
      material: Joi.string().optional(),
      size: Joi.array().items(Joi.string()).optional(),
      color: Joi.array().items(Joi.string()).optional(),
      weight: Joi.string().optional()
    }).optional(),
    
    slug: Joi.string().required().trim().strict().lowercase(),
    tags: Joi.array().items(Joi.string()).optional(),
    
    status: Joi.string().valid('active', 'inactive', 'out_of_stock').optional(),
    featured: Joi.boolean().optional()
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

const updateProduct = async (req, res, next) => {
  const correctCondition = Joi.object({
    name: Joi.string().trim().strict().optional(),
    description: Joi.string().trim().optional(),
    price: Joi.number().min(0).optional(),
    originalPrice: Joi.number().min(0).optional(),
    
    categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
    
    images: Joi.array().items(Joi.string().uri()).min(1).optional(),
    
    stock: Joi.number().integer().min(0).optional(),
    
    specifications: Joi.object({
      brand: Joi.string().optional(),
      material: Joi.string().optional(),
      size: Joi.array().items(Joi.string()).optional(),
      color: Joi.array().items(Joi.string()).optional(),
      weight: Joi.string().optional()
    }).optional(),
    
    slug: Joi.string().trim().strict().lowercase().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    
    status: Joi.string().valid('active', 'inactive', 'out_of_stock').optional(),
    featured: Joi.boolean().optional()
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

export const productValidation = {
  createProduct,
  updateProduct
}