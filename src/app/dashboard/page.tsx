'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { Users, Send, TrendingUp, TrendingDown, CheckCircle, XCircle, Clock } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ contacts: 0, campaigns: 0, sent: 0, failed: 0 })
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      const [{ count: contacts }, { count: campaigns }, { data: logs }, { data: recent }] = await Promise.all([
        supabase.from('contacts').select('*', { count: 'exact', head: true }),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }),
        supabase.from('email_logs').select('status'),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }).limit(5),
      ])
      const sent = logs?.filter(l => l.status === 'sent').length || 0
      const failed = logs?.filter(l => l.status === 'failed').length || 0
      setStats({ contacts: contacts || 0, campaigns: campaigns || 0, sent, failed })
      setRecentCampaigns(recent || [])
    }
    load()
  }, [])

  const statCards = [
    { label: 'Total Contacts', value: stats.contacts, icon: Users, color: 'var(--accent)', change: '+12%' },
    { label: 'Campaigns', value: stats.campaigns, icon: Send, color: 'var(--accent)', change: '+5%' },
    { label: 'Emails Sent', value: stats.sent, icon: TrendingUp, color: 'var(--accent)', change: '+18%' },
    { label: 'Failed', value: stats.failed, icon: TrendingDown, color: 'var(--danger)', change: '-2%' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'sent') return <span className="badge badge-green"><CheckCircle size={9} />Sent</span>
    if (status === 'failed') return <span className="badge badge-red"><XCircle size={9} />Failed</span>
    if (status === 'sending') return <span className="badge badge-yellow"><Clock size={9} />Sending</span>
    return <span className="badge badge-gray">Draft</span>
  }

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{
          flex: 1,
          padding: '28px 20px',
          overflow: 'auto',
          minWidth: 0, // critical: prevents flex child from overflowing
        }}>
          <div className="animate-in">
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)', marginBottom: '4px' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '24px' }}>
              Here's what's happening with your outreach today.
            </p>

            {/* Stat Cards — 2x2 on mobile, 4x1 on desktop */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}>
              {statCards.map(({ label, value, icon: Icon, color, change }) => (
                <div key={label} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '32px', height: '32px', background: 'var(--accent-glow)',
                      border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={15} color={color} />
                    </div>
                    <span style={{ fontSize: '11px', color, fontWeight: '600' }}>{change}</span>
                  </div>
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text)', lineHeight: 1 }}>{value.toLocaleString()}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Campaigns */}
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px', color: 'var(--text)' }}>
                Recent Campaigns
              </h3>

              {recentCampaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--muted)', fontSize: '13px' }}>
                  No campaigns yet.{' '}
                  <a href="/campaigns" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create your first →</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentCampaigns.map(c => (
                    <div key={c.id} style={{
                      padding: '14px',
                      background: 'var(--card2)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}>
                      {/* Row 1: name + status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{
                          fontWeight: '600', color: 'var(--text)', fontSize: '13.5px',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                        }}>{c.name}</span>
                        {statusBadge(c.status)}
                      </div>

                      {/* Row 2: subject */}
                      <div style={{
                        fontSize: '12px', color: 'var(--muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {c.subject}
                      </div>

                      {/* Row 3: sent/failed/date */}
                      <div style={{ display: 'flex', gap: '14px', fontSize: '12px', flexWrap: 'wrap' }}>
                        <span style={{ color: 'var(--accent)' }}>✓ {c.sent_count} sent</span>
                        {c.failed_count > 0 && <span style={{ color: 'var(--danger)' }}>✗ {c.failed_count} failed</span>}
                        <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
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