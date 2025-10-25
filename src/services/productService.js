/* eslint-disable no-useless-catch */
import { productModel } from '~/models/productModel'
import { categoryModel } from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Tạo product mới
const createProduct = async (data) => {
  try {
    // Kiểm tra category có tồn tại không
    const category = await categoryModel.findOneById(data.categoryId)
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    
    // Kiểm tra slug đã tồn tại chưa
    const existingProduct = await productModel.findBySlug(data.slug)
    if (existingProduct) {
      throw new ApiError(StatusCodes.CONFLICT, 'Product slug already exists')
    }
    
    // Thêm categoryName để denormalize
    data.categoryName = category.name
    
    return await productModel.createNew(data)
  } catch (error) {
    throw error
  }
}

// Lấy tất cả products
const getAllProducts = async (options = {}) => {
  try {
    return await productModel.getAll(options)
  } catch (error) {
    throw error
  }
}

// Lấy chi tiết product
const getProductById = async (id) => {
  try {
    const product = await productModel.findOneById(id)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')
    }
    
    return product
  } catch (error) {
    throw error
  }
}

// Lấy product theo slug
const getProductBySlug = async (slug) => {
  try {
    const product = await productModel.findBySlug(slug)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')
    }
    
    return product
  } catch (error) {
    throw error
  }
}

// Cập nhật product
const updateProduct = async (id, data) => {
  try {
    // Nếu thay đổi categoryId, kiểm tra category tồn tại
    if (data.categoryId) {
      const category = await categoryModel.findOneById(data.categoryId)
      if (!category) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
      }
      data.categoryName = category.name
    }
    
    // Nếu thay đổi slug, kiểm tra trùng
    if (data.slug) {
      const existingProduct = await productModel.findBySlug(data.slug)
      if (existingProduct && existingProduct._id.toString() !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Product slug already exists')
      }
    }
    
    const product = await productModel.updateOne(id, data)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')
    }
    
    return product
  } catch (error) {
    throw error
  }
}

// Xóa product (soft delete)
const deleteProduct = async (id) => {
  try {
    const product = await productModel.softDelete(id)
    if (!product) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Product not found')
    }
    
    return { message: 'Product deleted successfully' }
  } catch (error) {
    throw error
  }
}

// Lấy sản phẩm bán chạy
const getTopSellingProducts = async (limit = 10) => {
  try {
    return await productModel.getTopSelling(limit)
  } catch (error) {
    throw error
  }
}

// Lấy sản phẩm sắp hết hàng
const getLowStockProducts = async (threshold = 10) => {
  try {
    return await productModel.getLowStock(threshold)
  } catch (error) {
    throw error
  }
}

// Lấy sản phẩm theo category
const getProductsByCategory = async (categoryId, options = {}) => {
  try {
    const category = await categoryModel.findOneById(categoryId)
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    
    return await productModel.getAll({ ...options, categoryId })
  } catch (error) {
    throw error
  }
}

export const productService = {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  getTopSellingProducts,
  getLowStockProducts,
  getProductsByCategory
}