/* eslint-disable no-console */
import { bookingModel } from '~/models/bookingModel.js'
import { fieldModel } from '~/models/fieldModel'
import { userModel } from '~/models/userModel'
import { GET_DB } from '~/config/mongodb'

// ✅ Lấy thống kê tổng quan
const getStats = async () => {
  try {
    // Tổng số bookings
    const totalBookings = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .countDocuments()

    // Tổng doanh thu từ booking đã hoàn thành
    const completedBookings = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .find({ status: 'completed' })
      .toArray()

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)

    // Số sân đang hoạt động
    const activeFields = await GET_DB()
      .collection(fieldModel.FIELD_COLLECTION_NAME)
      .countDocuments({ isActive: true })

    // Tổng số người dùng
    const totalUsers = await GET_DB()
      .collection(userModel.USER_COLLECTION_NAME)
      .countDocuments()

    // Booking hôm nay
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayBookings = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .countDocuments({
        bookingDate: {
          $gte: today,
          $lt: tomorrow
        }
      })

    return {
      totalBookings,
      totalRevenue,
      activeFields,
      totalUsers,
      todayBookings
    }
  } catch (error) {
    console.error('❌ Lỗi getStats:', error)
    throw error
  }
}

// ✅ Lấy doanh thu theo tháng
const getRevenue = async (year) => {
  try {
    const startDate = new Date(`${year}-01-01`)
    const endDate = new Date(`${year}-12-31`)
    endDate.setHours(23, 59, 59, 999)

    const revenueByMonth = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            status: 'completed',
            bookingDate: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: { $month: '$bookingDate' },
            total: { $sum: '$totalPrice' }
          }
        },
        { $sort: { _id: 1 } }
      ])
      .toArray()

    const labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
    const values = Array(12).fill(0)

    revenueByMonth.forEach((item) => {
      values[item._id - 1] = item.total / 1000000 // Đổi sang triệu
    })

    return { labels, values, year }
  } catch (error) {
    console.error('❌ Lỗi getRevenue:', error)
    throw error
  }
}

// ✅ Lấy thống kê sử dụng sân
const getFieldUsage = async () => {
  try {
    const fieldUsage = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: fieldModel.FIELD_COLLECTION_NAME,
            localField: 'fieldId',
            foreignField: '_id',
            as: 'fieldInfo'
          }
        },
        { $unwind: '$fieldInfo' },
        {
          $group: {
            _id: '$fieldId',
            fieldName: { $first: '$fieldInfo.name' },
            bookingCount: { $sum: 1 },
            totalRevenue: { $sum: '$totalPrice' }
          }
        },
        { $sort: { bookingCount: -1 } }
      ])
      .toArray()

    return fieldUsage.map((item) => ({
      fieldId: item._id,
      fieldName: item.fieldName,
      bookingCount: item.bookingCount,
      totalRevenue: item.totalRevenue || 0
    }))
  } catch (error) {
    console.error('❌ Lỗi getFieldUsage:', error)
    throw error
  }
}

// ✅ Lấy hoạt động gần đây
const getActivities = async (limit = 10) => {
  try {
    const activities = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'userId',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: fieldModel.FIELD_COLLECTION_NAME,
            localField: 'fieldId',
            foreignField: '_id',
            as: 'fieldInfo'
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: limit }
      ])
      .toArray()

    return activities.map((a) => {
      const userName = a.userInfo?.[0]?.username || a.userName || 'Khách'
      const fieldName = a.fieldInfo?.[0]?.name || 'Sân không xác định'
      
      let action = ''
      let icon = ''
      let color = ''

      switch (a.status) {
        case 'completed':
          action = `Hoàn thành đặt ${fieldName}`
          icon = '✅'
          color = 'text-green-600'
          break
        case 'confirmed':
          action = `Xác nhận đặt ${fieldName}`
          icon = '🎉'
          color = 'text-blue-600'
          break
        case 'cancelled_admin':
        case 'cancelled_refunded':
        case 'cancelled_no_refund':
          action = `Hủy đặt ${fieldName}`
          icon = '❌'
          color = 'text-red-600'
          break
        default:
          action = `Đặt ${fieldName}`
          icon = '📝'
          color = 'text-yellow-600'
      }

      return {
        id: a._id,
        user: userName,
        action,
        time: getTimeAgo(a.createdAt),
        icon,
        color,
        status: a.status
      }
    })
  } catch (error) {
    console.error('❌ Lỗi getActivities:', error)
    throw error
  }
}

// ✅ Lấy thống kê trạng thái booking
const getBookingStatus = async () => {
  try {
    const statusStats = await GET_DB()
      .collection(bookingModel.BOOKING_COLLECTION_NAME)
      .aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
      .toArray()

    const statusMap = {
      pending: { label: 'Chờ xác nhận', color: '#FFA500' },
      confirmed: { label: 'Đã xác nhận', color: '#4CAF50' },
      completed: { label: 'Hoàn thành', color: '#2196F3' },
      cancelled_admin: { label: 'Admin hủy', color: '#F44336' },
      cancelled_refunded: { label: 'Hủy (Hoàn tiền)', color: '#FF9800' },
      cancelled_no_refund: { label: 'Hủy (Không hoàn)', color: '#9E9E9E' }
    }

    return statusStats.map((item) => ({
      status: item._id,
      label: statusMap[item._id]?.label || item._id,
      count: item.count,
      color: statusMap[item._id]?.color || '#607D8B'
    }))
  } catch (error) {
    console.error('❌ Lỗi getBookingStatus:', error)
    throw error
  }
}

// ✅ Helper: Tính thời gian trước
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return `${seconds} giây trước`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phút trước`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`
  return `${Math.floor(hours / 24)} ngày trước`
}

export const dashboardService = {
  getStats,
  getRevenue,
  getFieldUsage,
  getActivities,
  getBookingStatus
}