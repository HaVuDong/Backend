import { StatusCodes } from 'http-status-codes'

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(StatusCodes.FORBIDDEN).json({ message: 'Access denied. Admins only.' })
  }
  next()
}
