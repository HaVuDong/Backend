import { paymentModel } from '~/models/paymentModel'

const createNew = async (data) => await paymentModel.createNew(data)
const getById = async (id) => await paymentModel.findOneById(id)
const getAll = async () => await paymentModel.getAll()
const update = async (id, data) => await paymentModel.updateOne(id, data)
const remove = async (id) => await paymentModel.deleteOne(id)

export const paymentService = { createNew, getById, getAll, update, remove }
