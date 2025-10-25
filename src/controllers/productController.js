import { StatusCodes } from 'http-status-codes'
import { productService } from '~/services/productService'

const getAllProducts = async (req, res, next) => {
  try {
    const { page, limit, status, sortBy, sortOrder } = req.query
    // ⬅️ SỬA: Gọi đúng tên function
    const result = await productService.getAllProducts({ page, limit, status, sortBy, sortOrder })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const createProduct = async (req, res, next) => {
  try {
    // ⬅️ SỬA: Gọi đúng tên function
    const product = await productService.createProduct(req.body)
    res.status(StatusCodes.CREATED).json({
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    next(error)
  }
}

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params
    // ⬅️ SỬA: Gọi đúng tên function
    const product = await productService.getProductById(id)
    res.status(StatusCodes.OK).json(product)
  } catch (error) {
    next(error)
  }
}

const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params
    // ⬅️ SỬA: Gọi đúng tên function
    const product = await productService.getProductBySlug(slug)
    res.status(StatusCodes.OK).json(product)
  } catch (error) {
    next(error)
  }
}

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    // ⬅️ SỬA: Gọi đúng tên function
    const product = await productService.updateProduct(id, req.body)
    res.status(StatusCodes.OK).json({
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    next(error)
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params
    // ⬅️ SỬA: Gọi đúng tên function
    await productService.deleteProduct(id)
    res.status(StatusCodes.OK).json({
      message: 'Product deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

const searchProducts = async (req, res, next) => {
  try {
    const { search } = req.query
    // ⬅️ THÊM: Function search (nếu chưa có trong service)
    const result = await productService.getAllProducts({ search })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getProductsByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params
    const { page, limit } = req.query
    // ⬅️ SỬA: Gọi đúng tên function
    const result = await productService.getProductsByCategory(categoryId, { page, limit })
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getTopSellingProducts = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query
    // ⬅️ SỬA: Gọi đúng tên function
    const result = await productService.getTopSellingProducts(parseInt(limit))
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getLowStockProducts = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query
    // ⬅️ SỬA: Gọi đúng tên function
    const result = await productService.getLowStockProducts(parseInt(threshold))
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

export const productController = {
  getAllProducts,
  createProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getTopSellingProducts,
  getLowStockProducts
}