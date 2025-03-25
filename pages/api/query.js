import { sql } from '@vercel/postgres'

export default async function handler(req, res) {
  // 检查请求方法
  if (!['GET', 'POST'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { key } = req.query
  if (!key) {
    return res.status(400).json({ error: '缺少KEY参数' })
  }

  try {
    // GET请求 - 查询基本信息
    if (req.method === 'GET') {
      const result = await sql`
        SELECT * FROM tracking_keys 
        WHERE key = ${key} 
        AND expires_at > NOW()
      `
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'KEY无效或已过期' })
      }

      // 同时查询位置记录
      const locations = await sql`
        SELECT latitude, longitude, created_at
        FROM locations
        WHERE key = ${key}
        ORDER BY created_at DESC
        LIMIT 7
      `

      return res.status(200).json({ 
        targetUrl: result.rows[0].target_url,
        createdAt: result.rows[0].created_at,
        expiresAt: result.rows[0].expires_at,
        locations: locations.rows
      })
    }

    // POST请求 - 存储位置数据
    if (req.method === 'POST') {
      const { latitude, longitude } = req.body
      
      if (!latitude || !longitude) {
        return res.status(400).json({ error: '缺少位置参数' })
      }

      // 1. 验证KEY有效性
      const keyCheck = await sql`
        SELECT 1 FROM tracking_keys 
        WHERE key = ${key} AND expires_at > NOW()
      `
      if (keyCheck.rows.length === 0) {
        return res.status(404).json({ error: 'KEY无效或已过期' })
      }

      // 2. 存储位置数据
      await sql`
        INSERT INTO locations (key, latitude, longitude)
        VALUES (${key}, ${latitude}, ${longitude})
      `

      // 3. 清理旧记录(保持最多7条)
      await sql`
        DELETE FROM locations
        WHERE ctid NOT IN (
          SELECT ctid FROM locations
          WHERE key = ${key}
          ORDER BY created_at DESC
          LIMIT 7
        )
        AND key = ${key}
      `

      return res.status(200).json({ success: true })
    }

  } catch (error) {
    console.error('处理请求失败:', error)
    return res.status(500).json({ error: '服务器错误' })
  }
}
