import express from 'express'
import { cartValidation } from '~/validations/cartValidation'
import { cartController } from '~/controllers/cartController'

const Router = express.Router()

// GET /api/v1/cart - Lấy giỏ hàng của user
Router.route('/')
  .get(cartController.getCart)

// POST /api/v1/cart/add - Thêm sản phẩm vào giỏ
Router.route('/add')
  .post(cartValidation.addToCart, cartController.addItem)

// PUT /api/v1/cart/update/:productId - Cập nhật số lượng
Router.route('/update/:productId')
  .put(cartValidation.updateQuantity, cartController.updateQuantity)

// DELETE /api/v1/cart/remove/:productId - Xóa sản phẩm
Router.route('/remove/:productId')
  .delete(cartController.removeItem)

// DELETE /api/v1/cart/clear - Xóa toàn bộ giỏ hàng
Router.route('/clear')
  .delete(cartController.clearCart)

export const cartRoute = Router