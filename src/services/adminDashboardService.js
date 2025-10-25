/* eslint-disable no-useless-catch */
import { GET_DB } from '~/config/mongodb'
import { ObjectId } from 'mongodb'
import moment from 'moment'

// ============================================
// OVERVIEW STATISTICS
// ============================================

// Thống kê tổng quan
const getOverviewStats = async () => {
  try {
    const db = GET_DB()
    
    // Đếm tổng số
    const totalUsers = await db.collection('users').countDocuments({})
    const totalProducts = await db.collection('products').countDocuments({ deletedAt: null })
    const totalOrders = await db.collection('orders').countDocuments({})
    const totalBookings = await db.collection('bookings').countDocuments({})
    
    // Tính tổng doanh thu từ payments đã thanh toán
    const revenueResult = await db.collection('payments').aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]).toArray()
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0
    
    // Đếm orders theo status
    const ordersByStatus = await db.collection('orders').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()
    
    // Đếm payments theo status
    const paymentsByStatus = await db.collection('payments').aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).toArray()
    
    // Sản phẩm sắp hết hàng (stock <= 10)
    const lowStockProducts = await db.collection('products').countDocuments({
      stock: { $lte: 10, $gt: 0 },
      deletedAt: null
    })
    
    // Sản phẩm hết hàng
    const outOfStockProducts = await db.collection('products').countDocuments({
      stock: 0,
      deletedAt: null
    })
    
    return {
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalBookings,
        totalRevenue,
        lowStockProducts,
        outOfStockProducts
      },
      ordersByStatus,
      paymentsByStatus
    }
  } catch (error) {
    throw error
  }
}

// ============================================
// REVENUE STATISTICS
// ============================================

