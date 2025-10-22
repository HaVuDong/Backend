import express from 'express'
import { adminDashboardController } from '~/controllers/adminDashboardController'
// import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// ============================================
// OVERVIEW
// ============================================

// GET /v1/admin/dashboard/overview
Router.get('/dashboard/overview', 
  // authMiddleware.isAdmin,
  adminDashboardController.getOverviewStats
)

// GET /v1/admin/dashboard/summary - Tất cả stats
Router.get('/dashboard/summary',
  // authMiddleware.isAdmin,
  adminDashboardController.getDashboardSummary
)

// ============================================
// REVENUE STATISTICS
// ============================================

// GET /v1/admin/revenue/custom?startDate=2025-01-01&endDate=2025-01-31&period=day
Router.get('/revenue/custom',
  // authMiddleware.isAdmin,
  adminDashboardController.getRevenueByPeriod
)

// GET /v1/admin/revenue/today
Router.get('/revenue/today',
  // authMiddleware.isAdmin,
  adminDashboardController.getTodayRevenue
)

// GET /v1/admin/revenue/week
Router.get('/revenue/week',
  // authMiddleware.isAdmin,
  adminDashboardController.getWeekRevenue
)

// GET /v1/admin/revenue/month
Router.get('/revenue/month',
  // authMiddleware.isAdmin,
  adminDashboardController.getMonthRevenue
)

// GET /v1/admin/revenue/year
Router.get('/revenue/year',
  // authMiddleware.isAdmin,
  adminDashboardController.getYearRevenue
)

// GET /v1/admin/revenue/by-type?startDate=2025-01-01&endDate=2025-01-31
Router.get('/revenue/by-type',
  // authMiddleware.isAdmin,
  adminDashboardController.getRevenueByType
)

// ============================================
// PRODUCT STATISTICS
// ============================================

// GET /v1/admin/products/top-selling?limit=10
Router.get('/products/top-selling',
  // authMiddleware.isAdmin,
  adminDashboardController.getTopSellingProducts
)

// GET /v1/admin/products/top-revenue?limit=10
Router.get('/products/top-revenue',
  // authMiddleware.isAdmin,
  adminDashboardController.getTopRevenueProducts
)

// GET /v1/admin/products/low-stock?threshold=10
Router.get('/products/low-stock',
  // authMiddleware.isAdmin,
  adminDashboardController.getLowStockProducts
)

// GET /v1/admin/products/out-of-stock
Router.get('/products/out-of-stock',
  // authMiddleware.isAdmin,
  adminDashboardController.getOutOfStockProducts
)

// ============================================
// USER STATISTICS
// ============================================

// GET /v1/admin/users/new?startDate=2025-01-01&endDate=2025-01-31&period=day
Router.get('/users/new',
  // authMiddleware.isAdmin,
  adminDashboardController.getNewUsersByPeriod
)

// GET /v1/admin/users/top-customers?limit=10
Router.get('/users/top-customers',
  // authMiddleware.isAdmin,
  adminDashboardController.getTopCustomers
)

// ============================================
// ORDER & PAYMENT STATISTICS
// ============================================

// GET /v1/admin/orders/by-status
Router.get('/orders/by-status',
  // authMiddleware.isAdmin,
  adminDashboardController.getOrdersByStatus
)

// GET /v1/admin/payments/by-method
Router.get('/payments/by-method',
  // authMiddleware.isAdmin,
  adminDashboardController.getPaymentsByMethod
)

export const dashboardRoute = Router