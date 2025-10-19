/* eslint-disable semi */
import express from 'express';
import { productController } from '~/controllers/productController';

const Router = express.Router();

// 🟢 Lấy tất cả sản phẩm
Router.get('/', productController.getAll);

// 🟢 Lấy chi tiết 1 sản phẩm theo ID
Router.get('/:id', productController.getById);

// 🟡 Thêm mới sản phẩm
Router.post('/', productController.create);

// 🟡 Cập nhật sản phẩm
Router.put('/:id', productController.update);

// 🟡 Xoá sản phẩm
Router.delete('/:id', productController.remove);

export const productsRoute = Router;
