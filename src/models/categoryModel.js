/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const CATEGORY_COLLECTION_NAME = 'categories'

const CATEGORY_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().trim().strict(),
  slug: Joi.string().required().trim().strict(),
  description: Joi.string().allow('', null).optional(),
  image: Joi.string().uri().allow('', null).optional(),
  parentId: Joi.string().allow(null).optional(), // Category cha (nếu có subcategory)
  order: Joi.number().integer().default(0), // Thứ tự hiển thị
  status: Joi.string().valid('active', 'inactive').default('active'),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await CATEGORY_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

// CREATE
const createNew = async (data) => {
  try {
    const validated = await validateBeforeCreate(data)
    if (validated.parentId && ObjectId.isValid(validated.parentId)) {
      validated.parentId = new ObjectId(validated.parentId)
    }
    
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).insertOne(validated)
    return { ...validated, _id: result.insertedId }
  } catch (error) {
    throw error
  }
}

// READ - Lấy tất cả categories
const getAll = async (options = {}) => {
  try {
    const { status } = options
    const filter = {}
    if (status) filter.status = status
    
    return await GET_DB()
      .collection(CATEGORY_COLLECTION_NAME)
      .find(filter)
      .sort({ order: 1, name: 1 })
      .toArray()
  } catch (error) {
    throw error
  }
}

// READ - Chi tiết category
const findOneById = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    return await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ _id: queryId })
  } catch (error) {
    throw error
  }
}

// READ - Tìm theo slug
const findBySlug = async (slug) => {
  try {
    return await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOne({ slug })
  } catch (error) {
    throw error
  }
}

// UPDATE
const updateOne = async (id, data) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    
    if (data.parentId && ObjectId.isValid(data.parentId)) {
      data.parentId = new ObjectId(data.parentId)
    }
    
    const result = await GET_DB().collection(CATEGORY_COLLECTION_NAME).findOneAndUpdate(
      { _id: queryId },
      { $set: { ...data, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
    
    return result
  } catch (error) {
    throw error
  }
}

// DELETE
const deleteOne = async (id) => {
  try {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    
    // Kiểm tra xem có sản phẩm nào thuộc category này không
    const productCount = await GET_DB().collection('products').countDocuments({
      categoryId: queryId
    })
    
    if (productCount > 0) {
      throw new Error('Cannot delete category with existing products')
    }
    
    return await GET_DB().collection(CATEGORY_COLLECTION_NAME).deleteOne({ _id: queryId })
  } catch (error) {
    throw error
  }
}

// COUNT products in category
const getProductCount = async (categoryId) => {
  try {
    return await GET_DB().collection('products').countDocuments({
      categoryId: new ObjectId(categoryId)
    })
  } catch (error) {
    throw error
  }
}

export const categoryModel = {
  createNew,
  getAll,
  findOneById,
  findBySlug,
  updateOne,
  deleteOne,
  getProductCount
}