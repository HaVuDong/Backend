import { StatusCodes } from 'http-status-codes'
import { customerService } from '~/services/customerService'

const createNew = async (req, res, next) => {
  try {
    const result = await customerService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({ success: true, data: result })
  } catch (error) { next(error) }
}

const getAll = async (req, res, next) => {
  try {
    const result = await customerService.getAll()
    res.status(StatusCodes.OK).json({ success: true, data: result })
  } catch (error) { next(error) }
}

const getById = async (req, res, next) => {
  try {
    const result = await customerService.getById(req.params.id)
    if (!result) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Customer not found' })
    res.status(StatusCodes.OK).json({ success: true, data: result })
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const result = await customerService.update(req.params.id, req.body)
    if (!result) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Customer not found' })
    res.status(StatusCodes.OK).json({ success: true, data: result })
  } catch (error) { next(error) }
}

const remove = async (req, res, next) => {
  try {
    const result = await customerService.remove(req.params.id)
    if (!result || result.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Customer not found' })
    }
    res.status(StatusCodes.OK).json({ success: true, message: 'Customer deleted successfully' })
  } catch (error) { next(error) }
}

export const customerController = { createNew, getAll, getById, update, remove }
