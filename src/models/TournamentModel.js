/* eslint-disable semi */
import { GET_DB } from '~/config/mongodb';
import Joi from 'joi';
import { ObjectId } from 'mongodb';

const TOURNAMENT_COLLECTION_NAME = 'tournaments';

const tournamentSchema = Joi.object({
  title: Joi.string().required(),
  date: Joi.string().required(),
  status: Joi.string().valid('Sắp diễn ra', 'Đang diễn ra', 'Đã diễn ra').default('Sắp diễn ra'),
  createdAt: Joi.date().timestamp().default(Date.now),
  updatedAt: Joi.date().timestamp().default(Date.now)
});

const validateBeforeCreate = (data) => {
  return tournamentSchema.validateAsync(data, { abortEarly: false });
};

const createNew = async (data) => {
  try {
    const validated = await validateBeforeCreate(data);
    const result = await GET_DB().collection(TOURNAMENT_COLLECTION_NAME).insertOne(validated);
    return result;
  } catch (err) {
    throw new Error(err);
  }
};

const getAll = async () => {
  return await GET_DB().collection(TOURNAMENT_COLLECTION_NAME).find().toArray();
};

const update = async (id, data) => {
  return await GET_DB().collection(TOURNAMENT_COLLECTION_NAME).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: Date.now() } },
    { returnDocument: 'after' }
  );
};

const deleteById = async (id) => {
  return await GET_DB().collection(TOURNAMENT_COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
};

export const TournamentModel = { createNew, getAll, update, deleteById };
