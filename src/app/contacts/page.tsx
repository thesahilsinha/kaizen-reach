'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Upload, Search, Filter, Tag, CheckSquare, Square, Send } from 'lucide-react'
import type { Contact } from '@/types'

const CATEGORIES = ['general', 'lead', 'client', 'partner', 'investor', 'vendor', 'cold', 'warm', 'hot', 'vip']
const CATEGORY_COLORS: Record<string, string> = {
  general: 'badge-gray', lead: 'badge-blue', client: 'badge-green',
  partner: 'badge-yellow', investor: 'badge-green', vendor: 'badge-gray',
  cold: 'badge-blue', warm: 'badge-yellow', hot: 'badge-red', vip: 'badge-green',
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showAdd, setShowAdd] = useState(false)
  const [showBulk, setShowBulk] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [form, setForm] = useState({ email: '', name: '', company: '', tags: '', category: 'general' })
  const [bulkText, setBulkText] = useState('')
  const [bulkCat, setBulkCat] = useState('general')
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [sendCampaignId, setSendCampaignId] = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('contacts').select('*').order('created_at', { ascending: false })
    setContacts(data || [])
  }

  useEffect(() => {
    load()
    supabase.from('campaigns').select('id, name, subject').eq('status', 'draft').then(({ data }) => setCampaigns(data || []))
  }, [])

  const addContact = async () => {
    if (!form.email) return toast.error('Email required')
    const { error } = await supabase.from('contacts').insert({
      email: form.email.trim(), name: form.name, company: form.company,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      category: form.category,
    })
    if (error) return toast.error(error.message)
    toast.success('Contact added!')
    setForm({ email: '', name: '', company: '', tags: '', category: 'general' })
    setShowAdd(false)
    load()
  }

  const bulkImport = async () => {
    const lines = bulkText.trim().split('\n').filter(Boolean)
    const rows = lines.map(line => {
      const [email, name, company] = line.split(',')
      return { email: email?.trim(), name: name?.trim(), company: company?.trim(), category: bulkCat }
    }).filter(r => r.email)
    const { error } = await supabase.from('contacts').upsert(rows, { onConflict: 'email' })
    if (error) return toast.error(error.message)
    toast.success(`${rows.length} contacts imported!`)
    setBulkText(''); setShowBulk(false); load()
  }

  const deleteContact = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id)
    setSelected(s => { const n = new Set(s); n.delete(id); return n })
    toast.success('Deleted')
    load()
  }

  const deleteSelected = async () => {
    if (!selected.size) return
    await supabase.from('contacts').delete().in('id', [...selected])
    toast.success(`${selected.size} contacts deleted`)
    setSelected(new Set())
    load()
  }

  const toggleSelect = (id: string) => {
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(c => c.id)))
  }

  const sendToSelected = async () => {
    if (!sendCampaignId) return toast.error('Select a campaign')
    if (!selected.size) return toast.error('Select contacts first')
    setSending(true)
    const toastId = toast.loading(`Sending to ${selected.size} contacts...`)
    try {
      const res = await fetch('/api/send-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: sendCampaignId, contactIds: [...selected] }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      toast.success(`Sent to ${data.sent}! ${data.failed > 0 ? `(${data.failed} failed)` : ''}`, { id: toastId })
      setShowSendModal(false); setSelected(new Set())
    } catch (e: any) {
      toast.error(e.message, { id: toastId })
    }
    setSending(false)
  }

  const filtered = contacts.filter(c => {
    const matchSearch = c.email.includes(search) || (c.name?.toLowerCase().includes(search.toLowerCase()))
    const matchCat = filterCat === 'all' || c.category === filterCat
    return matchSearch && matchCat
  })

  const categoryCounts = contacts.reduce((acc, c) => {
    acc[c.category || 'general'] = (acc[c.category || 'general'] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="page-main" style={{ flex: 1, padding: '32px', overflow: 'auto', paddingTop: '32px' }}>
          <div className="animate-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>Contacts</h2>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>{contacts.length} total · {selected.size > 0 ? `${selected.size} selected` : 'none selected'}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selected.size > 0 && (
                  <>
                    <button className="btn-primary" onClick={() => setShowSendModal(true)}><Send size={13} />Send Campaign</button>
                    <button className="btn-danger" onClick={deleteSelected}><Trash2 size={13} />Delete ({selected.size})</button>
                  </>
                )}
                <button className="btn-ghost" onClick={() => setShowBulk(!showBulk)}><Upload size={13} />Bulk Import</button>
                <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}><Plus size={13} />Add</button>
              </div>
            </div>

            {/* Category filter pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <button
                onClick={() => setFilterCat('all')}
                className={`badge ${filterCat === 'all' ? 'badge-green' : 'badge-gray'}`}
                style={{ cursor: 'pointer', border: 'none', padding: '5px 14px', fontSize: '12px' }}
              >All ({contacts.length})</button>
              {CATEGORIES.filter(c => categoryCounts[c]).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat === filterCat ? 'all' : cat)}
                  className={`badge ${filterCat === cat ? 'badge-green' : CATEGORY_COLORS[cat]}`}
                  style={{ cursor: 'pointer', border: 'none', padding: '5px 14px', fontSize: '12px', textTransform: 'capitalize' }}
                >{cat} ({categoryCounts[cat]})</button>
              ))}
            </div>

            {/* Send to selected modal */}
            {showSendModal && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                <div className="card" style={{ padding: '28px', width: '100%', maxWidth: '420px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '6px' }}>Send Campaign to {selected.size} Contacts</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>Select which campaign to send to these selected contacts.</p>
                  <div style={{ marginBottom: '16px' }}>
                    <label>Campaign (Draft)</label>
                    <select value={sendCampaignId} onChange={e => setSendCampaignId(e.target.value)}>
                      <option value="">— Select Campaign —</option>
                      {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-primary" onClick={sendToSelected} disabled={sending}>{sending ? 'Sending...' : 'Send Now'}</button>
                    <button className="btn-ghost" onClick={() => setShowSendModal(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Form */}
            {showAdd && (
              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '14px', color: 'var(--accent)' }}>New Contact</h3>
                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><label>Email *</label><input placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                  <div><label>Name</label><input placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div><label>Company</label><input placeholder="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
                  <div>
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map(c => <option key={c} value={c} style={{ textTransform: 'capitalize' }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}><label>Tags (comma separated)</label><input placeholder="design, startup, b2b" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" onClick={addContact}>Save</button>
                  <button className="btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Bulk Import */}
            {showBulk && (
              <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '6px', color: 'var(--accent)' }}>Bulk Import</h3>
                <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '12px' }}>One per line: <code style={{ color: 'var(--accent)', background: 'var(--accent-glow)', padding: '1px 6px', borderRadius: 4 }}>email, name, company</code></p>
                <div style={{ marginBottom: '12px' }}>
                  <label>Category for all imported</label>
                  <select value={bulkCat} onChange={e => setBulkCat(e.target.value)} style={{ maxWidth: '200px' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <textarea rows={6} placeholder={"john@acme.com, John Doe, Acme Inc\njane@corp.com, Jane Smith"} value={bulkText} onChange={e => setBulkText(e.target.value)} />
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" onClick={bulkImport}>Import All</button>
                  <button className="btn-ghost" onClick={() => setShowBulk(false)}>Cancel</button>
                </div>
              </div>
            )}

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={13} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input placeholder="Search by email or name..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '36px' }} />
            </div>

            {/* Table */}
            <div className="card table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', width: '36px' }}>
                      <input type="checkbox" className="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
                    </th>
                    {['Email', 'Name', 'Company', 'Category', 'Tags', ''].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 10px', color: 'var(--muted)', fontWeight: '500', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', background: selected.has(c.id) ? 'var(--accent-glow)' : 'transparent' }}>
                      <td style={{ padding: '10px 16px' }}>
                        <input type="checkbox" className="checkbox" checked={selected.has(c.id)} onChange={() => toggleSelect(c.id)} />
                      </td>
                      <td style={{ padding: '10px', color: 'var(--accent)', fontFamily: 'DM Mono, monospace', fontSize: '12.5px' }}>{c.email}</td>
                      <td style={{ padding: '10px', color: 'var(--text)' }}>{c.name || '—'}</td>
                      <td style={{ padding: '10px', color: 'var(--muted)' }}>{c.company || '—'}</td>
                      <td style={{ padding: '10px' }}>
                        <span className={`badge ${CATEGORY_COLORS[c.category || 'general']}`} style={{ textTransform: 'capitalize' }}>{c.category || 'general'}</span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {c.tags?.map(t => <span key={t} className="tag-pill">{t}</span>)}
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button onClick={() => deleteContact(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--muted)', fontSize: '13px' }}>
                  No contacts found.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}