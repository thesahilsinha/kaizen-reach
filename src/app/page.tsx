'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      if (pin === '270803') {
        localStorage.setItem('kr_auth', '270803')
        router.push('/dashboard')
      } else {
        setError('Invalid access code')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(34,197,94,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="card animate-in" style={{ width: '100%', maxWidth: '380px', padding: '40px', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '36px', height: '36px', background: '#0d2318', border: '1px solid #1a2e24',
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#22c55e', fontSize: '18px', fontWeight: '700' }}>K</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#e5e7eb' }}>
              Kaizen <span style={{ color: '#22c55e' }}>Reach</span>
            </h1>
          </div>
          <p style={{ color: '#6b7280', fontSize: '13px' }}>Outreach that improves, every send.</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Access Code</label>
          <input
            type="password"
            placeholder="••••••"
            value={pin}
            onChange={e => { setPin(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            maxLength={6}
            style={{ letterSpacing: '0.3em', fontSize: '18px', textAlign: 'center' }}
            autoFocus
          />
          {error && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '12px' }}>
          {loading ? 'Verifying...' : 'Enter Dashboard'}
        </button>
      </div>
    </div>
  )
}