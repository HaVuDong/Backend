/* eslint-disable no-dupe-keys */
import { productModel } from '~/models/productModel'

export const seedProducts = async (categoryId) => {
  const products = [
    // GIÀY BÓNG ĐÁ NIKE
    {
      name: 'Nike Mercurial Vapor 15 Elite FG',
      slug: 'nike-mercurial-vapor-15-elite-fg',
      description: 'Giày bóng đá Nike Mercurial Vapor 15 Elite FG được thiết kế cho tốc độ tối đa. Phần upper Vaporposite+ cải tiến mang lại độ bám bóng tốt hơn trong mọi điều kiện thời tiết.',
      price: 6990000,
      originalPrice: 8990000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/mercurial-vapor-15-elite-fg-1.png',
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/mercurial-vapor-15-elite-fg-2.png'
      ],
      stock: 45,
      sold: 128,
      specifications: {
        brand: 'Nike',
        material: 'Vaporposite+',
        size: ['38', '39', '40', '41', '42', '43', '44', '45'],
        color: ['Xanh Volt', 'Đen/Vàng', 'Trắng/Đỏ'],
        weight: '218g'
      },
      slug: 'nike-mercurial-vapor-15-elite-fg',
      tags: ['nike', 'mercurial', 'tốc độ', 'elite', 'fg'],
      featured: true,
      status: 'active',
      rating: 4.8,
      reviewCount: 89
    },
    {
      name: 'Nike Phantom GX Elite FG',
      slug: 'nike-phantom-gx-elite-fg',
      description: 'Nike Phantom GX Elite FG được thiết kế để kiểm soát bóng tối đa với các rãnh Cyclone 360 giúp cải thiện độ xoáy khi sút bóng.',
      price: 6490000,
      originalPrice: 7990000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/phantom-gx-elite-fg-1.png'
      ],
      stock: 38,
      sold: 95,
      specifications: {
        brand: 'Nike',
        material: 'FlyTouch Plus',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Đen', 'Xanh Navy', 'Hồng'],
        weight: '232g'
      },
      tags: ['nike', 'phantom', 'kiểm soát', 'elite'],
      featured: true,
      status: 'active',
      rating: 4.7,
      reviewCount: 67
    },
    {
      name: 'Nike Tiempo Legend 10 Elite FG',
      slug: 'nike-tiempo-legend-10-elite-fg',
      description: 'Nike Tiempo Legend 10 Elite FG với da FlyTouch Pro mang lại cảm giác chạm bóng tự nhiên và êm ái nhất.',
      price: 6290000,
      originalPrice: 7490000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/tiempo-legend-10-elite-fg.png'
      ],
      stock: 32,
      sold: 76,
      specifications: {
        brand: 'Nike',
        material: 'FlyTouch Pro Leather',
        size: ['38', '39', '40', '41', '42', '43', '44'],
        color: ['Đen/Trắng', 'Nâu'],
        weight: '248g'
      },
      tags: ['nike', 'tiempo', 'da thật', 'classic'],
      featured: true,
      status: 'active',
      rating: 4.9,
      reviewCount: 112
    },

    // GIÀY ADIDAS
    {
      name: 'Adidas Predator Accuracy.1 FG',
      slug: 'adidas-predator-accuracy-1-fg',
      description: 'Adidas Predator Accuracy.1 FG với công nghệ HybridTouch 2.0 và các rãnh High Definition Grip giúp kiểm soát bóng tuyệt đối.',
      price: 6190000,
      originalPrice: 7690000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/predator-accuracy-1-fg.jpg'
      ],
      stock: 41,
      sold: 103,
      specifications: {
        brand: 'Adidas',
        material: 'HybridTouch 2.0',
        size: ['39', '40', '41', '42', '43', '44', '45'],
        color: ['Đỏ/Đen', 'Trắng/Xanh', 'Vàng'],
        weight: '235g'
      },
      tags: ['adidas', 'predator', 'kiểm soát', 'accuracy'],
      featured: true,
      status: 'active',
      rating: 4.7,
      reviewCount: 84
    },
    {
      name: 'Adidas X Speedportal.1 FG',
      slug: 'adidas-x-speedportal-1-fg',
      description: 'Adidas X Speedportal.1 FG - Giày tốc độ với thiết kế siêu nhẹ, phần upper Speed Mesh và đế Speedframe giúp tăng tốc tối đa.',
      price: 5990000,
      originalPrice: 7490000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/x-speedportal-1-fg.jpg'
      ],
      stock: 36,
      sold: 118,
      specifications: {
        brand: 'Adidas',
        material: 'Speed Mesh',
        size: ['38', '39', '40', '41', '42', '43', '44'],
        color: ['Xanh Shock', 'Đen/Cam', 'Trắng'],
        weight: '206g'
      },
      tags: ['adidas', 'x', 'tốc độ', 'speedportal'],
      featured: true,
      status: 'active',
      rating: 4.6,
      reviewCount: 91
    },
    {
      name: 'Adidas Copa Pure.1 FG',
      slug: 'adidas-copa-pure-1-fg',
      description: 'Adidas Copa Pure.1 FG - Giày da bò cao cấp K-leather mang lại cảm giác chạm bóng tự nhiên, phù hợp cho người chơi kỹ thuật.',
      price: 5790000,
      originalPrice: 6990000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/copa-pure-1-fg.jpg'
      ],
      stock: 28,
      sold: 64,
      specifications: {
        brand: 'Adidas',
        material: 'K-Leather',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Đen/Trắng', 'Nâu'],
        weight: '252g'
      },
      tags: ['adidas', 'copa', 'da thật', 'classic'],
      featured: false,
      status: 'active',
      rating: 4.8,
      reviewCount: 58
    },

    // GIÀY PUMA
    {
      name: 'Puma Future Ultimate FG/AG',
      slug: 'puma-future-ultimate-fg-ag',
      description: 'Puma Future Ultimate với công nghệ FUZIONFIT360 ôm chân 360 độ, Dynamic Motion System outsole linh hoạt tối đa.',
      price: 5490000,
      originalPrice: 6490000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/future-ultimate-fg-ag.jpg'
      ],
      stock: 33,
      sold: 72,
      specifications: {
        brand: 'Puma',
        material: 'FUZIONFIT360',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Xanh lá/Vàng', 'Đen/Trắng'],
        weight: '228g'
      },
      tags: ['puma', 'future', 'linh hoạt', 'fg/ag'],
      featured: true,
      status: 'active',
      rating: 4.5,
      reviewCount: 49
    },
    {
      name: 'Puma Ultra Ultimate FG/AG',
      slug: 'puma-ultra-ultimate-fg-ag',
      description: 'Puma Ultra Ultimate - Giày siêu nhẹ chỉ 185g với công nghệ MATRYXEVO giúp tăng tốc độ vượt trội.',
      price: 5290000,
      originalPrice: 6290000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa/ultra-ultimate-fg-ag.jpg'
      ],
      stock: 29,
      sold: 87,
      specifications: {
        brand: 'Puma',
        material: 'MATRYXEVO',
        size: ['38', '39', '40', '41', '42', '43', '44'],
        color: ['Cam/Đen', 'Trắng/Xanh'],
        weight: '185g'
      },
      tags: ['puma', 'ultra', 'tốc độ', 'siêu nhẹ'],
      featured: true,
      status: 'active',
      rating: 4.6,
      reviewCount: 63
    },

    // GIÀY MIZUNO
    {
      name: 'Mizuno Morelia Neo IV Beta Elite',
      slug: 'mizuno-morelia-neo-iv-beta-elite',
      description: 'Mizuno Morelia Neo IV Beta Elite - Da kangaroo siêu mỏng cao cấp, trọng lượng chỉ 195g, cảm giác chân trần.',
      price: 4990000,
      originalPrice: 5990000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://cdn.runrepeat.com/storage/gallery/buying_guide_primary/1234/mizuno-morelia-neo-iv-beta-elite.jpg'
      ],
      stock: 22,
      sold: 45,
      specifications: {
        brand: 'Mizuno',
        material: 'Kangaroo Leather',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Đen', 'Trắng'],
        weight: '195g'
      },
      tags: ['mizuno', 'morelia', 'da kangaroo', 'nhật bản'],
      featured: false,
      status: 'active',
      rating: 4.9,
      reviewCount: 37
    },
    {
      name: 'Mizuno Alpha Elite',
      slug: 'mizuno-alpha-elite',
      description: 'Mizuno Alpha Elite với công nghệ CT Frame Carbon mang lại sự ổn định và tốc độ cho tiền đạo.',
      price: 3990000,
      originalPrice: 4990000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://cdn.runrepeat.com/storage/gallery/buying_guide_primary/1234/mizuno-alpha-elite.jpg'
      ],
      stock: 25,
      sold: 38,
      specifications: {
        brand: 'Mizuno',
        material: 'Microfiber + Mesh',
        size: ['39', '40', '41', '42', '43'],
        color: ['Xanh dương', 'Đỏ'],
        weight: '212g'
      },
      tags: ['mizuno', 'alpha', 'tốc độ', 'carbon'],
      featured: false,
      status: 'active',
      rating: 4.4,
      reviewCount: 29
    },

    // GIÀY NEW BALANCE
    {
      name: 'New Balance Tekela v4 Pro FG',
      slug: 'new-balance-tekela-v4-pro-fg',
      description: 'New Balance Tekela v4 Pro FG với công nghệ Hypoknit upper mang lại sự linh hoạt và kiểm soát bóng tốt.',
      price: 3790000,
      originalPrice: 4790000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://nb.scene7.com/is/image/NB/tekela-v4-pro-fg-1.jpg'
      ],
      stock: 31,
      sold: 52,
      specifications: {
        brand: 'New Balance',
        material: 'Hypoknit',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Đen/Xanh', 'Trắng'],
        weight: '224g'
      },
      tags: ['new balance', 'tekela', 'kiểm soát'],
      featured: false,
      status: 'active',
      rating: 4.3,
      reviewCount: 34
    },
    {
      name: 'New Balance Furon v7 Pro FG',
      slug: 'new-balance-furon-v7-pro-fg',
      description: 'New Balance Furon v7 Pro FG thiết kế tốc độ với đế Data2Shoe mang lại độ bám sân tối ưu.',
      price: 3590000,
      originalPrice: 4590000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://nb.scene7.com/is/image/NB/furon-v7-pro-fg-1.jpg'
      ],
      stock: 27,
      sold: 41,
      specifications: {
        brand: 'New Balance',
        material: 'Synthetic',
        size: ['38', '39', '40', '41', '42', '43'],
        color: ['Đỏ/Đen', 'Xanh'],
        weight: '198g'
      },
      tags: ['new balance', 'furon', 'tốc độ'],
      featured: false,
      status: 'active',
      rating: 4.2,
      reviewCount: 26
    },

    // GIÀY ASICS
    {
      name: 'Asics DS Light X-Fly PRO',
      slug: 'asics-ds-light-x-fly-pro',
      description: 'Asics DS Light X-Fly PRO - Giày nhẹ chỉ 190g với da kangaroo tự nhiên, phù hợp cho kỹ thuật viên.',
      price: 4290000,
      originalPrice: 5290000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://www.asics.com/on/demandware.static/ds-light-x-fly-pro.jpg'
      ],
      stock: 19,
      sold: 33,
      specifications: {
        brand: 'Asics',
        material: 'Kangaroo Leather',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Đen/Vàng', 'Trắng/Xanh'],
        weight: '190g'
      },
      tags: ['asics', 'ds light', 'da kangaroo', 'nhật bản'],
      featured: false,
      status: 'active',
      rating: 4.6,
      reviewCount: 22
    },

    // GIÀY UNDER ARMOUR
    {
      name: 'Under Armour Magnetico Elite 3.0 FG',
      slug: 'under-armour-magnetico-elite-3-fg',
      description: 'Under Armour Magnetico Elite 3.0 với da tổng hợp FormTrue mang lại độ bám bóng và kiểm soát tốt.',
      price: 3290000,
      originalPrice: 4290000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://underarmour.scene7.com/is/image/Underarmour/magnetico-elite-3-fg.jpg'
      ],
      stock: 24,
      sold: 28,
      specifications: {
        brand: 'Under Armour',
        material: 'FormTrue Synthetic',
        size: ['39', '40', '41', '42', '43'],
        color: ['Đen', 'Xanh Navy'],
        weight: '236g'
      },
      tags: ['under armour', 'magnetico', 'kiểm soát'],
      featured: false,
      status: 'active',
      rating: 4.1,
      reviewCount: 18
    },

    // GIÀY UMBRO
    {
      name: 'Umbro Velocita VI Pro FG',
      slug: 'umbro-velocita-vi-pro-fg',
      description: 'Umbro Velocita VI Pro FG thiết kế tốc độ với A-Frame structure hỗ trợ gia tốc tối đa.',
      price: 2990000,
      originalPrice: 3990000,
      categoryId: categoryId,
      categoryName: 'Giày bóng đá',
      images: [
        'https://umbro.com/on/demandware.static/velocita-vi-pro-fg.jpg'
      ],
      stock: 21,
      sold: 31,
      specifications: {
        brand: 'Umbro',
        material: 'Microfiber + Mesh',
        size: ['39', '40', '41', '42', '43', '44'],
        color: ['Xanh/Vàng', 'Đen/Cam'],
        weight: '215g'
      },
      tags: ['umbro', 'velocita', 'tốc độ'],
      featured: false,
      status: 'active',
      rating: 4.0,
      reviewCount: 15
    }
  ]

  try {
    console.log('🌱 Seeding products...')
    
    const results = []
    for (const product of products) {
      const created = await productModel.createNew(product)
      results.push(created)
      console.log(`✅ Created product: ${product.name}`)
    }
    
    console.log(`✅ Successfully seeded ${results.length} products!`)
    return results
  } catch (error) {
    console.error('❌ Error seeding products:', error)
    throw error
  }
}