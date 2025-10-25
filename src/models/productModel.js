/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const PRODUCT_COLLECTION_NAME = 'products'

const PRODUCT_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  description: Joi.string().allow('').trim(), // ⬅️ SỬA: cho phép empty
  price: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0).optional(),
  
  categoryId: Joi.string().required(),
  categoryName: Joi.string().optional(), // ⬅️ SỬA: optional
  
  images: Joi.array().items(Joi.string()).default([]), // ⬅️ SỬA: không bắt buộc uri
  
  stock: Joi.number().integer().min(0).default(0),
  sold: Joi.number().integer().min(0).default(0),
  
  specifications: Joi.object({
    brand: Joi.string().optional(),
    material: Joi.string().optional(),
    size: Joi.array().items(Joi.string()).optional(),
    color: Joi.array().items(Joi.string()).optional(),
    weight: Joi.string().optional()
  }).optional(),
  
  slug: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
  
  status: Joi.string().valid('active', 'inactive', 'out_of_stock').default('active'),
  featured: Joi.boolean().default(false),
  
  rating: Joi.number().min(0).max(5).default(0),
  reviewCount: Joi.number().integer().min(0).default(0),
  
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now),
  deletedAt: Joi.date().timestamp().allow(null).optional()
})

const validateBeforeCreate = async (data) => {
  return await PRODUCT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// CREATE
const createNew = async (data) => {
  try {
    const validated = await validateBeforeCreate(data)
    validated.categoryId = new ObjectId(validated.categoryId)
    
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).insertOne(validated)
    return { ...validated, _id: result.insertedId }
  } catch (error) {
    throw error
  }
}

// ⭐ READ - SỬA LẠI HOÀN TOÀN
const getAll = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      minPrice,
      maxPrice,
      status, // ⬅️ QUAN TRỌNG: Không set default 'active'
      featured,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options
    
    console.log('📦 [productModel.getAll] Options:', options)
    
    const filter = { deletedAt: null }
    
    // ⬅️ SỬA: Chỉ filter status nếu không phải 'all'
    if (status && status !== 'all') {
      filter.status = status
    }
    
    if (categoryId) {
      filter.categoryId = ObjectId.isValid(categoryId) ? new ObjectId(categoryId) : categoryId
    }
    
    if (featured !== undefined) {
      filter.featured = featured === true || featured === 'true'
    }
    
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = parseFloat(minPrice)
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice)
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }
    
    console.log('📦 [productModel.getAll] Filter:', JSON.stringify(filter, null, 2))
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
    
    const products = await GET_DB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()
    
    const total = await GET_DB().collection(PRODUCT_COLLECTION_NAME).countDocuments(filter)
    
    console.log('✅ [productModel.getAll] Found:', products.length, 'products')
    console.log('✅ [productModel.getAll] Total in DB:', total)
    
    return {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        limit: parseInt(limit)
      }
    }
  } catch (error) {
    console.error('❌ [productModel.getAll] Error:', error)
    throw error
  }
}

// READ - Chi tiết sản phẩm
const findOneById = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      _id: queryId,
      deletedAt: null
    })
  } catch (error) {
    throw error
  }
}

// READ - Tìm theo slug
const findBySlug = async (slug) => {
  try {
    return await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOne({
      slug,
      deletedAt: null
    })
  } catch (error) {
    throw error
  }
}

// UPDATE
const updateOne = async (id, data) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    
    if (data.categoryId) {
      data.categoryId = new ObjectId(data.categoryId)
    }
    
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: queryId, deletedAt: null },
      { $set: { ...data, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    
    return result
  } catch (error) {
    throw error
  }
}

// UPDATE - Giảm stock
const decreaseStock = async (productId, quantity) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      {
        _id: new ObjectId(productId),
        stock: { $gte: quantity },
        deletedAt: null
      },
      {
        $inc: {
          stock: -quantity,
          sold: quantity
        },
        $set: { updatedAt: Date.now() }
      },
      { returnDocument: 'after' }
    )
    
    if (!result) {
      throw new Error('Product out of stock or not found')
    }
    
    if (result.stock === 0) {
      await GET_DB().collection(PRODUCT_COLLECTION_NAME).updateOne(
        { _id: new ObjectId(productId) },
        { $set: { status: 'out_of_stock' } }
      )
    }
    
    return result
  } catch (error) {
    throw error
  }
}

// UPDATE - Tăng stock
const increaseStock = async (productId, quantity) => {
  try {
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(productId), deletedAt: null },
      {
        $inc: {
          stock: quantity,
          sold: -quantity
        },
        $set: {
          status: 'active',
          updatedAt: Date.now()
        }
      },
      { returnDocument: 'after' }
    )
    
    return result
  } catch (error) {
    throw error
  }
}

// SOFT DELETE
const softDelete = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    
    const result = await GET_DB().collection(PRODUCT_COLLECTION_NAME).findOneAndUpdate(
      { _id: queryId },
      { $set: { deletedAt: Date.now(), status: 'inactive' } },
      { returnDocument: 'after' }
    )
    
    return result
  } catch (error) {
    throw error
  }
}

// STATISTICS
const getTopSelling = async (limit = 10) => {
  try {
    return await GET_DB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({ deletedAt: null, status: 'active' })
      .sort({ sold: -1 })
      .limit(parseInt(limit))
      .toArray()
  } catch (error) {
    throw error
  }
}

const getLowStock = async (threshold = 10) => {
  try {
    return await GET_DB()
      .collection(PRODUCT_COLLECTION_NAME)
      .find({
        deletedAt: null,
        status: 'active',
        stock: { $lte: parseInt(threshold), $gt: 0 }
      })
      .sort({ stock: 1 })
      .toArray()
  } catch (error) {
    throw error
  }
}

export const productModel = {
  createNew,
  getAll,
  findOneById,
  findBySlug,
  updateOne,
  decreaseStock,
  increaseStock,
  softDelete,
  getTopSelling,
  getLowStock
}