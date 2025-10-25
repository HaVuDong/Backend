/* eslint-disable no-useless-catch */
/* eslint-disable no-multi-spaces */
/* eslint-disable no-console */
/* eslint-disable indent */
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

const FIELD_COLLECTION_NAME = 'fields'
const FIELD_COLLECTION_SCHEMA = Joi.object({
    name: Joi.string().required().min(3).max(100).trim().strict(),
    slug: Joi.string().trim().lowercase().default(null),
    type: Joi.string().valid('5 người', '7 người', '11 người').required(),
    pricePerHour: Joi.number().required().min(0),
    status: Joi.string().valid('available', 'maintenance', 'unavailable').default('available'),
    location: Joi.string().allow('', null).max(200),
    description: Joi.string().max(500).allow('', null),
    images: Joi.array().items(Joi.string()).default([]), // chấp nhận cả uri hoặc filename
    amenities: Joi.array().items(Joi.string()).default([]),
    isActive: Joi.boolean().default(true)
})

const validateBeforeCreate = async (data) => {
    return await FIELD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
    const validated = await validateBeforeCreate(data)
    const result = await GET_DB().collection(FIELD_COLLECTION_NAME).insertOne(validated)
    console.log(result)
    return result
}

const findOneById = async (id) => {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null
    return await GET_DB().collection(FIELD_COLLECTION_NAME).findOne({ _id: queryId })
}

const getAll = async () => {
    return await GET_DB().collection(FIELD_COLLECTION_NAME).find().toArray()
}

const updateOne = async (id, data) => {
    try {
        const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
        if (!queryId) return null

        // ✅ Xóa _id khỏi data trước khi update
        if (data._id) delete data._id

        const result = await GET_DB()
            .collection(FIELD_COLLECTION_NAME)
            .findOneAndUpdate(
                { _id: queryId },
                { $set: { ...data, updatedAt: Date.now() } },
                { returnDocument: 'after' }
            )

        return result
    } catch (error) {
        throw error
    }
}



const deleteOne = async (id) => {
    const queryId = ObjectId.isValid(id) ? new ObjectId(id) : null
    if (!queryId) return null

    const result = await GET_DB()
        .collection(FIELD_COLLECTION_NAME)
        .deleteOne({ _id: queryId })
    console.log
    return result
}

export const fieldModel = {
    FIELD_COLLECTION_NAME,
    FIELD_COLLECTION_SCHEMA,
    createNew,
    findOneById,
    getAll,
    updateOne,
    deleteOne
}
