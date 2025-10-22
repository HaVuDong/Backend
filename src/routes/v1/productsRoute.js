import express from 'express'
import { productValidation } from '~/validations/productValidation'
import { productController } from '~/controllers/productController'
import { authMiddleware, isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

// PUBLIC ROUTES
Router.get('/', productController.getAllProducts)
Router.get('/search', productController.searchProducts)
Router.get('/top-selling', productController.getTopSellingProducts)
Router.get('/category/:categoryId', productController.getProductsByCategory)
Router.get('/slug/:slug', productController.getProductBySlug)
Router.get('/:id', productController.getProductById)

// ADMIN ONLY ROUTES
Router.post('/',
  authMiddleware,
  isAdmin,
  productValidation.createProduct,
  productController.createProduct
)

Router.put('/:id',
  authMiddleware,
  isAdmin,
  productValidation.updateProduct,
  productController.updateProduct
)

Router.delete('/:id',
  authMiddleware,
  isAdmin,
  productController.deleteProduct
)

Router.get('/admin/low-stock',
  authMiddleware,
  isAdmin,
  productController.getLowStockProducts
)

export const productRoute = Router