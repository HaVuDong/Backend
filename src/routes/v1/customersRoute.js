import express from 'express'
import { customerController } from '~/controllers/customerController'

const Router = express.Router()

Router.route('/')
  .get(customerController.getAll)
  .post(customerController.createNew)

Router.route('/:id')
  .get(customerController.getById)
  .put(customerController.update)
  .delete(customerController.remove)

export const customersRoute = Router
