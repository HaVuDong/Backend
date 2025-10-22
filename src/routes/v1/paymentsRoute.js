import express from 'express'
import { paymentController } from '~/controllers/paymentController'
// import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// ============================================
// COMMON ROUTES
// ============================================

// POST /v1/payments - Tạo payment
Router.post('/', paymentController.createPayment)

// GET /v1/payments/order/:orderId - Lấy payment theo orderId
Router.get('/order/:orderId', paymentController.getPaymentByOrderId)

// ============================================
// COD ROUTES
// ============================================

// POST /v1/payments/cod/:orderId/confirm - Xác nhận thanh toán COD
Router.post('/cod/:orderId/confirm', paymentController.confirmCODPayment)

// ============================================
// MOMO ROUTES
// ============================================

// POST /v1/payments/momo/create - Tạo MoMo payment
Router.post('/momo/create', paymentController.createMoMoPayment)

// GET /v1/payments/momo/callback - MoMo callback (redirect)
Router.get('/momo/callback', paymentController.handleMoMoCallback)

// POST /v1/payments/momo/ipn - MoMo IPN (webhook)
Router.post('/momo/ipn', paymentController.handleMoMoIPN)

// ============================================
// VNPAY ROUTES
// ============================================

// POST /v1/payments/vnpay/create - Tạo VNPay payment
Router.post('/vnpay/create', paymentController.createVNPayPayment)

// GET /v1/payments/vnpay/callback - VNPay callback (redirect)
Router.get('/vnpay/callback', paymentController.handleVNPayCallback)

// GET /v1/payments/vnpay/ipn - VNPay IPN (webhook)
Router.get('/vnpay/ipn', paymentController.handleVNPayIPN)

// ============================================
// CANCEL & REFUND
// ============================================

// PUT /v1/payments/:orderId/cancel - Hủy payment
Router.put('/:orderId/cancel', paymentController.cancelPayment)

// PUT /v1/payments/:orderId/refund - Hoàn tiền (Admin)
Router.put(
  '/:orderId/refund',
  // authMiddleware.isAdmin,
  paymentController.refundPayment
)

// ============================================
// USER & ADMIN
// ============================================

// GET /v1/payments/user - Lấy payments của user
Router.get('/user', paymentController.getUserPayments)

// GET /v1/payments/admin/all - Admin: Lấy tất cả payments
Router.get(
  '/admin/all',
  // authMiddleware.isAdmin,
  paymentController.getAllPayments
)

// GET /v1/payments/admin/stats - Admin: Thống kê
Router.get(
  '/admin/stats',
  // authMiddleware.isAdmin,
  paymentController.getPaymentStats
)

export const paymentRoute = Router