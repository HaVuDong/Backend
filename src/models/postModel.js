/* eslint-disable no-useless-catch */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const POST_COLLECTION_NAME = 'posts'
const POST_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(500).trim().strict(),
  summary: Joi.string().allow('').max(2000).trim().strict(),
  content: Joi.string().allow('').max(50000).trim().strict(),
  link: Joi.string().uri().allow('').trim().strict(),
  image: Joi.string().uri().allow('').trim().strict(),
  source: Joi.string().allow('').max(200).trim().strict(),
  category: Joi.string().valid('auto', 'manual', 'featured').default('auto'),
  status: Joi.string().valid('draft', 'published', 'archived').default('published'),
  viewCount: Joi.number().integer().min(0).default(0),
  author: Joi.string().allow('').max(200).trim().strict(),
  tags: Joi.array().items(Joi.string()).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  publishedAt: Joi.date().timestamp('javascript').default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await POST_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const result = await GET_DB().collection(POST_COLLECTION_NAME).insertOne(validData)
    return { ...validData, _id: result.insertedId }
  } catch (error) {
    throw error
  }
}

const findOneById = async (id) => {
  try {
    if (!ObjectId.isValid(id)) return null
    const post = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .findOne({ _id: new ObjectId(id) })
    return post
  } catch (error) {
    throw error
  }
}

const findByTitle = async (title) => {
  try {
    return await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .findOne({ title: title.trim() })
  } catch (error) {
    throw error
  }
}

const findByLink = async (link) => {
  try {
    return await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .findOne({ link: link.trim() })
  } catch (error) {
    throw error
  }
}

const getAll = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options

    const filter = {}
    if (status) filter.status = status
    if (category) filter.category = category

    const skip = (page - 1) * limit
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 }

    const posts = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()

    const total = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .countDocuments(filter)

    return {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    throw error
  }
}

const search = async (keyword, options = {}) => {
  try {
    const { page = 1, limit = 10, status = 'published' } = options

    const filter = {
      status,
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { summary: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } }
      ]
    }

    const skip = (page - 1) * limit

    const posts = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray()

    const total = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .countDocuments(filter)

    return {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    throw error
  }
}

const update = async (id, data) => {
  try {
    if (!ObjectId.isValid(id)) return null

    // Remove fields that shouldn't be updated
    const updateData = { ...data }
    delete updateData._id
    delete updateData.createdAt

    updateData.updatedAt = Date.now()

    const result = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw error
  }
}

const deleteOne = async (id) => {
  try {
    if (!ObjectId.isValid(id)) return null

    const result = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .deleteOne({ _id: new ObjectId(id) })

    return result
  } catch (error) {
    throw error
  }
}

const incrementViewCount = async (id) => {
  try {
    if (!ObjectId.isValid(id)) return null

    const result = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $inc: { viewCount: 1 } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error) {
    throw error
  }
}

const deleteOldPosts = async (timestamp) => {
  try {
    const result = await GET_DB()
      .collection(POST_COLLECTION_NAME)
      .deleteMany({
        createdAt: { $lt: timestamp }
      })

    return result.deletedCount
  } catch (error) {
    throw error
  }
}

export const postModel = {
  POST_COLLECTION_NAME,
  POST_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  findByTitle,
  findByLink,
  getAll,
  search,
  update,
  deleteOne,
  incrementViewCount,
  deleteOldPosts
}
