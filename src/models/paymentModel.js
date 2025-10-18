import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const PAYMENT_COLLECTION_NAME = 'payments'
const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  bookingId: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  method: Joi.string().valid('cash', 'bank', 'momo').required(),
  status: Joi.string().valid('pending', 'paid', 'refunded').default('pending'),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
})

const validateBeforeCreate = async (data) => {
  return await PAYMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  const validated = await validateBeforeCreate(data)
  const result = await GET_DB().collection(PAYMENT_COLLECTION_NAME).insertOne(validated)
  return result
}

const findOneById = async (id) => {
  const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
  if (!queryId) return null
  return await GET_DB().collection(PAYMENT_COLLECTION_NAME).findOne({ _id: queryId })
}

const getAll = async () => {
  return await GET_DB().collection(PAYMENT_COLLECTION_NAME).find().toArray()
}

const updateOne = async (id, data) => {
  const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
  if (!queryId) return null
  const result = await GET_DB().collection(PAYMENT_COLLECTION_NAME).findOneAndUpdate(
    { _id: queryId },
    { $set: { ...data, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  )
  return result.value
}

const deleteOne = async (id) => {
  const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
  if (!queryId) return null
  return await GET_DB().collection(PAYMENT_COLLECTION_NAME).deleteOne({ _id: queryId })
}

export const paymentModel = {
  createNew, findOneById, getAll, updateOne, deleteOne
}
