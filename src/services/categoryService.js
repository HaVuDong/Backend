/* eslint-disable no-useless-catch */
import { categoryModel } from '~/models/categoryModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

// Tạo category mới
const createCategory = async (data) => {
  try {
    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await categoryModel.findBySlug(data.slug)
    if (existingCategory) {
      throw new ApiError(StatusCodes.CONFLICT, 'Category slug already exists')
    }
    
    return await categoryModel.createNew(data)
  } catch (error) {
    throw error
  }
}

// Lấy tất cả categories
const getAllCategories = async (options = {}) => {
  try {
    return await categoryModel.getAll(options)
  } catch (error) {
    throw error
  }
}

// Lấy chi tiết category
const getCategoryById = async (id) => {
  try {
    const category = await categoryModel.findOneById(id)
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    
    // Lấy số lượng sản phẩm trong category
    const productCount = await categoryModel.getProductCount(id)
    
    return {
      ...category,
      productCount
    }
  } catch (error) {
    throw error
  }
}

// Cập nhật category
const updateCategory = async (id, data) => {
  try {
    // Nếu thay đổi slug, kiểm tra trùng
    if (data.slug) {
      const existingCategory = await categoryModel.findBySlug(data.slug)
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw new ApiError(StatusCodes.CONFLICT, 'Category slug already exists')
      }
    }
    
    const category = await categoryModel.updateOne(id, data)
    if (!category) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    
    return category
  } catch (error) {
    throw error
  }
}

// Xóa category
const deleteCategory = async (id) => {
  try {
    const result = await categoryModel.deleteOne(id)
    if (result.deletedCount === 0) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Category not found')
    }
    
    return { message: 'Category deleted successfully' }
  } catch (error) {
    throw error
  }
}

export const categoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
}