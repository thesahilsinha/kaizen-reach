import { NextRequest, NextResponse } from 'next/server'
import { transporter, buildEmailHtml } from '@/lib/mailer'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body } = await req.json()
    await transporter.sendMail({
      from: `"Kaizen Reach" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: buildEmailHtml(body, 'Test User', to),
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}