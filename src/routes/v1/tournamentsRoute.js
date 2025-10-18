/* eslint-disable semi */
import express from 'express';
import { tournamentController } from '~/controllers/tournamentController';

const Router = express.Router();

Router.get('/', tournamentController.getAll);
Router.post('/', tournamentController.createNew);
Router.put('/:id', tournamentController.update);
Router.delete('/:id', tournamentController.deleteById);

export const tournamentsRoute = Router;
