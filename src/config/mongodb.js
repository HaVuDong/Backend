/* eslint-disable indent */
/* eslint-disable no-unused-vars */

import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

let trelloDatabaseInstance = null

//khởi tạo một đối tượng MongoClientInstance để connect tới mongodb
const MongoClientInstance = new MongoClient(env.MONGODB_URI, {
    serverApi:{
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
    }

})
//kết nối tới database
export const CONNECT_DB = async () => {
    //gọi kết nối tới mongodb Atlas với URi đa khai báo trong thân của MongoClientInstance
    await MongoClientInstance.connect()
    //kết nối thành công thì lấy ra database theo tên và gán ngược lại vào biến trelloDatabaseInstance
    trelloDatabaseInstance = MongoClientInstance.db(env.DATABASE_NAME)
}

//function GET_DB(ko async) có nhiệm vự export ra trelloDatabaseInstance sau khi đa connect thành công để sử dụng ở nhiều nơi
//Lưu ý đảm bảo connect thành công thì mới gọi GET_DB

export const GET_DB = () => {
    if (!trelloDatabaseInstance) throw new Error('must connect to database first!')
    return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
    await MongoClientInstance.close()
}

