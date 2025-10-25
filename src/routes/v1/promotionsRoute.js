/* eslint-disable semi */
import express from 'express';
import { promotionController } from '~/controllers/promotionController';

const Router = express.Router();

Router.get('/', promotionController.getAll);
Router.post('/', promotionController.createNew);
Router.put('/:id', promotionController.update);
Router.delete('/:id', promotionController.deleteById);

export const promotionsRoute = Router;
