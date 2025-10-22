import express from 'express'
import { orderValidation } from '~/validations/orderValidation'
import { orderController } from '~/controllers/orderController'
// import { authMiddleware } from '~/middlewares/authMiddleware' // Tạm thời comment

const Router = express.Router()

// TẠM THỜI BỎ QUA AUTHENTICATION để test
// Router.use(authMiddleware.isAuthenticated)

// POST /api/v1/orders - Tạo đơn hàng
Router.route('/')
  .post(orderValidation.createOrder, orderController.createOrder)
  .get(orderController.getOrders)

// GET /api/v1/orders/:id - Xem chi tiết đơn hàng
Router.route('/:id')
  .get(orderController.getOrderById)

// PUT /api/v1/orders/:id/cancel - Hủy đơn hàng
Router.route('/:id/cancel')
  .put(orderController.cancelOrder)

// PUT /api/v1/orders/:id/status - Cập nhật trạng thái (admin only)
Router.route('/:id/status')
  .put(
    // authMiddleware.isAdmin, // Tạm thời comment
    orderValidation.updateStatus,
    orderController.updateStatus
  )

// GET /api/v1/orders/admin/all - Lấy tất cả đơn hàng (admin only)
Router.route('/admin/all')
  .get(
    // authMiddleware.isAdmin, // Tạm thời comment
    orderController.getAllOrders
  )

export const orderRoute = Router