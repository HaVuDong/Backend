/* eslint-disable indent */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import 'dotenv/config'

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    DATABASE_NAME: process.env.DATABASE_NAME,
    APP_HOST: process.env.APP_HOST,
    APP_PORT: process.env.APP_PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    BUILD_MODE: process.env.BUILD_MODE,

    AUTHOR: process.env.AUTHOR,

// MOMO
  MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE,
  MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY,
  MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY,
  MOMO_ENDPOINT: process.env.MOMO_ENDPOINT,
  MOMO_REDIRECT_URL: process.env.MOMO_REDIRECT_URL,
  MOMO_IPN_URL: process.env.MOMO_IPN_URL,
  
  // VNPAY
  VNPAY_TMN_CODE: process.env.VNPAY_TMN_CODE,
  VNPAY_HASH_SECRET: process.env.VNPAY_HASH_SECRET,
  VNPAY_URL: process.env.VNPAY_URL,
  VNPAY_RETURN_URL: process.env.VNPAY_RETURN_URL,
  VNPAY_IPN_URL: process.env.VNPAY_IPN_URL,
  CLIENT_URL: process.env.CLIENT_URL
}