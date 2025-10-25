/* eslint-disable no-useless-catch */
/* eslint-disable indent */
import { fieldModel } from '~/models/fieldModel'
import { bookingModel } from '~/models/bookingModel.js'
const createNew = async (reqBody) => {
  try {
    return await fieldModel.createNew(reqBody)
  } catch (error) {
    throw error
  }
}

const getAll = async () => {
  return await fieldModel.getAll()
}

const getById = async (id) => {
  return await fieldModel.findOneById(id)
}

const update = async (id, reqBody) => {
  return await fieldModel.updateOne(id, reqBody)
}

const remove = async (id) => {
  return await fieldModel.deleteOne(id)
}

const isAvailable = async (fieldId, bookingDate, startTime, endTime) => {
  // 1. Kiểm tra sân tồn tại
  const field = await fieldModel.findOneById(fieldId)
  if (!field) throw new Error('Field not found')

  // 2. Kiểm tra trùng giờ
  const overlap = await bookingModel.findOverlap(fieldId, bookingDate, startTime, endTime)
  if (overlap) {
    return {
      available: false,
      conflict: overlap
    }
  }

  return {
    available: true,
    conflict: null
  }
}


export const fieldService = {
  createNew,
  getAll,
  getById,
  update,
  remove,
  isAvailable
}
