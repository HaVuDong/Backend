import { StatusCodes } from 'http-status-codes'
import { postService } from '~/services/postService'
import { manualCrawl } from '~/cron/autoFootballNews'

const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.body)

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Post created successfully',
      post
    })
  } catch (error) {
    next(error)
  }
}

const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await postService.getPostById(id)

    res.status(StatusCodes.OK).json({
      success: true,
      post
    })
  } catch (error) {
    next(error)
  }
}

const getAllPosts = async (req, res, next) => {
  try {
    const { page, limit, status, category, sortBy, sortOrder } = req.query

    const result = await postService.getAllPosts({
      page,
      limit,
      status,
      category,
      sortBy,
      sortOrder
    })

    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
}

const searchPosts = async (req, res, next) => {
  try {
    const { keyword } = req.query
    const { page, limit, status } = req.query

    if (!keyword) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'Keyword is required'
      })
    }

    const result = await postService.searchPosts(keyword, { page, limit, status })

    res.status(StatusCodes.OK).json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
}

const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await postService.updatePost(id, req.body)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Post updated successfully',
      post
    })
  } catch (error) {
    next(error)
  }
}

const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params
    await postService.deletePost(id)

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Post deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

const incrementView = async (req, res, next) => {
  try {
    const { id } = req.params
    const post = await postService.incrementView(id)

    res.status(StatusCodes.OK).json({
      success: true,
      post
    })
  } catch (error) {
    next(error)
  }
}

const triggerCrawl = async (req, res, next) => {
  try {
    const newPostsCount = await manualCrawl()

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Crawl completed! ${newPostsCount} new posts added.`,
      newPostsCount
    })
  } catch (error) {
    next(error)
  }
}

export const postController = {
  createPost,
  getPostById,
  getAllPosts,
  searchPosts,
  updatePost,
  deletePost,
  incrementView,
  triggerCrawl
}
