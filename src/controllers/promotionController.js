/* eslint-disable semi */
import { StatusCodes } from 'http-status-codes';
import { promotionService } from '~/services/promotionService';

const createNew = async (req, res, next) => {
  try {
    const result = await promotionService.createNew(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getAll = async (req, res, next) => {
  try {
    const result = await promotionService.getAll();
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await promotionService.update(req.params.id, req.body);
    res.status(StatusCodes.OK).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const deleteById = async (req, res, next) => {
  try {
    await promotionService.deleteById(req.params.id);
    res.status(StatusCodes.NO_CONTENT).end();
  } catch (err) {
    next(err);
  }
};

export const promotionController = { createNew, getAll, update, deleteById };
