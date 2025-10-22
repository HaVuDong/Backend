import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const CUSTOMER_COLLECTION_NAME = 'customers'
const CUSTOMER_COLLECTION_SCHEMA = Joi.object({
  name: Joi.string().required().min(3).max(100).trim().strict(),
  email: Joi.string().email().required(),
  phone: Joi.string().required().min(8).max(15),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await CUSTOMER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  const result = await GET_DB().collection(CUSTOMER_COLLECTION_NAME).insertOne(validData)
  return result
}

const findOneById = async (id) => {
  return await GET_DB().collection(CUSTOMER_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
}

const getAll = async () => {
  return await GET_DB().collection(CUSTOMER_COLLECTION_NAME).find().toArray()
}

const updateOne = async (id, data) => {
  const result = await GET_DB().collection(CUSTOMER_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...data, updatedAt: Date.now() } },
      { returnDocument: 'after' }
    )
  return result
}

const deleteOne = async (id) => {
  return await GET_DB().collection(CUSTOMER_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) })
}

export const customerModel = {
  CUSTOMER_COLLECTION_NAME,
  createNew,
  findOneById,
  getAll,
  updateOne,
  deleteOne
}
