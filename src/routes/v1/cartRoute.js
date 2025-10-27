import express from 'express'
import { cartValidation } from '~/validations/cartValidation'
import { cartController } from '~/controllers/cartController'
import { authMiddleware } from '~/middlewares/authMiddleware' // ⭐ IMPORT

const Router = express.Router()

// ⭐ THÊM authMiddleware vào TẤT CẢ routes
// GET /api/v1/cart - Lấy giỏ hàng của user
Router.route('/')
  .get(authMiddleware, cartController.getCart) // ⭐ Thêm authMiddleware

// POST /api/v1/cart/add - Thêm sản phẩm vào giỏ
Router.route('/add')
  .post(authMiddleware, cartValidation.addToCart, cartController.addItem) // ⭐ Thêm authMiddleware

// PUT /api/v1/cart/update/:productId - Cập nhật số lượng
Router.route('/update/:productId')
  .put(authMiddleware, cartValidation.updateQuantity, cartController.updateQuantity) // ⭐ Thêm authMiddleware

// DELETE /api/v1/cart/remove/:productId - Xóa sản phẩm
Router.route('/remove/:productId')
  .delete(authMiddleware, cartController.removeItem) // ⭐ Thêm authMiddleware

// DELETE /api/v1/cart/clear - Xóa toàn bộ giỏ hàng
Router.route('/clear')
  .delete(authMiddleware, cartController.clearCart) // ⭐ Thêm authMiddleware

export const cartRoute = Router