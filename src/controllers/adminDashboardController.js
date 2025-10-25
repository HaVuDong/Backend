import { StatusCodes } from 'http-status-codes'
import { adminDashboardService } from '~/services/adminDashboardService'
import moment from 'moment'

// ============================================
// OVERVIEW STATISTICS
// ============================================

// Thống kê tổng quan
const getOverviewStats = async (req, res, next) => {
  try {
    const stats = await adminDashboardService.getOverviewStats()
    
    res.status(StatusCodes.OK).json({
      message: 'Overview statistics',
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// REVENUE STATISTICS
// ============================================

// Doanh thu theo khoảng thời gian tùy chỉnh
const getRevenueByPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'day' } = req.query
    
    if (!startDate || !endDate) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'startDate and endDate are required'
      })
    }
    
    const result = await adminDashboardService.getRevenueByPeriod(
      startDate,
      endDate,
      period
    )
    
    res.status(StatusCodes.OK).json({
      message: 'Revenue by period',
      period,
      startDate,
      endDate,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Doanh thu hôm nay
const getTodayRevenue = async (req, res, next) => {
  try {
    const result = await adminDashboardService.getTodayRevenue()
    
    res.status(StatusCodes.OK).json({
      message: 'Today revenue',
      date: moment().format('YYYY-MM-DD'),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Doanh thu tuần này
const getWeekRevenue = async (req, res, next) => {
  try {
    const result = await adminDashboardService.getWeekRevenue()
    
    res.status(StatusCodes.OK).json({
      message: 'Week revenue',
      startDate: moment().startOf('week').format('YYYY-MM-DD'),
      endDate: moment().endOf('week').format('YYYY-MM-DD'),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Doanh thu tháng này
const getMonthRevenue = async (req, res, next) => {
  try {
    const result = await adminDashboardService.getMonthRevenue()
    
    res.status(StatusCodes.OK).json({
      message: 'Month revenue',
      month: moment().format('YYYY-MM'),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Doanh thu năm nay
const getYearRevenue = async (req, res, next) => {
  try {
    const result = await adminDashboardService.getYearRevenue()
    
    res.status(StatusCodes.OK).json({
      message: 'Year revenue',
      year: moment().format('YYYY'),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Doanh thu theo loại (order vs booking)
const getRevenueByType = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    
    // Mặc định: tháng này
    const start = startDate || moment().startOf('month').format('YYYY-MM-DD')
    const end = endDate || moment().endOf('month').format('YYYY-MM-DD')
    
    const result = await adminDashboardService.getRevenueByType(start, end)
    
    res.status(StatusCodes.OK).json({
      message: 'Revenue by type',
      startDate: start,
      endDate: end,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// PRODUCT STATISTICS
// ============================================

// Top sản phẩm bán chạy
const getTopSellingProducts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query
    
    const result = await adminDashboardService.getTopSellingProducts(
      parseInt(limit),
      startDate,
      endDate
    )
    
    res.status(StatusCodes.OK).json({
      message: 'Top selling products',
      limit: parseInt(limit),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Top sản phẩm doanh thu cao
const getTopRevenueProducts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query
    
    const result = await adminDashboardService.getTopRevenueProducts(
      parseInt(limit),
      startDate,
      endDate
    )
    
    res.status(StatusCodes.OK).json({
      message: 'Top revenue products',
      limit: parseInt(limit),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Sản phẩm sắp hết hàng
const getLowStockProducts = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query
    
    const result = await adminDashboardService.getLowStockProducts(parseInt(threshold))
    
    res.status(StatusCodes.OK).json({
      message: 'Low stock products',
      threshold: parseInt(threshold),
      count: result.length,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Sản phẩm hết hàng
const getOutOfStockProducts = async (req, res, next) => {
  try {
    const result = await adminDashboardService.getOutOfStockProducts()
    
    res.status(StatusCodes.OK).json({
      message: 'Out of stock products',
      count: result.length,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// USER STATISTICS
// ============================================

// Users mới theo thời gian
const getNewUsersByPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, period = 'day' } = req.query
    
    // Mặc định: tháng này
    const start = startDate || moment().startOf('month').format('YYYY-MM-DD')
    const end = endDate || moment().endOf('month').format('YYYY-MM-DD')
    
    const result = await adminDashboardService.getNewUsersByPeriod(start, end, period)
    
    res.status(StatusCodes.OK).json({
      message: 'New users by period',
      period,
      startDate: start,
      endDate: end,
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Top khách hàng chi tiêu nhiều
const getTopCustomers = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query
    
    const result = await adminDashboardService.getTopCustomers(
      parseInt(limit),
      startDate,
      endDate
    )
    
    res.status(StatusCodes.OK).json({
      message: 'Top customers',
      limit: parseInt(limit),
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// ORDER & PAYMENT STATISTICS
// ============================================

// Thống kê orders theo status
const getOrdersByStatus = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    
    const result = await adminDashboardService.getOrdersByStatus(startDate, endDate)
    
    res.status(StatusCodes.OK).json({
      message: 'Orders by status',
      startDate: startDate || 'all time',
      endDate: endDate || 'all time',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// Thống kê payments theo method
const getPaymentsByMethod = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query
    
    const result = await adminDashboardService.getPaymentsByMethod(startDate, endDate)
    
    res.status(StatusCodes.OK).json({
      message: 'Payments by method',
      startDate: startDate || 'all time',
      endDate: endDate || 'all time',
      data: result
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// DASHBOARD SUMMARY (All in one)
// ============================================

// Lấy tất cả thống kê cho dashboard
const getDashboardSummary = async (req, res, next) => {
  try {
    // Lấy tất cả stats cùng lúc
    const [
      overview,
      todayRevenue,
      monthRevenue,
      topProducts,
      lowStock,
      topCustomers,
      ordersByStatus,
      paymentsByMethod
    ] = await Promise.all([
      adminDashboardService.getOverviewStats(),
      adminDashboardService.getTodayRevenue(),
      adminDashboardService.getMonthRevenue(),
      adminDashboardService.getTopSellingProducts(5),
      adminDashboardService.getLowStockProducts(10),
      adminDashboardService.getTopCustomers(5),
      adminDashboardService.getOrdersByStatus(),
      adminDashboardService.getPaymentsByMethod()
    ])
    
    res.status(StatusCodes.OK).json({
      message: 'Dashboard summary',
      timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
      data: {
        overview,
        revenue: {
          today: todayRevenue,
          thisMonth: monthRevenue
        },
        products: {
          topSelling: topProducts,
          lowStock: lowStock
        },
        customers: {
          top: topCustomers
        },
        orders: {
          byStatus: ordersByStatus
        },
        payments: {
          byMethod: paymentsByMethod
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// ============================================
// EXPORTS
// ============================================

export const adminDashboardController = {
  // Overview
  getOverviewStats,
  
  // Revenue
  getRevenueByPeriod,
  getTodayRevenue,
  getWeekRevenue,
  getMonthRevenue,
  getYearRevenue,
  getRevenueByType,
  
  // Products
  getTopSellingProducts,
  getTopRevenueProducts,
  getLowStockProducts,
  getOutOfStockProducts,
  
  // Users
  getNewUsersByPeriod,
  getTopCustomers,
  
  // Orders & Payments
  getOrdersByStatus,
  getPaymentsByMethod,
  
  // Summary
  getDashboardSummary
}