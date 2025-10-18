/* eslint-disable quotes */
/* eslint-disable no-undef */
/* eslint-disable indent */
import Joi from "joi"
import { ObjectId } from "mongodb"
import { GET_DB } from "~/config/mongodb"

export const USER_COLLECTION_NAME = "users"

export const USER_COLLECTION_SCHEMA = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid("user", "admin").default("user"),
  phone: Joi.string()
    .pattern(/^(0|\+84)\d{9,10}$/)
    .message("Số điện thoại không hợp lệ")
    .required(),
  createdAt: Joi.date().default(() => new Date()),
  updatedAt: Joi.date().default(() => new Date())
})

const validateBeforeCreate = (data) => {
  return USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  const validData = await validateBeforeCreate(data)
  return await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validData)
}

const getAll = async () => {
  return await GET_DB().collection(USER_COLLECTION_NAME).find().toArray()
}

const findOneById = async (id) => {
  const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
  if (!queryId) return null
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({ _id: queryId })
}

const findByEmail = async (email) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({ email })
}

const findByUsername = async (username) => {
  return await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({ username })
}

const update = async (id, data) => {
  const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
  if (!queryId) return null

  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: queryId },
      { $set: { ...data, updatedAt: new Date() } },
      { returnDocument: "after" }
    )

  return result.value
}

const deleteOne = async (id) => {
  const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
  if (!queryId) return null

  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .deleteOne({ _id: queryId })

  return result.deletedCount > 0
}

export const userModel = {
  USER_COLLECTION_NAME,
  createNew,
  findOneById,
  findByEmail,
  findByUsername,
  update,
  deleteOne,
  getAll
}
