/* eslint-disable no-console */
import express from 'express'
import { dashboardController } from '~/controllers/dashboardController'

const Router = express.Router()


// GET /api/v1/dashboard/stats - Thống kê tổng quan
Router.get('/stats', dashboardController.getStats)

// GET /api/v1/dashboard/revenue?year=2024 - Doanh thu theo tháng
Router.get('/revenue', dashboardController.getRevenue)

// GET /api/v1/dashboard/field-usage - Thống kê sử dụng sân
Router.get('/field-usage', dashboardController.getFieldUsage)

// GET /api/v1/dashboard/activities?limit=10 - Hoạt động gần đây
Router.get('/activities', dashboardController.getActivities)

// GET /api/v1/dashboard/booking-status - Thống kê trạng thái booking
Router.get('/booking-status', dashboardController.getBookingStatus)

export const dashboardRoute = Router