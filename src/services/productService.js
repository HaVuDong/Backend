/* eslint-disable semi */
import { GET_DB } from '~/config/mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'products';

export const productService = {
  async getAll() {
    return await GET_DB().collection(COLLECTION_NAME).find({}).toArray();
  },
  async getById(id) {
    return await GET_DB().collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });
  },
  async create(data) {
    return await GET_DB().collection(COLLECTION_NAME).insertOne(data);
  },
  async update(id, data) {
    return await GET_DB()
      .collection(COLLECTION_NAME)
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data }, { returnDocument: 'after' });
  },
  async remove(id) {
    return await GET_DB().collection(COLLECTION_NAME).deleteOne({ _id: new ObjectId(id) });
  }
};
