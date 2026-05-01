import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { transporter, buildEmailHtml } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { campaignId, contactIds } = body
    if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })

    const { data: campaign, error: ce } = await supabaseAdmin
      .from('campaigns').select('*').eq('id', campaignId).single()
    if (ce || !campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

    const { data: unsubs } = await supabaseAdmin.from('unsubscribes').select('email')
    const unsubEmails = new Set(unsubs?.map((u: any) => u.email) || [])

    let query = supabaseAdmin.from('contacts').select('*').eq('status', 'active')
    if (contactIds && contactIds.length > 0) {
      query = supabaseAdmin.from('contacts').select('*').eq('status', 'active').in('id', contactIds)
    }

    const { data: contacts } = await query
    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found' }, { status: 400 })
    }

    const eligible = contacts.filter((c: any) => !unsubEmails.has(c.email))

    await supabaseAdmin.from('campaigns').update({ status: 'sending' }).eq('id', campaignId)

    let sent = 0, failed = 0
    const BATCH_SIZE = 10
    const DELAY_MS = 5000

    for (let i = 0; i < eligible.length; i += BATCH_SIZE) {
      const batch = eligible.slice(i, i + BATCH_SIZE)

      await Promise.all(batch.map(async (contact: any) => {
        try {
          const subject = (campaign.subject || '').replace(/\{\{name\}\}/g, contact.name || 'there').replace(/\{\{company\}\}/g, contact.company || '')
          const html = buildEmailHtml(campaign.body, contact.name, campaign.cta_text, campaign.cta_url, campaign.style || 'plain', contact.email)

          await transporter.sendMail({
            from: `"Sahil Sinha | Kaizen ASC" <${process.env.SMTP_USER}>`,
            to: contact.email,
            subject,
            html,
            headers: {
              'X-Mailer': 'KaizenASC/1.0',
              'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
              'Precedence': 'bulk',
            }
          })

          await supabaseAdmin.from('email_logs').insert({ campaign_id: campaignId, contact_email: contact.email, status: 'sent' })
          sent++
        } catch (err: any) {
          await supabaseAdmin.from('email_logs').insert({ campaign_id: campaignId, contact_email: contact.email, status: 'failed', error: err.message })
          failed++
        }
      }))

      if (i + BATCH_SIZE < eligible.length) {
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    }

    await supabaseAdmin.from('campaigns').update({
      status: 'sent', sent_count: sent, failed_count: failed, sent_at: new Date().toISOString(),
    }).eq('id', campaignId)

    return NextResponse.json({ sent, failed })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}