/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import express from "express"
import { fieldValidation } from "~/validations/fieldValidation"
import { fieldController } from "~/controllers/fieldController"
import { upload } from "~/middlewares/upload"

const Router = express.Router()

// Lấy tất cả hoặc thêm mới (có upload ảnh)
Router.route("/")
  .get(fieldController.getAll)
  .post(upload.array("images", 10), fieldValidation.createNew, fieldController.createNew)

// Các thao tác với từng sân
Router.route("/:id")
  .get(fieldController.getById)
  .put(upload.array("images", 10), fieldController.update)
  .delete(fieldController.remove)

// Kiểm tra sân trống theo thời gian
Router.post("/check-availability", fieldController.checkAvailability)

export const fieldsRoute = Router
