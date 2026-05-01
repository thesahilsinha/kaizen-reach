'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { Users, Send, BarChart2, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react'

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
    { label: 'Total Contacts', value: stats.contacts, icon: Users, color: '#22c55e', change: '+12%' },
    { label: 'Campaigns', value: stats.campaigns, icon: Send, color: '#22c55e', change: '+5%' },
    { label: 'Emails Sent', value: stats.sent, icon: TrendingUp, color: '#22c55e', change: '+18%' },
    { label: 'Failed', value: stats.failed, icon: TrendingDown, color: '#ef4444', change: '-2%' },
  ]

  const statusBadge = (status: string) => {
    if (status === 'sent') return <span className="badge badge-green"><CheckCircle size={10} style={{ marginRight: 4 }} />Sent</span>
    if (status === 'failed') return <span className="badge badge-red"><XCircle size={10} style={{ marginRight: 4 }} />Failed</span>
    if (status === 'draft') return <span className="badge badge-gray">Draft</span>
    return <span className="badge badge-yellow"><Clock size={10} style={{ marginRight: 4 }} />Sending</span>
  }

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <div className="animate-in">
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#e5e7eb', marginBottom: '4px' }}>
              Welcome back 👋
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '28px' }}>
              Here's what's happening with your outreach today.
            </p>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              {statCards.map(({ label, value, icon: Icon, color, change }) => (
                <div key={label} className="stat-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '36px', height: '36px', background: '#0d2318', border: '1px solid #1e3a2f',
                      borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span style={{ fontSize: '12px', color, fontWeight: '600' }}>{change}</span>
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: '#e5e7eb' }}>{value.toLocaleString()}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Campaigns */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#e5e7eb' }}>Recent Campaigns</h3>
              {recentCampaigns.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#4b5563', fontSize: '14px' }}>
                  No campaigns yet. <a href="/campaigns" style={{ color: '#22c55e', textDecoration: 'none' }}>Create your first →</a>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1a2e24' }}>
                      {['Campaign', 'Subject', 'Sent', 'Failed', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#6b7280', fontWeight: '500', fontSize: '12px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentCampaigns.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #111' }}>
                        <td style={{ padding: '12px', color: '#e5e7eb', fontWeight: '500' }}>{c.name}</td>
                        <td style={{ padding: '12px', color: '#9ca3af' }}>{c.subject}</td>
                        <td style={{ padding: '12px', color: '#22c55e' }}>{c.sent_count}</td>
                        <td style={{ padding: '12px', color: '#ef4444' }}>{c.failed_count}</td>
                        <td style={{ padding: '12px' }}>{statusBadge(c.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}