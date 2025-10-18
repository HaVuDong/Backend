/* eslint-disable semi */
import { GET_DB } from '~/config/mongodb';
import Joi from 'joi';
import { ObjectId } from 'mongodb';

const PROMOTION_COLLECTION_NAME = 'promotions';

const promotionSchema = Joi.object({
  title: Joi.string().required(),
  time: Joi.string().required(),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
});

const validateBeforeCreate = (data) => {
  return promotionSchema.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  const validated = await validateBeforeCreate(data);
  return await GET_DB().collection(PROMOTION_COLLECTION_NAME).insertOne(validated);
};

const getAll = async () => {
  return await GET_DB().collection(PROMOTION_COLLECTION_NAME).find().toArray();
};

const update = async (id, data) => {
  return await GET_DB().collection(PROMOTION_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  );
};

const deleteById = async (id) => {
  return await GET_DB().collection(PROMOTION_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
};

export const PromotionModel = { createNew, getAll, update, deleteById };
