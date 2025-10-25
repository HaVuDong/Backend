/* eslint-disable semi */
import { StatusCodes } from 'http-status-codes';
import { tournamentService } from '~/services/tournamentService';

const createNew = async (req, res, next) => {
  try {
    const result = await tournamentService.createNew(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await tournamentService.getAll();
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await tournamentService.update(req.params.id, req.body);
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const deleteById = async (req, res, next) => {
  try {
    await tournamentService.deleteById(req.params.id);
    res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

export const tournamentController = { createNew, getAll, update, deleteById };
