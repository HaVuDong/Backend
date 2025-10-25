import express from 'express'
import { adminDashboardController } from '~/controllers/adminDashboardController' // ⬅️ SỬA TÊN FILE
import { authMiddleware, isAdmin } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Dashboard Summary
Router.get('/dashboard/summary',
  authMiddleware,
  isAdmin,
  adminDashboardController.getDashboardSummary
)

// Overview Stats
Router.get('/dashboard/overview', 
  authMiddleware,
  isAdmin,
  adminDashboardController.getOverviewStats
)

// Revenue APIs
Router.get('/revenue/custom', authMiddleware, isAdmin, adminDashboardController.getRevenueByPeriod)
Router.get('/revenue/today', authMiddleware, isAdmin, adminDashboardController.getTodayRevenue)
Router.get('/revenue/week', authMiddleware, isAdmin, adminDashboardController.getWeekRevenue)
Router.get('/revenue/month', authMiddleware, isAdmin, adminDashboardController.getMonthRevenue)
Router.get('/revenue/year', authMiddleware, isAdmin, adminDashboardController.getYearRevenue)
Router.get('/revenue/by-type', authMiddleware, isAdmin, adminDashboardController.getRevenueByType)

// Product Stats
Router.get('/products/top-selling', authMiddleware, isAdmin, adminDashboardController.getTopSellingProducts)
Router.get('/products/top-revenue', authMiddleware, isAdmin, adminDashboardController.getTopRevenueProducts)
Router.get('/products/low-stock', authMiddleware, isAdmin, adminDashboardController.getLowStockProducts)
Router.get('/products/out-of-stock', authMiddleware, isAdmin, adminDashboardController.getOutOfStockProducts)

// User Stats
Router.get('/users/new', authMiddleware, isAdmin, adminDashboardController.getNewUsersByPeriod)
Router.get('/users/top-customers', authMiddleware, isAdmin, adminDashboardController.getTopCustomers)

// Order & Payment Stats
Router.get('/orders/by-status', authMiddleware, isAdmin, adminDashboardController.getOrdersByStatus)
Router.get('/payments/by-method', authMiddleware, isAdmin, adminDashboardController.getPaymentsByMethod)

export const adminRoute = Router