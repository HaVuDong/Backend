import express from 'express'
import { categoryValidation } from '~/validations/categoryValidation'
import { categoryController } from '~/controllers/categoryController'
// import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// GET /api/v1/categories - Lấy tất cả categories
Router.route('/')
  .get(categoryController.getAllCategories)
  .post(
    // authMiddleware.isAdmin, // Admin only
    categoryValidation.createCategory,
    categoryController.createCategory
  )

// GET /api/v1/categories/:id - Chi tiết category
Router.route('/:id')
  .get(categoryController.getCategoryById)
  .put(
    // authMiddleware.isAdmin, // Admin only
    categoryValidation.updateCategory,
    categoryController.updateCategory
  )
  .delete(
    // authMiddleware.isAdmin, // Admin only
    categoryController.deleteCategory
  )

export const categoryRoute = Router