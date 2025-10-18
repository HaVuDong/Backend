import express from 'express'
import { paymentController } from '~/controllers/paymentController'

const Router = express.Router()

Router.route('/')
  .get(paymentController.getAll)
  .post(paymentController.createNew)

Router.route('/:id')
  .get(paymentController.getById)
  .put(paymentController.update)
  .delete(paymentController.remove)

export const paymentsRoute = Router
