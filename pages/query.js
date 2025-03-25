import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function QueryPage() {
  const [key, setKey] = useState('')
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 获取用户位置
  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理位置功能'))
      } else {
        navigator.geolocation.getCurrentPosition(
          position => resolve(position.coords),
          err => reject(err)
        )
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // 1. 获取位置
      const coords = await getLocation()
      
      // 2. 提交到API
      const response = await fetch(`/api/query?key=${key}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // 3. 更新显示最近7条记录
        setLocations(prev => [
          {
            lat: coords.latitude,
            lng: coords.longitude,
            timestamp: new Date().toLocaleString()
          },
          ...prev
        ].slice(0, 7))
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Head>
        <title>位置追踪工具</title>
      </Head>

      <main className="container mx-auto px-4 py-16 max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-blue-600 mb-8">
            位置追踪工具
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="输入追踪KEY"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-lg font-medium text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors`}
            >
              {loading ? '提交中...' : '提交位置'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {locations.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">位置记录(最近7条)</h3>
              <div className="space-y-2">
                {locations.map((loc, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg">
                    <p>经度: {loc.lng}</p>
                    <p>纬度: {loc.lat}</p>
                    <p>时间: {loc.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
