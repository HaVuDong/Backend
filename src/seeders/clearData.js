import { GET_DB, CONNECT_DB, CLOSE_DB } from '~/config/mongodb'

const clearAllData = async () => {
  try {
    console.log('🗑️  Starting to clear database...\n')
    
    // Connect to database
    console.log('1️⃣ Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('✅ Connected to MongoDB!\n')
    
    const db = GET_DB()
    
    // Clear categories
    console.log('2️⃣ Clearing categories...')
    const categoriesResult = await db.collection('categories').deleteMany({})
    console.log(`✅ Deleted ${categoriesResult.deletedCount} categories\n`)
    
    // Clear products
    console.log('3️⃣ Clearing products...')
    const productsResult = await db.collection('products').deleteMany({})
    console.log(`✅ Deleted ${productsResult.deletedCount} products\n`)
    
    // Clear carts
    console.log('4️⃣ Clearing carts...')
    const cartsResult = await db.collection('carts').deleteMany({})
    console.log(`✅ Deleted ${cartsResult.deletedCount} carts\n`)
    
    // Clear orders
    console.log('5️⃣ Clearing orders...')
    const ordersResult = await db.collection('orders').deleteMany({})
    console.log(`✅ Deleted ${ordersResult.deletedCount} orders\n`)
    
    // Clear payments
    console.log('6️⃣ Clearing payments...')
    const paymentsResult = await db.collection('payments').deleteMany({})
    console.log(`✅ Deleted ${paymentsResult.deletedCount} payments\n`)
    
    console.log('🎉 Database cleared successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Categories deleted: ${categoriesResult.deletedCount}`)
    console.log(`   - Products deleted: ${productsResult.deletedCount}`)
    console.log(`   - Carts deleted: ${cartsResult.deletedCount}`)
    console.log(`   - Orders deleted: ${ordersResult.deletedCount}`)
    console.log(`   - Payments deleted: ${paymentsResult.deletedCount}`)
    
    // Close connection
    await CLOSE_DB()
    console.log('\n✅ Database connection closed')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Clear data failed:', error)
    await CLOSE_DB()
    process.exit(1)
  }
}

// Run clear
clearAllData()