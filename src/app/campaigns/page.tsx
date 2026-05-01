'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Send, Clock, CheckCircle, XCircle, Play, Users, Filter } from 'lucide-react'
import type { Campaign, Template } from '@/types'

const CATEGORIES = ['all', 'general', 'lead', 'client', 'partner', 'investor', 'vendor', 'cold', 'warm', 'hot', 'vip']

const EMAIL_STYLES = [
  { id: 'plain', label: 'Plain Text', desc: 'Personal feel' },
  { id: 'minimal', label: 'Minimal', desc: 'Clean layout' },
  { id: 'branded', label: 'Branded', desc: 'Kaizen ASC look' },
  { id: 'newsletter', label: 'Newsletter', desc: 'Structured' },
  { id: 'executive', label: 'Executive', desc: 'Premium serif' },
]

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState<string | null>(null)
  const [contactCounts, setContactCounts] = useState<Record<string, number>>({})
  const [form, setForm] = useState({
    name: '', subject: '', body: '', template_id: '',
    cta_text: '', cta_url: '', style: 'plain', target_category: 'all',
  })

  const load = async () => {
    const [{ data: c }, { data: t }, { data: contacts }] = await Promise.all([
      supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('templates').select('*'),
      supabase.from('contacts').select('category').eq('status', 'active'),
    ])
    setCampaigns(c || [])
    setTemplates(t || [])

    const counts: Record<string, number> = { all: contacts?.length || 0 }
    contacts?.forEach((c: any) => {
      counts[c.category || 'general'] = (counts[c.category || 'general'] || 0) + 1
    })
    setContactCounts(counts)
  }

  useEffect(() => { load() }, [])

  const applyTemplate = (id: string) => {
    const t = templates.find(t => t.id === id) as any
    if (t) setForm(f => ({ ...f, subject: t.subject, body: t.body, cta_text: t.cta_text || '', cta_url: t.cta_url || '', style: t.style || 'plain', template_id: id }))
  }

  const createCampaign = async () => {
    if (!form.name || !form.subject || !form.body) return toast.error('Fill all required fields')
    const { error } = await supabase.from('campaigns').insert({
      name: form.name, subject: form.subject, body: form.body,
      cta_text: form.cta_text, cta_url: form.cta_url,
      style: form.style, target_category: form.target_category,
    })
    if (error) return toast.error(error.message)
    toast.success('Campaign saved as draft!')
    setForm({ name: '', subject: '', body: '', template_id: '', cta_text: '', cta_url: '', style: 'plain', target_category: 'all' })
    setShowForm(false); load()
  }

  const sendCampaign = async (campaign: any) => {
    setSending(campaign.id)
    const toastId = toast.loading('Sending...')
    try {
      // Get contacts by target category
      let contactIds: string[] | undefined
      if (campaign.target_category && campaign.target_category !== 'all') {
        const { data } = await supabase.from('contacts').select('id').eq('status', 'active').eq('category', campaign.target_category)
        contactIds = data?.map((c: any) => c.id)
      }

      const res = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, contactIds }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`✓ ${data.sent} sent${data.failed > 0 ? ` · ${data.failed} failed` : ''}`, { id: toastId })
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
    setSending(null); load()
  }

  const statusBadge = (status: string) => {
    if (status === 'sent') return <span className="badge badge-green"><CheckCircle size={10} />Sent</span>
    if (status === 'failed') return <span className="badge badge-red"><XCircle size={10} />Failed</span>
    if (status === 'sending') return <span className="badge badge-yellow"><Clock size={10} />Sending</span>
    return <span className="badge badge-gray">Draft</span>
  }

  const targetLabel = (cat: string) => cat === 'all' ? `All Contacts (${contactCounts['all'] || 0})` : `${cat} (${contactCounts[cat] || 0})`

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="page-main" style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>Campaigns</h2>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Send to all or targeted contact categories</p>
              </div>
              <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={13} />New Campaign</button>
            </div>

            {showForm && (
              <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: 'var(--accent)' }}>Create Campaign</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Style Picker */}
                  <div>
                    <label>Email Style</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {EMAIL_STYLES.map(s => (
                        <div
                          key={s.id}
                          className={`style-card ${form.style === s.id ? 'selected' : ''}`}
                          onClick={() => setForm(f => ({ ...f, style: s.id }))}
                          style={{ padding: '10px 16px', minWidth: '100px' }}
                        >
                          <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text)' }}>{s.label}</div>
                          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div><label>Campaign Name *</label><input placeholder="August Cold Outreach" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div>
                      <label>Use Template (optional)</label>
                      <select value={form.template_id} onChange={e => applyTemplate(e.target.value)}>
                        <option value="">— Select Template —</option>
                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label>Target Audience</label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {CATEGORIES.filter(c => contactCounts[c] !== undefined || c === 'all').map(cat => (
                        <button
                          key={cat}
                          onClick={() => setForm(f => ({ ...f, target_category: cat }))}
                          className={`badge ${form.target_category === cat ? 'badge-green' : 'badge-gray'}`}
                          style={{ cursor: 'pointer', border: 'none', padding: '6px 14px', fontSize: '12px', textTransform: 'capitalize' }}
                        >
                          <Users size={10} />{cat === 'all' ? 'All' : cat} ({contactCounts[cat] || 0})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div><label>Subject Line *</label><input placeholder="Quick thought on {{name}} & what we do at Kaizen ASC" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>

                  <div>
                    <label>Email Body *</label>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                      Variables: <code style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4 }}>{'{{name}}'}</code>{' '}
                      <code style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4 }}>{'{{company}}'}</code>
                    </div>
                    <textarea rows={10} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder={"Hi {{name}},\n\n...\n\nBest,\nSahil Sinha\nKaizen ASC"} />
                  </div>

                  <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>Call to Action (optional)</div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><label>Button Text</label><input placeholder="Book a Call" value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} /></div>
                      <div><label>Button URL</label><input placeholder="https://kaizenasc.com/contact" value={form.cta_url} onChange={e => setForm({ ...form, cta_url: e.target.value })} /></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={createCampaign}>Save as Draft</button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {campaigns.map(c => (
                <div key={c.id} className="card campaign-row" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>{c.name}</span>
                      {statusBadge(c.status)}
                      {(c as any).style && <span className="badge badge-gray" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{(c as any).style}</span>}
                      {(c as any).target_category && (c as any).target_category !== 'all' && (
                        <span className="badge badge-blue" style={{ fontSize: '11px', textTransform: 'capitalize' }}><Filter size={9} />{(c as any).target_category}</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '6px' }}>{c.subject}</div>
                    <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
                      <span style={{ color: 'var(--accent)' }}>✓ {c.sent_count} sent</span>
                      {c.failed_count > 0 && <span style={{ color: 'var(--danger)' }}>✗ {c.failed_count} failed</span>}
                      <span style={{ color: 'var(--muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {c.status === 'draft' && (
                    <button className="btn-primary" onClick={() => sendCampaign(c)} disabled={sending === c.id}>
                      {sending === c.id ? <Clock size={13} /> : <Play size={13} />}
                      {sending === c.id ? 'Sending...' : `Send to ${targetLabel((c as any).target_category || 'all')}`}
                    </button>
                  )}
                </div>
              ))}
              {campaigns.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '14px' }}>
                  No campaigns yet. Create your first one above.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}