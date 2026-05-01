'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Pin, BookOpen, Info, Mail, Tag } from 'lucide-react'

const NOTE_COLORS = [
  { id: '#0d2318', label: 'Green' },
  { id: '#0a1f2d', label: 'Blue' },
  { id: '#2d200a', label: 'Amber' },
  { id: '#1a1a1a', label: 'Gray' },
  { id: '#2d1212', label: 'Red' },
]

const PLACEHOLDERS = [
  { var: '{{name}}', desc: 'Contact\'s full name', example: 'John Doe' },
  { var: '{{email}}', desc: 'Contact\'s email address', example: 'john@acme.com' },
  { var: '{{company}}', desc: 'Contact\'s company name', example: 'Acme Inc.' },
]

const EMAIL_STYLES_INFO = [
  { id: 'plain', label: 'Plain Text', desc: 'No styling. Looks like a personal email. Best for cold outreach.' },
  { id: 'minimal', label: 'Minimal', desc: 'Subtle Kaizen ASC header. Clean and professional.' },
  { id: 'branded', label: 'Branded', desc: 'Full Kaizen ASC branding with dark header. Great for formal pitches.' },
  { id: 'newsletter', label: 'Newsletter', desc: 'Structured layout with sections. Use for updates and announcements.' },
  { id: 'executive', label: 'Executive', desc: 'Dark header, serif font. Premium and authoritative.' },
]

export default function InfoPage() {
  const [notes, setNotes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', color: '#0d2318', pinned: false })
  const [tab, setTab] = useState<'notes' | 'guide' | 'placeholders'>('notes')

  const load = async () => {
    const { data } = await supabase.from('notes').select('*').order('pinned', { ascending: false }).order('created_at', { ascending: false })
    setNotes(data || [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required')
    await supabase.from('notes').insert(form)
    toast.success('Note saved!')
    setForm({ title: '', content: '', color: '#0d2318', pinned: false })
    setShowForm(false); load()
  }

  const del = async (id: string) => {
    await supabase.from('notes').delete().eq('id', id)
    toast.success('Deleted'); load()
  }

  const togglePin = async (note: any) => {
    await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id)
    load()
  }

  const TABS = [
    { id: 'notes', label: 'My Notes', icon: BookOpen },
    { id: 'placeholders', label: 'Placeholders', icon: Tag },
    { id: 'guide', label: 'App Guide', icon: Info },
  ]

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="page-main" style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>Info & Notes</h2>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Your workspace guide and scratch pad</p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'var(--card)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id as any)}
                  style={{
                    padding: '8px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: tab === id ? 'var(--accent-glow)' : 'transparent',
                    color: tab === id ? 'var(--accent)' : 'var(--muted)',
                    fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                ><Icon size={13} />{label}</button>
              ))}
            </div>

            {/* NOTES TAB */}
            {tab === 'notes' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <button className="btn-primary" onClick={() => setShowForm(!showForm)}><Plus size={13} />New Note</button>
                </div>

                {showForm && (
                  <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div><label>Title</label><input placeholder="Note title..." value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                      <div><label>Content</label><textarea rows={5} placeholder="Write your note here..." value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
                      <div>
                        <label>Color</label>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          {NOTE_COLORS.map(c => (
                            <div
                              key={c.id}
                              onClick={() => setForm(f => ({ ...f, color: c.id }))}
                              style={{
                                width: '28px', height: '28px', borderRadius: '6px', background: c.id, cursor: 'pointer',
                                border: form.color === c.id ? '2px solid var(--accent)' : '2px solid transparent',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="checkbox" className="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} style={{ width: 'auto' }} />
                        <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Pin to top</span>
                      </div>
                    </div>
                    <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                      <button className="btn-primary" onClick={save}>Save Note</button>
                      <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {notes.map(n => (
                    <div key={n.id} style={{ background: n.color, border: '1px solid var(--border)', borderRadius: '12px', padding: '18px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px' }}>{n.title}</div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button onClick={() => togglePin(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: n.pinned ? 'var(--accent)' : 'var(--muted)', padding: '3px' }}><Pin size={13} /></button>
                          <button onClick={() => del(n.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '3px' }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{n.content}</p>
                      {n.pinned && <div style={{ position: 'absolute', top: 12, right: 40 }}><span className="badge badge-green" style={{ fontSize: '10px' }}>Pinned</span></div>}
                    </div>
                  ))}
                </div>
                {notes.length === 0 && !showForm && (
                  <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '13px' }}>
                    No notes yet. Jot something down.
                  </div>
                )}
              </>
            )}

            {/* PLACEHOLDERS TAB */}
            {tab === 'placeholders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Mail size={15} color="var(--accent)" />
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>Email Personalization Variables</span>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.6 }}>
                    Use these in your subject lines and email bodies. They get replaced with the actual contact data when the email is sent.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {PLACEHOLDERS.map(p => (
                      <div key={p.var} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', background: 'var(--card2)', borderRadius: '9px', border: '1px solid var(--border)' }}>
                        <code style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '4px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap' }}>{p.var}</code>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', color: 'var(--text)' }}>{p.desc}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>e.g. "{p.example}"</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '16px' }}>Email Style Options</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {EMAIL_STYLES_INFO.map(s => (
                      <div key={s.id} style={{ padding: '12px 16px', background: 'var(--card2)', borderRadius: '9px', border: '1px solid var(--border)', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                        <span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: '11px', whiteSpace: 'nowrap', marginTop: '2px' }}>{s.label}</span>
                        <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>{s.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GUIDE TAB */}
            {tab === 'guide' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '700px' }}>
                {[
                  {
                    title: '1. Add Contacts',
                    body: 'Go to Contacts → Add individually or bulk import via CSV format (email, name, company). Assign a category like "lead", "client", "hot", "vip", etc. to segment your list.',
                  },
                  {
                    title: '2. Create a Template',
                    body: 'Go to Templates → Pick a starter or write from scratch. Choose an email style (Plain, Minimal, Branded, Newsletter, Executive). Add a CTA button with a link. Use {{name}}, {{company}} for personalization.',
                  },
                  {
                    title: '3. Create a Campaign',
                    body: 'Go to Campaigns → New Campaign. Choose the email style, load a template, pick your target audience (All or a specific category). Set a CTA if needed. Save as Draft.',
                  },
                  {
                    title: '4. Send',
                    body: 'Hit "Send Now" on a draft campaign. The system will send in batches of 10 every 5 seconds to stay within Gmail limits (~250+/day). You can also select individual contacts from the Contacts page and send a campaign directly to them.',
                  },
                  {
                    title: '5. Track Results',
                    body: 'Go to Analytics to see delivery rates, per-campaign breakdown, and full email logs with error details.',
                  },
                  {
                    title: '📧 From Address',
                    body: 'All emails go out as: Sahil Sinha | Kaizen ASC <your@gmail.com>. The footer reads: "From Sahil Sinha · Kaizen ASC · kaizenasc.com". Recipients never see "Kaizen Reach" — that\'s just the internal tool name.',
                  },
                  {
                    title: '⚠️ Gmail Daily Limit',
                    body: 'Gmail allows up to 500 emails/day via SMTP. The app is rate-limited to ~250/day for safety. If you need more, consider Google Workspace (2000/day) or switch to a transactional email service like SendGrid.',
                  },
                ].map(item => (
                  <div key={item.title} className="card" style={{ padding: '18px 22px' }}>
                    <div style={{ fontWeight: '600', color: 'var(--accent)', fontSize: '13.5px', marginBottom: '8px' }}>{item.title}</div>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.7 }}>{item.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}