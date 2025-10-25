import axios from 'axios'
import crypto from 'crypto'
import { env } from '~/config/environment'

// Tạo chữ ký HMAC SHA256 cho MoMo
const createSignature = (rawData) => {
  return crypto
    .createHmac('sha256', env.MOMO_SECRET_KEY)
    .update(rawData)
    .digest('hex')
}

// Tạo payment request tới MoMo
export const createMoMoPayment = async (orderId, amount, orderInfo, extraData = '') => {
  try {
    const requestId = `${orderId}_${Date.now()}`
    const orderIdStr = orderId.toString()
    const amountStr = amount.toString()
    const requestType = 'captureWallet'
    
    // Tạo raw signature
    const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amountStr}&extraData=${extraData}&ipnUrl=${env.MOMO_IPN_URL}&orderId=${orderIdStr}&orderInfo=${orderInfo}&partnerCode=${env.MOMO_PARTNER_CODE}&redirectUrl=${env.MOMO_REDIRECT_URL}&requestId=${requestId}&requestType=${requestType}`
    
    const signature = createSignature(rawSignature)
    
    // Request body
    const requestBody = {
      partnerCode: env.MOMO_PARTNER_CODE,
      accessKey: env.MOMO_ACCESS_KEY,
      requestId: requestId,
      amount: amountStr,
      orderId: orderIdStr,
      orderInfo: orderInfo,
      redirectUrl: env.MOMO_REDIRECT_URL,
      ipnUrl: env.MOMO_IPN_URL,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: 'vi'
    }
    
    // Gửi request tới MoMo
    const response = await axios.post(env.MOMO_ENDPOINT, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    return response.data
  } catch (error) {
    console.error('MoMo payment error:', error.response?.data || error.message)
    throw new Error('Failed to create MoMo payment')
  }
}

// Verify callback signature từ MoMo
export const verifyMoMoSignature = (data) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = data
  
  const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
  
  const expectedSignature = createSignature(rawSignature)
  
  return signature === expectedSignature
}

// Verify IPN signature từ MoMo
export const verifyMoMoIPNSignature = (data) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = data
  
  const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
  
  const expectedSignature = createSignature(rawSignature)
  
  return signature === expectedSignature
}

// Kiểm tra trạng thái giao dịch
export const checkMoMoTransactionStatus = async (orderId, requestId) => {
  try {
    const rawSignature = `accessKey=${env.MOMO_ACCESS_KEY}&orderId=${orderId}&partnerCode=${env.MOMO_PARTNER_CODE}&requestId=${requestId}`
    const signature = createSignature(rawSignature)
    
    const requestBody = {
      partnerCode: env.MOMO_PARTNER_CODE,
      accessKey: env.MOMO_ACCESS_KEY,
      requestId: requestId,
      orderId: orderId,
      signature: signature,
      lang: 'vi'
    }
    
    const response = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/query',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    
    return response.data
  } catch (error) {
    console.error('Check MoMo transaction error:', error.response?.data || error.message)
    throw new Error('Failed to check MoMo transaction status')
  }
}