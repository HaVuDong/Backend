/* eslint-disable no-console */
import Parser from 'rss-parser'
import cron from 'node-cron'
import { postModel } from '~/models/postModel'

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  customFields: {
    item: [
      ['media:content', 'media'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'fullContent'],
      ['description', 'description']
    ]
  }
})

// ⚽ Danh sách nguồn RSS bóng đá Việt Nam
const RSS_SOURCES = [
  {
    name: 'VnExpress Bóng đá',
    url: 'https://vnexpress.net/rss/bong-da.rss',
    category: 'auto'
  },
  {
    name: 'Tuổi Trẻ Thể thao',
    url: 'https://tuoitre.vn/rss/the-thao.rss',
    category: 'auto'
  },
  {
    name: 'Thanh Niên Thể thao',
    url: 'https://thanhnien.vn/rss/the-thao.rss',
    category: 'auto'
  }
]

// 🖼️ Extract image from RSS item
const extractImage = (item) => {
  try {
    // Try enclosure first
    if (item.enclosure && item.enclosure.url) {
      return item.enclosure.url
    }

    // Try media:content
    if (item.media && item.media.$) {
      return item.media.$.url
    }

    // Try to extract from content
    if (item.content || item.fullContent) {
      const content = item.content || item.fullContent
      const imgRegex = /<img[^>]+src="([^">]+)"/i
      const match = content.match(imgRegex)
      if (match && match[1]) {
        return match[1]
      }
    }

    // Try to extract from contentSnippet
    if (item.contentSnippet) {
      const imgRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i
      const match = item.contentSnippet.match(imgRegex)
      if (match && match[0]) {
        return match[0]
      }
    }

    return ''
  } catch (error) {
    console.error('❌ [extractImage] Error:', error.message)
    return ''
  }
}

// 🧹 Clean HTML from summary
const cleanSummary = (text) => {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace nbsp
    .replace(/&amp;/g, '&') // Replace amp
    .replace(/&quot;/g, '"') // Replace quot
    .replace(/&#39;/g, "'") // Replace apos
    .replace(/\s+/g, ' ') // Replace multiple spaces
    .trim()
    .substring(0, 500) // Limit to 500 chars
}

// 🤖 Crawl từ một nguồn RSS
const crawlFromSource = async (source) => {
  try {
    console.log(`\n⏳ [${source.name}] Đang crawl...`)

    const feed = await parser.parseURL(source.url)

    if (!feed || !feed.items || feed.items.length === 0) {
      console.log(`⚠️ [${source.name}] Không có tin tức mới`)
      return 0
    }

    let newPostsCount = 0

    // Chỉ lấy 10 tin mới nhất
    for (const item of feed.items.slice(0, 10)) {
      try {
        // Check if post already exists by link
        if (item.link) {
          const existingPost = await postModel.findByLink(item.link)
          if (existingPost) {
            console.log(`⏭️ [${source.name}] Bỏ qua tin đã tồn tại: ${item.title?.substring(0, 40)}...`)
            continue // Skip if exists
          }
        }

        // Extract data
        const title = item.title ? item.title.trim() : 'Untitled'
        const summary = cleanSummary(item.contentSnippet || item.content || item.summary || '')
        const image = extractImage(item)
        const link = item.link || ''
        const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now()

        // Create post
        await postModel.createNew({
          title,
          summary,
          content: summary, // Use summary as content for now
          link,
          image,
          source: source.name,
          category: source.category,
          status: 'published',
          author: source.name,
          tags: ['bóng đá', 'thể thao'],
          publishedAt,
          viewCount: 0
        })

        newPostsCount++
        console.log(`✅ [${source.name}] Đã thêm: ${title.substring(0, 50)}...`)
      } catch (itemError) {
        console.error(`❌ [${source.name}] Lỗi item: ${itemError.message}`)
      }
    }

    console.log(`✅ [${source.name}] Hoàn thành: ${newPostsCount} tin mới`)
    return newPostsCount
  } catch (error) {
    console.error(`❌ [${source.name}] Lỗi crawl:`, error.message)
    return 0
  }
}

// 🗑️ Xóa tin cũ hơn 7 ngày
const deleteOldPosts = async () => {
  try {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
    const result = await postModel.deleteOldPosts(sevenDaysAgo)
    console.log(`🗑️ Đã xóa ${result} tin cũ hơn 7 ngày`)
    return result
  } catch (error) {
    console.error('❌ [deleteOldPosts] Lỗi:', error.message)
    return 0
  }
}

// 🚀 Chạy tất cả crawlers
export const crawlAllSources = async () => {
  try {
    console.log('\n🎯 ===== BẮT ĐẦU AUTO CRAWL TIN BÓNG ĐÁ =====')
    console.log(`⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}`)

    // Xóa tin cũ trước khi crawl
    await deleteOldPosts()

    let totalNewPosts = 0

    for (const source of RSS_SOURCES) {
      const count = await crawlFromSource(source)
      totalNewPosts += count
    }

    console.log(`\n🎉 ===== HOÀN THÀNH =====`)
    console.log(`📊 Tổng số tin mới: ${totalNewPosts}`)
    console.log(`⏰ Kết thúc: ${new Date().toLocaleString('vi-VN')}\n`)

    return totalNewPosts
  } catch (error) {
    console.error('❌ [crawlAllSources] Lỗi tổng:', error)
    return 0
  }
}

// 📅 Cron job: Chạy mỗi 6 giờ
export const startAutoCrawler = () => {
  console.log('🤖 Auto Crawler đã được kích hoạt!')
  console.log('⏰ Lịch chạy: Mỗi 6 giờ một lần (0h, 6h, 12h, 18h)')
  console.log('🗑️ Tự động xóa tin cũ hơn 7 ngày mỗi khi crawl')

  // Chạy ngay lập tức khi khởi động
  crawlAllSources()

  // Schedule: chạy mỗi 6 giờ (0h, 6h, 12h, 18h)
  cron.schedule('0 */6 * * *', () => {
    crawlAllSources()
  })
}

// 🔧 Manual trigger (dùng cho testing)
export const manualCrawl = async () => {
  console.log('🔧 Kích hoạt manual crawl...')
  return await crawlAllSources()
}
