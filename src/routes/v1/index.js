/* eslint-disable quotes */
import express from "express"
import { StatusCodes } from "http-status-codes"
import { fieldsRoute } from "~/routes/v1/FieldsRoute"
import { bookingRoute } from "~/routes/v1/BookingsRoute" // ✅ import đúng
import { customersRoute } from "~/routes/v1/customersRoute"
import { paymentsRoute } from "~/routes/v1/paymentsRoute"
import { usersRoute } from "~/routes/v1/usersRoute"
import { tournamentsRoute } from "./tournamentsRoute"
import { promotionsRoute } from "./promotionsRoute"
import { dashboardRoute } from '~/routes/v1/DashbordRoute'
const Router = express.Router()

// ✅ Check server status
Router.get("/status", (req, res) => {
  res.status(StatusCodes.OK).json({ message: "API v1 are ready to use." })
})

// ✅ Mount các route con
Router.use("/fields", fieldsRoute)
Router.use("/bookings", bookingRoute) // ✅ Route đặt sân
Router.use("/customers", customersRoute)
Router.use("/payments", paymentsRoute)
Router.use("/users", usersRoute)
Router.use("/tournaments", tournamentsRoute)
Router.use("/promotions", promotionsRoute)
Router.use('/dashboard', dashboardRoute)
export const API_V1 = Router
