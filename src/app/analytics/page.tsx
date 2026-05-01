'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [{ data: l }, { data: c }] = await Promise.all([
        supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(200),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      ])
      setLogs(l || [])
      setCampaigns(c || [])
    }
    load()
  }, [])

  const total = logs.length
  const sent = logs.filter(l => l.status === 'sent').length
  const failed = logs.filter(l => l.status === 'failed').length
  const rate = total > 0 ? ((sent / total) * 100).toFixed(1) : '0'

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <div className="animate-in">
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#e5e7eb', marginBottom: '4px' }}>Analytics</h2>
            <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '28px' }}>Your outreach performance at a glance</p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Emails', value: total, color: '#e5e7eb' },
                { label: 'Delivered', value: sent, color: '#22c55e' },
                { label: 'Failed', value: failed, color: '#ef4444' },
                { label: 'Success Rate', value: `${rate}%`, color: '#22c55e' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: '28px', fontWeight: '700', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Campaign Breakdown */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Campaign Performance</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2e24' }}>
                    {['Campaign', 'Sent', 'Failed', 'Rate', 'Date'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: '500', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {campaigns.filter(c => c.status === 'sent').map(c => {
                    const total = c.sent_count + c.failed_count
                    const r = total > 0 ? ((c.sent_count / total) * 100).toFixed(0) : '—'
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '12px', color: '#e5e7eb', fontWeight: '500' }}>{c.name}</td>
                        <td style={{ padding: '12px', color: '#22c55e' }}>{c.sent_count}</td>
                        <td style={{ padding: '12px', color: c.failed_count > 0 ? '#ef4444' : '#6b7280' }}>{c.failed_count}</td>
                        <td style={{ padding: '12px', color: '#e5e7eb' }}>{r}%</td>
                        <td style={{ padding: '12px', color: '#6b7280' }}>{new Date(c.sent_at || c.created_at).toLocaleDateString()}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {campaigns.filter(c => c.status === 'sent').length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '14px' }}>No sent campaigns yet.</div>
              )}
            </div>

            {/* Recent Logs */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Recent Email Log</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2e24' }}>
                    {['Email', 'Status', 'Error', 'Sent At'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: '500', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 50).map(l => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '10px 12px', color: '#9ca3af' }}>{l.contact_email}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge ${l.status === 'sent' ? 'badge-green' : 'badge-red'}`}>{l.status}</span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#ef4444', fontSize: '12px' }}>{l.error || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#6b7280' }}>{new Date(l.sent_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}