// Doanh thu theo khoảng thời gian
const getRevenueByPeriod = async (startDate, endDate, period = 'day') => {
  try {
    const db = GET_DB()
    
    const start = moment(startDate).startOf('day').valueOf()
    const end = moment(endDate).endOf('day').valueOf()
    
    let groupFormat
    switch (period) {
      case 'hour':
        groupFormat = {
          year: { $year: { $toDate: '$paidAt' } },
          month: { $month: { $toDate: '$paidAt' } },
          day: { $dayOfMonth: { $toDate: '$paidAt' } },
          hour: { $hour: { $toDate: '$paidAt' } }
        }
        break
      case 'day':
        groupFormat = {
          year: { $year: { $toDate: '$paidAt' } },
          month: { $month: { $toDate: '$paidAt' } },
          day: { $dayOfMonth: { $toDate: '$paidAt' } }
        }
        break
      case 'month':
        groupFormat = {
          year: { $year: { $toDate: '$paidAt' } },
          month: { $month: { $toDate: '$paidAt' } }
        }
        break
      case 'year':
        groupFormat = {
          year: { $year: { $toDate: '$paidAt' } }
        }
        break
      default:
        groupFormat = {
          year: { $year: { $toDate: '$paidAt' } },
          month: { $month: { $toDate: '$paidAt' } },
          day: { $dayOfMonth: { $toDate: '$paidAt' } }
        }
    }
    
    const result = await db.collection('payments').aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// Doanh thu hôm nay
const getTodayRevenue = async () => {
  try {
    const today = moment().startOf('day').valueOf()
    const tomorrow = moment().endOf('day').valueOf()
    
    return await getRevenueByPeriod(today, tomorrow, 'hour')
  } catch (error) {
    throw error
  }
}

// Doanh thu tuần này
const getWeekRevenue = async () => {
  try {
    const startOfWeek = moment().startOf('week').valueOf()
    const endOfWeek = moment().endOf('week').valueOf()
    
    return await getRevenueByPeriod(startOfWeek, endOfWeek, 'day')
  } catch (error) {
    throw error
  }
}

// Doanh thu tháng này
const getMonthRevenue = async () => {
  try {
    const startOfMonth = moment().startOf('month').valueOf()
    const endOfMonth = moment().endOf('month').valueOf()
    
    return await getRevenueByPeriod(startOfMonth, endOfMonth, 'day')
  } catch (error) {
    throw error
  }
}

// Doanh thu năm nay
const getYearRevenue = async () => {
  try {
    const startOfYear = moment().startOf('year').valueOf()
    const endOfYear = moment().endOf('year').valueOf()
    
    return await getRevenueByPeriod(startOfYear, endOfYear, 'month')
  } catch (error) {
    throw error
  }
}

// Doanh thu theo loại (order vs booking)
const getRevenueByType = async (startDate, endDate) => {
  try {
    const db = GET_DB()
    
    const start = moment(startDate).startOf('day').valueOf()
    const end = moment(endDate).endOf('day').valueOf()
    
    const result = await db.collection('payments').aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: '$referenceType',
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// ============================================
// TOP PRODUCTS
// ============================================

// Top sản phẩm bán chạy
const getTopSellingProducts = async (limit = 10, startDate = null, endDate = null) => {
  try {
    const db = GET_DB()
    
    let filter = { deletedAt: null }
    
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').valueOf()
      const end = moment(endDate).endOf('day').valueOf()
      filter.updatedAt = { $gte: start, $lte: end }
    }
    
    const products = await db.collection('products')
      .find(filter)
      .sort({ sold: -1 })
      .limit(limit)
      .toArray()
    
    return products
  } catch (error) {
    throw error
  }
}

// Top sản phẩm doanh thu cao
const getTopRevenueProducts = async (limit = 10, startDate = null, endDate = null) => {
  try {
    const db = GET_DB()
    
    const matchStage = {
      status: 'delivered'
    }
    
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').valueOf()
      const end = moment(endDate).endOf('day').valueOf()
      matchStage.createdAt = { $gte: start, $lte: end }
    }
    
    const result = await db.collection('orders').aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: limit }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// Sản phẩm sắp hết hàng
const getLowStockProducts = async (threshold = 10) => {
  try {
    const db = GET_DB()
    
    const products = await db.collection('products')
      .find({
        stock: { $lte: threshold, $gt: 0 },
        deletedAt: null,
        status: 'active'
      })
      .sort({ stock: 1 })
      .toArray()
    
    return products
  } catch (error) {
    throw error
  }
}

// Sản phẩm hết hàng
const getOutOfStockProducts = async () => {
  try {
    const db = GET_DB()
    
    const products = await db.collection('products')
      .find({
        stock: 0,
        deletedAt: null
      })
      .toArray()
    
    return products
  } catch (error) {
    throw error
  }
}

// ============================================
// USER STATISTICS
// ============================================

// Thống kê users mới theo thời gian
const getNewUsersByPeriod = async (startDate, endDate, period = 'day') => {
  try {
    const db = GET_DB()
    
    const start = moment(startDate).startOf('day').valueOf()
    const end = moment(endDate).endOf('day').valueOf()
    
    let groupFormat
    switch (period) {
      case 'day':
        groupFormat = {
          year: { $year: { $toDate: '$createdAt' } },
          month: { $month: { $toDate: '$createdAt' } },
          day: { $dayOfMonth: { $toDate: '$createdAt' } }
        }
        break
      case 'month':
        groupFormat = {
          year: { $year: { $toDate: '$createdAt' } },
          month: { $month: { $toDate: '$createdAt' } }
        }
        break
      default:
        groupFormat = {
          year: { $year: { $toDate: '$createdAt' } },
          month: { $month: { $toDate: '$createdAt' } },
          day: { $dayOfMonth: { $toDate: '$createdAt' } }
        }
    }
    
    const result = await db.collection('users').aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupFormat,
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// Top khách hàng chi tiêu nhiều nhất
const getTopCustomers = async (limit = 10, startDate = null, endDate = null) => {
  try {
    const db = GET_DB()
    
    const matchStage = {
      status: 'paid'
    }
    
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').valueOf()
      const end = moment(endDate).endOf('day').valueOf()
      matchStage.paidAt = { $gte: start, $lte: end }
    }
    
    const result = await db.collection('payments').aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$amount' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userId: '$_id',
          totalSpent: 1,
          totalOrders: 1,
          userName: '$userInfo.username',
          userEmail: '$userInfo.email'
        }
      }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// ============================================
// ORDER STATISTICS
// ============================================

// Thống kê orders theo status
const getOrdersByStatus = async (startDate = null, endDate = null) => {
  try {
    const db = GET_DB()
    
    const matchStage = {}
    
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').valueOf()
      const end = moment(endDate).endOf('day').valueOf()
      matchStage.createdAt = { $gte: start, $lte: end }
    }
    
    const result = await db.collection('orders').aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalPrice' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// Thống kê payments theo method
const getPaymentsByMethod = async (startDate = null, endDate = null) => {
  try {
    const db = GET_DB()
    
    const matchStage = {}
    
    if (startDate && endDate) {
      const start = moment(startDate).startOf('day').valueOf()
      const end = moment(endDate).endOf('day').valueOf()
      matchStage.createdAt = { $gte: start, $lte: end }
    }
    
    const result = await db.collection('payments').aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray()
    
    return result
  } catch (error) {
    throw error
  }
}

// ============================================
// EXPORTS
// ============================================

export const adminDashboardService = {
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
  getPaymentsByMethod
}