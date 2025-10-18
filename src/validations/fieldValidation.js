/* eslint-disable no-multiple-empty-lines */
/* eslint-disable no-console */
/* eslint-disable indent */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async (req, res, next) => {
    const correctCondition = Joi.object({
        name: Joi.string().required().min(3).max(100).trim().strict(),
        slug: Joi.string().trim().strict(),
        type: Joi.string().valid('5 người', '7 người', '11 người').required(),
        pricePerHour: Joi.number().required().min(0),
        status: Joi.string().valid('available', 'maintenance', 'booked').default('available'),
        location: Joi.string().allow('', null).max(200),
        description: Joi.string().max(500).allow('', null),
        images: Joi.array().items(Joi.string().uri()).default([]),
        amenities: Joi.array().items(Joi.string()).default([]),
        isActive: Joi.boolean().default(true)
    })

    try {
        //chỉ định abortEarly: false để trường hợp có nhiều lỗi thì trả về tất cả lỗi
        await correctCondition.validateAsync(req.body, { abortEarly: false })
        //validate dữ liệu hợp lệ thì cho res chạy qua controller
        next()
    } catch (error) {
        // const errorMessage = new Error(error).message
        // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
        next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
    }
}

export const fieldValidation = {
    createNew
}