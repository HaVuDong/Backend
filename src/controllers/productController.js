/* eslint-disable quotes */
import { productService } from "~/services/productService";
import { StatusCodes } from "http-status-codes";

export const productController = {
  // 🟢 Lấy tất cả sản phẩm
  async getAll(req, res, next) {
    try {
      const products = await productService.getAll();
      res.status(StatusCodes.OK).json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
      next(error);
    }
  },

  // 🟢 Lấy chi tiết 1 sản phẩm theo ID
  async getById(req, res, next) {
    try {
      const product = await productService.getById(req.params.id);
      if (!product) {
        return res.status(StatusCodes.NOT_FOUND).json({
          success: false,
          message: "Không tìm thấy sản phẩm!"
        });
      }
      res.status(StatusCodes.OK).json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error("❌ Lỗi khi lấy sản phẩm theo ID:", error);
      next(error);
    }
  },

  // 🟡 Thêm mới sản phẩm
  async create(req, res, next) {
    try {
      const data = req.body;

      // Kiểm tra dữ liệu cơ bản
      if (!data.name || !data.price) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Thiếu thông tin bắt buộc: name hoặc price!"
        });
      }

      const result = await productService.create({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Thêm sản phẩm thành công!",
        data: result
      });
    } catch (error) {
      console.error("❌ Lỗi khi thêm sản phẩm:", error);
      next(error);
    }
  },

  // 🟠 Cập nhật sản phẩm
  async update(req, res, next) {
    try {
      const result = await productService.update(req.params.id, {
        ...req.body,
        updatedAt: new Date()
      });
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Cập nhật sản phẩm thành công!",
        data: result
      });
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      next(error);
    }
  },

  // 🔴 Xóa sản phẩm
  async remove(req, res, next) {
    try {
      const result = await productService.remove(req.params.id);
      res.status(StatusCodes.OK).json({
        success: true,
        message: "Đã xóa sản phẩm thành công!",
        data: result
      });
    } catch (error) {
      console.error("❌ Lỗi khi xóa sản phẩm:", error);
      next(error);
    }
  }
};
