/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable indent */
import { StatusCodes } from 'http-status-codes'
import { fieldService } from '~/services/fieldService'
import path from "path"

const createNew = async (req, res, next) => {
  try {
    // Lấy danh sách ảnh mới tải lên (nếu có)
    const images =
      req.files?.map((f) => `/uploads/fields/${path.basename(f.path)}`) || []

    // Gộp dữ liệu vào body
    const data = { ...req.body, images }

    const created = await fieldService.createNew(data)

    res.status(StatusCodes.CREATED).json({ success: true, data: created })
    console.log("✅ Field created:", created)
  } catch (error) {
    next(error)
  }
}


const getAll = async (req, res, next) => {
  try {
    const fields = await fieldService.getAll()
    res.status(StatusCodes.OK).json({ success: true, data: fields })
    console.log(fields)
  } catch (error) {
    next(error)
  }
}

const getById = async (req, res, next) => {
  try {
    const field = await fieldService.getById(req.params.id)
    if (!field) {
      const notFoundError = new Error('Field not found')
      notFoundError.statusCode = StatusCodes.NOT_FOUND
      throw notFoundError
    }
    res.status(StatusCodes.OK).json({ success: true, data: field })
    console.log(field)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const id = req.params.id

    // Lấy danh sách ảnh cũ từ form (nếu có)
    const oldImages = Array.isArray(req.body["oldImages[]"])
      ? req.body["oldImages[]"]
      : req.body["oldImages[]"]
        ? [req.body["oldImages[]"]]
        : []

    // Lấy ảnh mới tải lên (nếu có)
    const newImages =
      req.files?.map((f) => `/uploads/fields/${path.basename(f.path)}`) || []

    // Gộp tất cả ảnh
    const allImages = [...oldImages, ...newImages]

    const payload = { ...req.body, images: allImages }

    const updatedField = await fieldService.update(id, payload)

    if (!updatedField) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: "Field not found" })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Field updated successfully",
      data: updatedField
    })
  } catch (error) {
    next(error)
  }
}



const remove = async (req, res, next) => {
  try {
    const deleted = await fieldService.remove(req.params.id)
    if (!deleted || deleted.deletedCount === 0) {
      const notFoundError = new Error('Field not found')
      notFoundError.statusCode = StatusCodes.NOT_FOUND
      throw notFoundError
    }
    res.status(StatusCodes.OK).json({ success: true, message: 'Field deleted successfully' })
  } catch (error) {
    next(error)
  }
}

const checkAvailability = async (req, res, next) => {
  try {
    const { fieldId, bookingDate, startTime, endTime } = req.body
    const result = await fieldService.isAvailable(fieldId, bookingDate, startTime, endTime)
    res.status(StatusCodes.OK).json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}

export const fieldController = {
  createNew,
  getAll,
  getById,
  update,
  remove,
  checkAvailability
}
