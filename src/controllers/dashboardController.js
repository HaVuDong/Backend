/* eslint-disable no-console */
import { dashboardService } from '~/services/dashboardService'
import { StatusCodes } from 'http-status-codes'

// ✅ Lấy thống kê tổng quan
const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getStats()
    res.status(StatusCodes.OK).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy doanh thu theo tháng
const getRevenue = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear()
    const revenue = await dashboardService.getRevenue(year)
    res.status(StatusCodes.OK).json({
      success: true,
      data: revenue
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy thống kê sử dụng sân
const getFieldUsage = async (req, res, next) => {
  try {
    const fieldUsage = await dashboardService.getFieldUsage()
    res.status(StatusCodes.OK).json({
      success: true,
      data: fieldUsage
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy hoạt động gần đây
const getActivities = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const activities = await dashboardService.getActivities(limit)
    res.status(StatusCodes.OK).json({
      success: true,
      data: activities
    })
  } catch (error) {
    next(error)
  }
}

// ✅ Lấy thống kê trạng thái booking
const getBookingStatus = async (req, res, next) => {
  try {
    const bookingStatus = await dashboardService.getBookingStatus()
    res.status(StatusCodes.OK).json({
      success: true,
      data: bookingStatus
    })
  } catch (error) {
    next(error)
  }
}

export const dashboardController = {
  getStats,
  getRevenue,
  getFieldUsage,
  getActivities,
  getBookingStatus
}