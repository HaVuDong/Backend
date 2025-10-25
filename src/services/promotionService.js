/* eslint-disable semi */
import { PromotionModel } from '~/models/PromotionModel';

const createNew = async (data) => {
  return await PromotionModel.createNew(data);
};

const getAll = async () => {
  return await PromotionModel.getAll();
};

const update = async (id, data) => {
  return await PromotionModel.update(id, data);
};

const deleteById = async (id) => {
  return await PromotionModel.deleteById(id);
};

export const promotionService = { createNew, getAll, update, deleteById };
