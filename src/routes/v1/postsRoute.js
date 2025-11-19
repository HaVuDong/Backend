import express from 'express'
import { postController } from '~/controllers/postController'
import { authMiddleware, isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

// ============================================
// PUBLIC ROUTES
// ============================================

// GET /v1/posts - Get all posts (public)
Router.get('/', postController.getAllPosts)

// GET /v1/posts/search - Search posts
Router.get('/search', postController.searchPosts)

// GET /v1/posts/:id - Get post by ID
Router.get('/:id', postController.getPostById)

// POST /v1/posts/:id/view - Increment view count
Router.post('/:id/view', postController.incrementView)

// ============================================
// ADMIN ROUTES
// ============================================

// POST /v1/posts/crawl/trigger - Manually trigger crawler
Router.post('/crawl/trigger', authMiddleware, isAdmin, postController.triggerCrawl)

// ============================================
// PROTECTED ROUTES (Admin only)
// ============================================

// POST /v1/posts - Create new post
Router.post('/', authMiddleware, isAdmin, postController.createPost)

// PUT /v1/posts/:id - Update post
Router.put('/:id', authMiddleware, isAdmin, postController.updatePost)

// DELETE /v1/posts/:id - Delete post
Router.delete('/:id', authMiddleware, isAdmin, postController.deletePost)

export const postsRoute = Router
