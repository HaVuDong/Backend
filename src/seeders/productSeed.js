/* eslint-disable quotes */
/* eslint-disable no-console */
import { GET_DB, CONNECT_DB } from '~/config/mongodb'

const seedProducts = async () => {
  try {
    await CONNECT_DB();
    const db = GET_DB();
    const products = db.collection("products");

    // 🧹 Xóa dữ liệu cũ
    await products.deleteMany({});
    console.log("🧹 Đã xóa toàn bộ dữ liệu sản phẩm cũ.");

    // 🧩 Dữ liệu mẫu (8 sản phẩm)
    const sampleProducts = [
      {
        name: "Nike Mercurial Vapor 15 Elite FG",
        slug: "nike-mercurial-vapor-15-elite-fg",
        description: "Giày bóng đá Nike Mercurial Vapor 15 Elite FG siêu nhẹ, hỗ trợ tốc độ tối đa.",
        price: 6990000,
        originalPrice: 8990000,
        categoryId: "68fcb0968ecf5bbd3099e12e",
        categoryName: "Giày bóng đá",
        images: [
          "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto/mercurial-vapor-15-elite-fg.png"
        ],
        stock: 50,
        sold: 10,
        specifications: {
          brand: "Nike",
          material: "Flyknit",
          size: ["39", "40", "41", "42", "43"],
          color: ["Đỏ", "Trắng"],
          weight: "250g"
        },
        tags: ["giày", "bóng đá", "nike"],
        featured: true,
        rating: 4.8,
        reviewCount: 56,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Adidas Predator Accuracy FG",
        slug: "adidas-predator-accuracy-fg",
        description: "Giày bóng đá Adidas Predator Accuracy nổi tiếng với khả năng kiểm soát bóng vượt trội.",
        price: 5990000,
        originalPrice: 7990000,
        categoryId: "68fcb0968ecf5bbd3099e12e",
        categoryName: "Giày bóng đá",
        images: [
          "https://assets.adidas.com/images/w_600,f_auto,q_auto/Predator_Accuracy_FG.jpg"
        ],
        stock: 60,
        sold: 15,
        specifications: {
          brand: "Adidas",
          material: "Primeknit",
          size: ["38", "39", "40", "41", "42"],
          color: ["Đen", "Xanh dương"],
          weight: "240g"
        },
        tags: ["adidas", "predator", "bóng đá"],
        featured: false,
        rating: 4.6,
        reviewCount: 42,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Găng thủ môn Nike Vapor Grip 3",
        slug: "nike-vapor-grip-3",
        description: "Găng thủ môn cao cấp của Nike, bám bóng tốt và êm tay.",
        price: 2990000,
        categoryId: "68fcb0a78ecf5bbd3099e12f",
        categoryName: "Găng thủ môn",
        images: [
          "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto/vapor-grip-3.jpg"
        ],
        stock: 30,
        sold: 5,
        specifications: {
          brand: "Nike",
          material: "Latex",
          size: ["8", "9", "10"],
          color: ["Trắng", "Cam"],
          weight: "150g"
        },
        tags: ["găng", "thủ môn", "nike"],
        featured: false,
        rating: 4.5,
        reviewCount: 21,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Áo thi đấu CLB Barcelona 2025",
        slug: "barcelona-2025-jersey",
        description: "Áo đấu chính thức của CLB Barcelona mùa 2025.",
        price: 1490000,
        categoryId: "68fcb0ad8ecf5bbd3099e130",
        categoryName: "Áo thi đấu",
        images: [
          "https://store.fcbarcelona.com/2025-home-jersey.jpg"
        ],
        stock: 100,
        sold: 35,
        specifications: {
          brand: "Nike",
          material: "Polyester",
          size: ["S", "M", "L", "XL"],
          color: ["Đỏ", "Xanh"],
          weight: "200g"
        },
        tags: ["áo", "barcelona", "bóng đá"],
        featured: true,
        rating: 4.9,
        reviewCount: 87,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Quả bóng Adidas Al Rihla",
        slug: "adidas-al-rihla-ball",
        description: "Quả bóng chính thức của World Cup 2022, độ nảy và độ bền cao.",
        price: 1990000,
        categoryId: "68fcb0b88ecf5bbd3099e132",
        categoryName: "Bóng đá",
        images: [
          "https://assets.adidas.com/images/w_600,f_auto,q_auto/al-rihla-ball.jpg"
        ],
        stock: 80,
        sold: 20,
        specifications: {
          brand: "Adidas",
          material: "PU",
          size: ["5"],
          color: ["Trắng", "Cầu vồng"],
          weight: "420g"
        },
        tags: ["bóng", "adidas", "worldcup"],
        featured: true,
        rating: 4.7,
        reviewCount: 65,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Balo thể thao Adidas",
        slug: "adidas-sport-backpack",
        description: "Balo thể thao gọn nhẹ, tiện dụng, phù hợp đi học và tập luyện.",
        price: 890000,
        categoryId: "68fcb0b28ecf5bbd3099e131",
        categoryName: "Phụ kiện thể thao",
        images: [
          "https://assets.adidas.com/images/w_600,f_auto,q_auto/sport-backpack.jpg"
        ],
        stock: 40,
        sold: 8,
        specifications: {
          brand: "Adidas",
          material: "Polyester",
          color: ["Đen", "Trắng"],
          weight: "600g"
        },
        tags: ["balo", "adidas", "phụ kiện"],
        featured: false,
        rating: 4.3,
        reviewCount: 14,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Giày bóng đá Puma Ultra Ultimate FG",
        slug: "puma-ultra-ultimate-fg",
        description: "Giày Puma Ultra Ultimate FG siêu nhẹ, thiết kế tinh tế và tốc độ vượt trội.",
        price: 6590000,
        categoryId: "68fcb0968ecf5bbd3099e12e",
        categoryName: "Giày bóng đá",
        images: [
          "https://images.puma.com/image/upload/f_auto,q_auto,fl_lossy/ultra-ultimate-fg.jpg"
        ],
        stock: 45,
        sold: 9,
        specifications: {
          brand: "Puma",
          material: "Textile",
          size: ["39", "40", "41", "42"],
          color: ["Cam", "Đen"],
          weight: "230g"
        },
        tags: ["giày", "puma", "bóng đá"],
        featured: false,
        rating: 4.4,
        reviewCount: 33,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      },
      {
        name: "Bình nước thể thao Nike 750ml",
        slug: "nike-sport-bottle",
        description: "Bình nước Nike dung tích 750ml, tiện dụng cho mọi hoạt động thể thao.",
        price: 350000,
        categoryId: "68fcb0b28ecf5bbd3099e131",
        categoryName: "Phụ kiện thể thao",
        images: [
          "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto/sport-bottle.jpg"
        ],
        stock: 120,
        sold: 25,
        specifications: {
          brand: "Nike",
          material: "Nhựa BPA-free",
          color: ["Đen", "Trắng"],
          weight: "120g"
        },
        tags: ["bình nước", "nike", "phụ kiện"],
        featured: true,
        rating: 4.8,
        reviewCount: 75,
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null
      }
    ];

    // 🧩 Thêm dữ liệu
    await products.insertMany(sampleProducts);
    console.log(`✅ Đã thêm ${sampleProducts.length} sản phẩm mẫu!`);
  } catch (error) {
    console.error("❌ Lỗi khi seed sản phẩm:", error);
  } finally {
    process.exit();
  }
};

seedProducts();
