'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, Copy, Zap } from 'lucide-react'
import type { Template } from '@/types'

const STARTER_TEMPLATES = [
  {
    name: 'Cold Intro — Founder',
    subject: 'Quick thought on {{name}} & what we do at Kaizen ASC',
    body: `Hi {{name}},\n\nI came across your work at {{company}} and it genuinely stood out.\n\nAt Kaizen ASC, we help businesses sharpen their operations, branding, and outreach — the kind of work that compounds over time.\n\nI'd love to share a few ideas specific to what you're building. Would a quick 15-min call this week work?\n\nWarm regards,\nSahil Sinha\nKaizen ASC | kaizenasc.com`,
    cta_text: 'Book a Call', cta_url: 'https://kaizenasc.com/contact', style: 'branded',
  },
  {
    name: 'Partnership Pitch',
    subject: 'Partnership opportunity — Kaizen ASC × {{company}}',
    body: `Hi {{name}},\n\nI'm reaching out because I believe there's a natural fit between Kaizen ASC and {{company}}.\n\nWe work at the intersection of strategy, design, and execution — and your team seems to be solving similar problems from a different angle.\n\nWould love to explore if there's a way to create value together.\n\nBest,\nSahil Sinha\nFounder, Kaizen ASC`,
    cta_text: 'Let\'s Connect', cta_url: 'https://kaizenasc.com', style: 'minimal',
  },
  {
    name: 'Follow-Up (Warm)',
    subject: 'Following up, {{name}} — Kaizen ASC',
    body: `Hey {{name}},\n\nJust following up on my last note — I know how busy things get.\n\nIf timing wasn't right before, no worries at all. I'd still love to share what we've been building at Kaizen ASC and see if it's relevant to what you're working on.\n\nHappy to keep it to 10 minutes. Your call.\n\nSahil\nKaizen ASC`,
    cta_text: 'Schedule 10 mins', cta_url: 'https://kaizenasc.com/contact', style: 'plain',
  },
  {
    name: 'Newsletter — Monthly',
    subject: '📌 Kaizen ASC: What\'s new this month',
    body: `Hi {{name}},\n\nHere's what's been happening at Kaizen ASC this month:\n\n▸ [Update 1 — what you shipped or learned]\n▸ [Update 2 — client win or case study]\n▸ [Update 3 — resource or insight]\n\nAs always, if there's anything we can help with — strategy, branding, or execution — just reply to this email.\n\nUntil next month,\nSahil Sinha\nKaizen ASC | kaizenasc.com`,
    cta_text: 'Visit Kaizen ASC', cta_url: 'https://kaizenasc.com', style: 'newsletter',
  },
  {
    name: 'Event / Webinar Invite',
    subject: 'You\'re invited — [Event Name] by Kaizen ASC',
    body: `Hi {{name}},\n\nWe're hosting [Event Name] on [Date] and I'd love for you to join.\n\nWhat to expect:\n• [Topic 1]\n• [Topic 2]\n• Live Q&A\n\nSpots are limited — grab yours before they fill up.\n\nSee you there,\nSahil Sinha\nKaizen ASC`,
    cta_text: 'Reserve My Spot', cta_url: 'https://kaizenasc.com', style: 'branded',
  },
]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', subject: '', body: '', cta_text: '', cta_url: '', style: 'plain' })
  const [preview, setPreview] = useState<any>(null)

  const load = async () => {
    const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false })
    setTemplates(data || [])
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.name || !form.subject || !form.body) return toast.error('Fill name, subject and body')
    if (editing) {
      await supabase.from('templates').update(form).eq('id', editing.id)
      toast.success('Updated!')
    } else {
      await supabase.from('templates').insert(form)
      toast.success('Template saved!')
    }
    setForm({ name: '', subject: '', body: '', cta_text: '', cta_url: '', style: 'plain' })
    setShowForm(false); setEditing(null); load()
  }

  const del = async (id: string) => {
    await supabase.from('templates').delete().eq('id', id)
    toast.success('Deleted'); load()
  }

  const editTpl = (t: any) => {
    setEditing(t)
    setForm({ name: t.name, subject: t.subject, body: t.body, cta_text: t.cta_text || '', cta_url: t.cta_url || '', style: t.style || 'plain' })
    setShowForm(true)
  }

  const duplicate = async (t: any) => {
    await supabase.from('templates').insert({ ...t, id: undefined, name: t.name + ' (copy)', created_at: undefined })
    toast.success('Duplicated!'); load()
  }

  const loadStarter = (s: typeof STARTER_TEMPLATES[0]) => {
    setForm({ name: s.name, subject: s.subject, body: s.body, cta_text: s.cta_text, cta_url: s.cta_url, style: s.style })
    setShowForm(true); setEditing(null)
  }

  const EMAIL_STYLES = [
    { id: 'plain', label: 'Plain Text', desc: 'Clean, no styling. Feels personal.' },
    { id: 'minimal', label: 'Minimal', desc: 'Subtle header, clean layout.' },
    { id: 'branded', label: 'Kaizen Branded', desc: 'Official Kaizen ASC look.' },
    { id: 'newsletter', label: 'Newsletter', desc: 'Structured sections, bold.' },
    { id: 'executive', label: 'Executive', desc: 'Dark header, premium feel.' },
  ]

  return (
    <AuthGuard>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main className="page-main" style={{ flex: 1, padding: '32px', overflow: 'auto' }}>
          <div className="animate-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text)' }}>Templates</h2>
                <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Use {'{{name}}'}, {'{{email}}'}, {'{{company}}'} for personalization</p>
              </div>
              <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', subject: '', body: '', cta_text: '', cta_url: '', style: 'plain' }) }}>
                <Plus size={13} />New Template
              </button>
            </div>

            {/* Starter packs */}
            {!showForm && (
              <div className="card" style={{ padding: '18px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Zap size={14} color="var(--accent)" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>Kaizen ASC Starter Templates</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {STARTER_TEMPLATES.map(s => (
                    <button key={s.name} className="btn-ghost" onClick={() => loadStarter(s)} style={{ fontSize: '12.5px', padding: '7px 14px' }}>{s.name}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px', color: 'var(--accent)' }}>
                  {editing ? 'Edit Template' : 'New Template'}
                </h3>

                {/* Email Style Picker */}
                <div style={{ marginBottom: '20px' }}>
                  <label>Email Style / Layout</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '8px' }}>
                    {EMAIL_STYLES.map(s => (
                      <div
                        key={s.id}
                        className={`style-card ${form.style === s.id ? 'selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, style: s.id }))}
                      >
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>{s.label}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div><label>Template Name</label><input placeholder="Cold Outreach v1" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                  <div><label>Subject Line</label><input placeholder="Quick thought on {{name}} & what we do" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} /></div>
                  <div>
                    <label>Email Body</label>
                    <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>
                      Variables: <code style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4 }}>{'{{name}}'}</code>{' '}
                      <code style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4 }}>{'{{company}}'}</code>{' '}
                      <code style={{ background: 'var(--accent-glow)', color: 'var(--accent)', padding: '1px 6px', borderRadius: 4 }}>{'{{email}}'}</code>
                    </div>
                    <textarea rows={12} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder={"Hi {{name}},\n\nYour message here...\n\nBest,\nSahil Sinha\nKaizen ASC"} />
                  </div>

                  {/* CTA Section */}
                  <div style={{ background: 'var(--card2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '12px' }}>Call to Action Button (optional)</div>
                    <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div><label>Button Text</label><input placeholder="Book a Call" value={form.cta_text} onChange={e => setForm({ ...form, cta_text: e.target.value })} /></div>
                      <div><label>Button URL</label><input placeholder="https://kaizenasc.com/contact" value={form.cta_url} onChange={e => setForm({ ...form, cta_url: e.target.value })} /></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '18px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={save}>Save Template</button>
                  <button className="btn-ghost" onClick={() => setPreview(form)}>Preview Email</button>
                  <button className="btn-ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Preview Modal */}
            {preview && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', overflowY: 'auto' }}>
                <div style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>Preview — {preview.style} style</span>
                    <button className="btn-ghost" onClick={() => setPreview(null)} style={{ padding: '6px 14px', fontSize: '12px' }}>Close</button>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: generateEmailHTML(preview.body, 'Sahil', preview.cta_text, preview.cta_url, preview.style) }} />
                </div>
              </div>
            )}

            {/* Template Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {templates.map(t => (
                <div key={t.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', color: 'var(--text)', fontSize: '14px', marginBottom: '3px' }}>{t.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--accent)' }}>{t.subject}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '10px' }}>
                      <button onClick={() => duplicate(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}><Copy size={13} /></button>
                      <button onClick={() => editTpl(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}><Edit2 size={13} /></button>
                      <button onClick={() => del(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {(t as any).body?.slice(0, 130)}{(t as any).body?.length > 130 ? '...' : ''}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <span className="badge badge-gray" style={{ fontSize: '11px', textTransform: 'capitalize' }}>{(t as any).style || 'plain'}</span>
                    {(t as any).cta_text && <span className="badge badge-blue" style={{ fontSize: '11px' }}>CTA: {(t as any).cta_text}</span>}
                    <button onClick={() => setPreview(t)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '12px' }}>Preview →</button>
                  </div>
                </div>
              ))}
            </div>
            {templates.length === 0 && !showForm && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)', fontSize: '14px' }}>
                No templates yet. Load a starter above or create one.
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}

// Email HTML generator (also used in mailer.ts)
export function generateEmailHTML(body: string, contactName: string, ctaText?: string, ctaUrl?: string, style: string = 'plain'): string {
  const personalized = body.replace(/\{\{name\}\}/g, contactName || 'there').replace(/\{\{company\}\}/g, '[Company]').replace(/\{\{email\}\}/g, '')

  const ctaBlock = ctaText && ctaUrl ? `
    <div style="text-align:center;margin:32px 0;">
      <a href="${ctaUrl}" style="background:#22c55e;color:#000;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">${ctaText}</a>
    </div>` : ''

  const footerBlock = `
    <div style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        From Sahil Sinha · <a href="https://kaizenasc.com" style="color:#22c55e;text-decoration:none;">Kaizen ASC</a> · kaizenasc.com<br/>
        <a href="#unsubscribe" style="color:#9ca3af;font-size:11px;">Unsubscribe</a>
      </p>
    </div>`

  if (style === 'plain') {
    return `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;font-size:15px;color:#1a1a1a;line-height:1.75;background:#fff;padding:40px 32px;">
      <div style="white-space:pre-wrap;">${personalized}</div>
      ${ctaBlock}
      <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
        Sahil Sinha · Kaizen ASC · <a href="https://kaizenasc.com" style="color:#22c55e;">kaizenasc.com</a> · <a href="#unsubscribe" style="color:#9ca3af;">Unsubscribe</a>
      </div>
    </div>`
  }

  if (style === 'minimal') {
    return `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;background:#fff;">
      <div style="padding:24px 32px;border-bottom:2px solid #22c55e;">
        <span style="font-size:15px;font-weight:700;color:#111;">Kaizen <span style="color:#22c55e;">ASC</span></span>
      </div>
      <div style="padding:32px;font-size:15px;color:#1a1a1a;line-height:1.75;">
        <div style="white-space:pre-wrap;">${personalized}</div>
        ${ctaBlock}
      </div>
      ${footerBlock}
    </div>`
  }

  if (style === 'branded') {
    return `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);">
      <div style="background:linear-gradient(135deg,#0d1f17,#0a2e1c);padding:28px 32px;">
        <div style="font-size:20px;font-weight:800;color:#fff;">Kaizen <span style="color:#22c55e;">ASC</span></div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">kaizenasc.com</div>
      </div>
      <div style="padding:36px 32px;font-size:15px;color:#1a1a1a;line-height:1.8;">
        <div style="white-space:pre-wrap;">${personalized}</div>
        ${ctaBlock}
      </div>
      ${footerBlock}
    </div>`
  }

  if (style === 'newsletter') {
    return `<div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;background:#f9fafb;">
      <div style="background:#111;padding:20px 32px;display:flex;align-items:center;gap:12px;">
        <span style="font-size:18px;font-weight:800;color:#fff;">Kaizen <span style="color:#22c55e;">ASC</span></span>
        <span style="font-size:11px;color:#6b7280;margin-left:auto;">Newsletter</span>
      </div>
      <div style="background:#fff;margin:0;padding:36px 32px;font-size:15px;color:#1a1a1a;line-height:1.8;">
        <div style="white-space:pre-wrap;">${personalized}</div>
        ${ctaBlock}
      </div>
      ${footerBlock}
    </div>`
  }

  if (style === 'executive') {
    return `<div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;background:#fff;">
      <div style="background:#0a0a0a;padding:28px 36px;">
        <div style="font-size:14px;letter-spacing:0.15em;color:#22c55e;text-transform:uppercase;font-weight:600;">Kaizen ASC</div>
        <div style="font-size:11px;color:#4b5563;letter-spacing:0.1em;margin-top:2px;">kaizenasc.com</div>
      </div>
      <div style="padding:40px 36px;font-size:16px;color:#111;line-height:1.9;">
        <div style="white-space:pre-wrap;">${personalized}</div>
        ${ctaBlock}
      </div>
      <div style="padding:20px 36px;border-top:1px solid #111;">
        <p style="color:#9ca3af;font-size:11px;letter-spacing:0.05em;margin:0;">
          SAHIL SINHA · KAIZEN ASC · <a href="https://kaizenasc.com" style="color:#22c55e;text-decoration:none;">KAIZENASC.COM</a> · <a href="#unsubscribe" style="color:#9ca3af;font-size:10px;">UNSUBSCRIBE</a>
        </p>
      </div>
    </div>`
  }

  return personalized
}