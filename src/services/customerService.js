import { customerModel } from '~/models/customerModel.js'

const createNew = async (data) => await customerModel.createNew(data)
const getAll = async () => await customerModel.getAll()
const getById = async (id) => await customerModel.findOneById(id)
const update = async (id, data) => await customerModel.updateOne(id, data)
const remove = async (id) => await customerModel.deleteOne(id)

export const customerService = { createNew, getAll, getById, update, remove }
