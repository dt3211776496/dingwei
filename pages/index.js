import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <h1>位置追踪服务</h1>
      <p>生成临时链接追踪位置，3天后自动失效</p>
      
      <div className="actions">
        <Link href="/generate" className="btn">
          生成追踪链接
        </Link>
        <Link href="/query" className="btn">
          查询位置
        </Link>
      </div>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
        }
        .btn {
          display: inline-block;
          margin: 1rem;
          padding: 0.5rem 1rem;
          background: #0070f3;
          color: white;
          border-radius: 4px;
          text-decoration: none;
        }
      `}</style>
    </div>
  )
}
