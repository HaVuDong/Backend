/* eslint-disable semi */
import { TournamentModel } from '~/models/TournamentModel';

const createNew = async (data) => {
  return await TournamentModel.createNew(data);
};

const getAll = async () => {
  return await TournamentModel.getAll();
};

const update = async (id, data) => {
  return await TournamentModel.update(id, data);
};

const deleteById = async (id) => {
  return await TournamentModel.deleteById(id);
};

export const tournamentService = { createNew, getAll, update, deleteById };
