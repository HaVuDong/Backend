/* eslint-disable no-useless-catch */
import { postModel } from '~/models/postModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createPost = async (data) => {
  try {
    // Check if post with same title or link already exists
    if (data.title) {
      const existingByTitle = await postModel.findByTitle(data.title)
      if (existingByTitle) {
        throw new ApiError(StatusCodes.CONFLICT, 'Post with this title already exists')
      }
    }

    if (data.link) {
      const existingByLink = await postModel.findByLink(data.link)
      if (existingByLink) {
        throw new ApiError(StatusCodes.CONFLICT, 'Post with this link already exists')
      }
    }

    const post = await postModel.createNew(data)
    return post
  } catch (error) {
    throw error
  }
}

const getPostById = async (id) => {
  try {
    const post = await postModel.findOneById(id)
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found')
    }
    return post
  } catch (error) {
    throw error
  }
}

const getAllPosts = async (options) => {
  try {
    return await postModel.getAll(options)
  } catch (error) {
    throw error
  }
}

const searchPosts = async (keyword, options) => {
  try {
    return await postModel.search(keyword, options)
  } catch (error) {
    throw error
  }
}

const updatePost = async (id, data) => {
  try {
    const post = await postModel.update(id, data)
    if (!post) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found')
    }
    return post
  } catch (error) {
    throw error
  }
}

const deletePost = async (id) => {
  try {
    const result = await postModel.deleteOne(id)
    if (result.deletedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Post not found')
    }
    return { message: 'Post deleted successfully' }
  } catch (error) {
    throw error
  }
}

const incrementView = async (id) => {
  try {
    return await postModel.incrementViewCount(id)
  } catch (error) {
    throw error
  }
}

export const postService = {
  createPost,
  getPostById,
  getAllPosts,
  searchPosts,
  updatePost,
  deletePost,
  incrementView
}
