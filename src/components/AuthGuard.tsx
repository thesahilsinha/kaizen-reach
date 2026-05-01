'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ok, setOk] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('kr_auth')
    if (auth === '270803') setOk(true)
    else router.push('/')

    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [router])

  if (!ok) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ color: 'var(--accent)', fontSize: '14px' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ paddingTop: isMobile ? '56px' : '0' }}>
      {children}
    </div>
  )
}