import { seedCategories } from './categorySeed'
import { seedProducts } from './productSeed'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'

const runSeeder = async () => {
  try {
    console.log('🚀 Starting database seeding...\n')
    
    // 1. Connect to database
    console.log('1️⃣ Connecting to MongoDB...')
    await CONNECT_DB()
    console.log('✅ Connected to MongoDB!\n')
    
    // 2. Seed categories
    console.log('2️⃣ Seeding categories...')
    const categories = await seedCategories()
    console.log(`✅ Seeded ${categories.length} categories!\n`)
    
    // 3. Seed products (use first category - Giày bóng đá)
    console.log('3️⃣ Seeding products...')
    const shoeCategoryId = categories[0]._id.toString()
    const products = await seedProducts(shoeCategoryId)
    console.log(`✅ Seeded ${products.length} products!\n`)
    
    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Products: ${products.length}`)
    
    // 4. Close connection
    await CLOSE_DB()
    console.log('\n✅ Database connection closed')
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    await CLOSE_DB()
    process.exit(1)
  }
}

// Run seeder
runSeeder()