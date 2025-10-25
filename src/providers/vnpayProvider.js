import crypto from 'crypto'
import querystring from 'querystring'
import moment from 'moment'
import { env } from '~/config/environment'

// Sắp xếp object theo key
const sortObject = (obj) => {
  const sorted = {}
  const keys = Object.keys(obj).sort()
  
  keys.forEach(key => {
    sorted[key] = obj[key]
  })
  
  return sorted
}

// Tạo chữ ký HMAC SHA512 cho VNPay
const createSignature = (data, secretKey) => {
  const hmac = crypto.createHmac('sha512', secretKey)
  return hmac.update(Buffer.from(data, 'utf-8')).digest('hex')
}

// Tạo payment URL cho VNPay
export const createVNPayPayment = (orderId, amount, orderInfo, ipAddr) => {
  try {
    const createDate = moment().format('YYYYMMDDHHmmss')
    const expireDate = moment().add(15, 'minutes').format('YYYYMMDDHHmmss')
    
    let vnpParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: env.VNPAY_TMN_CODE,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId.toString(),
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: amount * 100, // VNPay yêu cầu amount * 100
      vnp_ReturnUrl: env.VNPAY_RETURN_URL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate
    }
    
    // Sắp xếp params
    vnpParams = sortObject(vnpParams)
    
    // Tạo query string
    const signData = querystring.stringify(vnpParams, { encode: false })
    
    // Tạo signature
    const signature = createSignature(signData, env.VNPAY_HASH_SECRET)
    
    // Thêm signature vào params
    vnpParams['vnp_SecureHash'] = signature
    
    // Tạo payment URL
    const paymentUrl = env.VNPAY_URL + '?' + querystring.stringify(vnpParams, { encode: false })
    
    return {
      paymentUrl,
      orderId: orderId.toString(),
      createDate,
      expireDate
    }
  } catch (error) {
    console.error('VNPay payment error:', error)
    throw new Error('Failed to create VNPay payment')
  }
}

// Verify callback signature từ VNPay
export const verifyVNPaySignature = (vnpParams) => {
  try {
    const secureHash = vnpParams['vnp_SecureHash']
    
    // Xóa các field không cần thiết
    delete vnpParams['vnp_SecureHash']
    delete vnpParams['vnp_SecureHashType']
    
    // Sắp xếp params
    const sortedParams = sortObject(vnpParams)
    
    // Tạo sign data
    const signData = querystring.stringify(sortedParams, { encode: false })
    
    // Tạo signature
    const expectedSignature = createSignature(signData, env.VNPAY_HASH_SECRET)
    
    return secureHash === expectedSignature
  } catch (error) {
    console.error('Verify VNPay signature error:', error)
    return false
  }
}

// Parse VNPay response
export const parseVNPayResponse = (vnpParams) => {
  return {
    orderId: vnpParams.vnp_TxnRef,
    amount: parseInt(vnpParams.vnp_Amount) / 100,
    orderInfo: vnpParams.vnp_OrderInfo,
    responseCode: vnpParams.vnp_ResponseCode,
    transactionNo: vnpParams.vnp_TransactionNo,
    bankCode: vnpParams.vnp_BankCode,
    payDate: vnpParams.vnp_PayDate,
    transactionStatus: vnpParams.vnp_TransactionStatus,
    cardType: vnpParams.vnp_CardType
  }
}

// Response codes của VNPay
export const VNPAY_RESPONSE_CODES = {
  '00': 'Giao dịch thành công',
  '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
  '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
  '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
  '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
  '12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
  '13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).',
  '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
  '51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
  '65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
  '75': 'Ngân hàng thanh toán đang bảo trì.',
  '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định.',
  '99': 'Các lỗi khác'
}