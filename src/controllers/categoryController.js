import { StatusCodes } from 'http-status-codes'
import { categoryService } from '~/services/categoryService'

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body)
    
    res.status(StatusCodes.CREATED).json({
      message: 'Category created successfully',
      category
    })
  } catch (error) {
    next(error)
  }
}

const getAllCategories = async (req, res, next) => {
  try {
    const { status } = req.query
    
    const categories = await categoryService.getAllCategories({ status })
    
    res.status(StatusCodes.OK).json(categories)
  } catch (error) {
    next(error)
  }
}

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const category = await categoryService.getCategoryById(id)
    
    res.status(StatusCodes.OK).json(category)
  } catch (error) {
    next(error)
  }
}

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const category = await categoryService.updateCategory(id, req.body)
    
    res.status(StatusCodes.OK).json({
      message: 'Category updated successfully',
      category
    })
  } catch (error) {
    next(error)
  }
}

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params
    
    const result = await categoryService.deleteCategory(id)
    
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const categoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
}