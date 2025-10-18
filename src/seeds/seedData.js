/* eslint-disable no-console */
/* eslint-disable quotes */
/* eslint-disable semi */
import { CONNECT_DB, CLOSE_DB, GET_DB } from '~/config/mongodb.js';

const seedData = async () => {
  try {
    await CONNECT_DB();
    const db = GET_DB();

    // Xóa dữ liệu cũ (nếu muốn reset)
    await db.collection('tournaments').deleteMany({});
    await db.collection('promotions').deleteMany({});

    // Seed tournaments
    await db.collection('tournaments').insertMany([
      {
        title: "Giải Bóng Đá Sinh Viên Cao Đẳng Công Thương TP HCM 2024 (Khoa CNTT)",
        date: "10/2024",
        status: "Đã diễn ra",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        title: "Giải Phong Trào Thủ Đức",
        date: "03/2025",
        status: "Đã diễn ra",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        title: "Giải Doanh Nghiệp HCM",
        date: "11/2025",
        status: "Sắp diễn ra",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]);

    // Seed promotions
    await db.collection('promotions').insertMany([
      {
        title: "Giảm 20% khi đặt sân buổi sáng",
        time: "06:00 - 09:00",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        title: "Miễn phí nước suối cho khách đặt sân trước 3 ngày",
        time: "Tháng 9/2025",
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        title: "Combo thuê sân + đồng phục giá rẻ",
        time: "Đang áp dụng",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ]);

    console.log("✅ Seed data thành công!");
  } catch (error) {
    console.error("❌ Lỗi seed:", error);
  } finally {
    await CLOSE_DB();
  }
};

seedData();
