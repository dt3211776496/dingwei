import { sql } from '@vercel/postgres'
import { v4 as uuidv4 } from 'uuid'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 生成随机KEY和过期时间(3天后)
    const key = uuidv4().substring(0, 8)
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    
    // 存储到数据库
    await sql`
      INSERT INTO tracking_keys (key, expires_at, target_url)
      VALUES (${key}, ${expiresAt}, ${req.body.targetUrl})
    `
    
    // 返回生成的链接
    const trackingUrl = `${process.env.NEXTAUTH_URL}/query?key=${key}`
    res.status(200).json({ key, trackingUrl })
    
  } catch (error) {
    console.error('生成KEY失败:', error)
    res.status(500).json({ error: '生成KEY失败' })
  }
}
