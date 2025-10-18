import { StatusCodes } from 'http-status-codes'
import { paymentService } from '~/services/paymentService'

const createNew = async (req, res, next) => {
  try {
    const newPayment = await paymentService.createNew(req.body)
    res.status(StatusCodes.CREATED).json({ success: true, data: newPayment })
  } catch (error) { next(error) }
}

const getAll = async (req, res, next) => {
  try {
    const payments = await paymentService.getAll()
    res.status(StatusCodes.OK).json({ success: true, data: payments })
  } catch (error) { next(error) }
}

const getById = async (req, res, next) => {
  try {
    const payment = await paymentService.getById(req.params.id)
    if (!payment) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment not found' })
    res.status(StatusCodes.OK).json({ success: true, data: payment })
  } catch (error) { next(error) }
}

const update = async (req, res, next) => {
  try {
    const updated = await paymentService.update(req.params.id, req.body)
    if (!updated) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment not found' })
    res.status(StatusCodes.OK).json({ success: true, data: updated })
  } catch (error) { next(error) }
}

const remove = async (req, res, next) => {
  try {
    const deleted = await paymentService.remove(req.params.id)
    if (!deleted || deleted.deletedCount === 0) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Payment not found' })
    res.status(StatusCodes.OK).json({ success: true, message: 'Payment deleted successfully' })
  } catch (error) { next(error) }
}

export const paymentController = { createNew, getAll, getById, update, remove }
