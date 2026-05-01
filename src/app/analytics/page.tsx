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

  const statCards = [
    { label: 'Total Emails', value: total, color: 'var(--text)' },
    { label: 'Delivered', value: sent, color: 'var(--accent)' },
    { label: 'Failed', value: failed, color: failed > 0 ? 'var(--danger)' : 'var(--muted)' },
    { label: 'Success Rate', value: `${rate}%`, color: 'var(--accent)' },
  ]

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '28px 20px', overflow: 'auto', minWidth: 0 }}>
          <div className="animate-in">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>Analytics</h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>Your outreach performance at a glance</p>

            {/* Stat Cards — 2x2 grid always */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {statCards.map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: '26px', fontWeight: '700', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Campaign Performance — stacked cards, no table */}
            <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>Campaign Performance</h3>
              {campaigns.filter(c => c.status === 'sent').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>No sent campaigns yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {campaigns.filter(c => c.status === 'sent').map(c => {
                    const t = c.sent_count + c.failed_count
                    const r = t > 0 ? ((c.sent_count / t) * 100).toFixed(0) : '—'
                    return (
                      <div key={c.id} style={{
                        padding: '14px', background: 'var(--card2)',
                        border: '1px solid var(--border)', borderRadius: '10px',
                        display: 'flex', flexDirection: 'column', gap: '8px',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '13.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{c.name}</span>
                          <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '700', flexShrink: 0 }}>{r}%</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--accent)' }}>✓ {c.sent_count} sent</span>
                          {c.failed_count > 0 && <span style={{ color: 'var(--danger)' }}>✗ {c.failed_count} failed</span>}
                          <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>
                            {new Date(c.sent_at || c.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Email Log — stacked cards, no table */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>Recent Email Log</h3>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>No emails sent yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {logs.slice(0, 50).map(l => (
                    <div key={l.id} style={{
                      padding: '12px 14px', background: 'var(--card2)',
                      border: '1px solid var(--border)', borderRadius: '9px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
                      flexWrap: 'wrap',
                    }}>
                      <span style={{
                        fontSize: '12.5px', color: 'var(--muted)', fontFamily: 'DM Mono, monospace',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        flex: 1, minWidth: 0,
                      }}>{l.contact_email}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {l.error && (
                          <span style={{ fontSize: '11px', color: 'var(--danger)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {l.error}
                          </span>
                        )}
                        <span className={`badge ${l.status === 'sent' ? 'badge-green' : 'badge-red'}`}>{l.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}