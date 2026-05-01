'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('kr_auth')
    if (auth === '270803') setOk(true)
    else router.push('/')
  }, [router])

  if (!ok) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
      <div style={{ color: '#22c55e', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return <>{children}</>
}