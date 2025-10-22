import { categoryModel } from '~/models/categoryModel'

const categories = [
  {
    name: 'Giày bóng đá',
    slug: 'giay-bong-da',
    description: 'Giày đá bóng chính hãng từ Nike, Adidas, Puma, Mizuno và các thương hiệu nổi tiếng',
    image: 'https://cdn.shopify.com/s/files/1/0556/4443/0448/files/soccer-shoes-category.jpg',
    order: 1,
    status: 'active'
  },
  {
    name: 'Quần áo thể thao',
    slug: 'quan-ao-the-thao',
    description: 'Áo đấu, quần short, áo khoác, áo training chất lượng cao',
    image: 'https://cdn.shopify.com/s/files/1/0556/4443/0448/files/sportswear-category.jpg',
    order: 2,
    status: 'active'
  },
  {
    name: 'Phụ kiện bóng đá',
    slug: 'phu-kien-bong-da',
    description: 'Găng tay thủ môn, tất đá bóng, bảo hộ ống đồng, túi đựng giày',
    image: 'https://cdn.shopify.com/s/files/1/0556/4443/0448/files/accessories-category.jpg',
    order: 3,
    status: 'active'
  },
  {
    name: 'Bóng đá',
    slug: 'bong-da',
    description: 'Bóng đá thi đấu, bóng tập luyện các size 4, 5',
    image: 'https://cdn.shopify.com/s/files/1/0556/4443/0448/files/football-category.jpg',
    order: 4,
    status: 'active'
  },
  {
    name: 'Dụng cụ tập luyện',
    slug: 'dung-cu-tap-luyen',
    description: 'Cọc training, khung thành mini, lưới tập bắn, đĩa tập',
    image: 'https://cdn.shopify.com/s/files/1/0556/4443/0448/files/training-equipment.jpg',
    order: 5,
    status: 'active'
  }
]

export const seedCategories = async () => {
  try {
    console.log('🌱 Seeding categories...')
    
    const results = []
    for (const category of categories) {
      const created = await categoryModel.createNew(category)
      results.push(created)
      console.log(`✅ Created category: ${category.name}`)
    }
    
    console.log(`✅ Successfully seeded ${results.length} categories!`)
    return results
  } catch (error) {
    console.error('❌ Error seeding categories:', error)
    throw error
  }
}