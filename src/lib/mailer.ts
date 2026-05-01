import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 14,
})

export function buildEmailHtml(body: string, contactName: string, ctaText?: string, ctaUrl?: string, style: string = 'plain', contactEmail?: string): string {
  const personalized = body
    .replace(/\{\{name\}\}/g, contactName || 'there')
    .replace(/\{\{company\}\}/g, '')
    .replace(/\{\{email\}\}/g, contactEmail || '')

  const ctaBlock = ctaText && ctaUrl ? `
    <div style="text-align:center;margin:32px 0;">
      <a href="${ctaUrl}" style="background:#22c55e;color:#000;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">${ctaText}</a>
    </div>` : ''

  const unsubLink = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/unsubscribe?email=${contactEmail}`
  const footerBlock = `
    <div style="padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        From Sahil Sinha · <a href="https://kaizenasc.com" style="color:#22c55e;text-decoration:none;">Kaizen ASC</a> · kaizenasc.com<br/>
        <a href="${unsubLink}" style="color:#9ca3af;font-size:11px;">Unsubscribe</a>
      </p>
    </div>`

  if (style === 'plain') {
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">
      <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;font-size:15px;color:#1a1a1a;line-height:1.75;padding:40px 32px;">
        <div style="white-space:pre-wrap;">${personalized}</div>
        ${ctaBlock}
        <div style="margin-top:40px;padding-top:20px;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
          Sahil Sinha · Kaizen ASC · <a href="https://kaizenasc.com" style="color:#22c55e;">kaizenasc.com</a> · <a href="${unsubLink}" style="color:#9ca3af;">Unsubscribe</a>
        </div>
      </div></body></html>`
  }

  if (style === 'minimal') {
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;">
      <div style="max-width:600px;margin:20px auto;font-family:'Segoe UI',sans-serif;background:#fff;border-radius:10px;overflow:hidden;">
        <div style="padding:20px 32px;border-bottom:2px solid #22c55e;">
          <span style="font-size:15px;font-weight:700;color:#111;">Kaizen <span style="color:#22c55e;">ASC</span></span>
        </div>
        <div style="padding:32px;font-size:15px;color:#1a1a1a;line-height:1.75;">
          <div style="white-space:pre-wrap;">${personalized}</div>
          ${ctaBlock}
        </div>
        ${footerBlock}
      </div></body></html>`
  }

  if (style === 'branded') {
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f3f4f6;">
      <div style="max-width:600px;margin:20px auto;font-family:'Segoe UI',sans-serif;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#0d1f17,#0a2e1c);padding:28px 32px;">
          <div style="font-size:20px;font-weight:800;color:#fff;">Kaizen <span style="color:#22c55e;">ASC</span></div>
          <div style="font-size:12px;color:#6b7280;margin-top:2px;">kaizenasc.com</div>
        </div>
        <div style="padding:36px 32px;font-size:15px;color:#1a1a1a;line-height:1.8;">
          <div style="white-space:pre-wrap;">${personalized}</div>
          ${ctaBlock}
        </div>
        ${footerBlock}
      </div></body></html>`
  }

  if (style === 'newsletter') {
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;">
      <div style="max-width:600px;margin:0 auto;font-family:'Segoe UI',sans-serif;">
        <div style="background:#111;padding:20px 32px;">
          <span style="font-size:18px;font-weight:800;color:#fff;">Kaizen <span style="color:#22c55e;">ASC</span></span>
        </div>
        <div style="background:#fff;padding:36px 32px;font-size:15px;color:#1a1a1a;line-height:1.8;">
          <div style="white-space:pre-wrap;">${personalized}</div>
          ${ctaBlock}
        </div>
        ${footerBlock}
      </div></body></html>`
  }

  if (style === 'executive') {
    return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#fff;">
      <div style="max-width:600px;margin:0 auto;font-family:Georgia,serif;">
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
            SAHIL SINHA · KAIZEN ASC · <a href="https://kaizenasc.com" style="color:#22c55e;text-decoration:none;">KAIZENASC.COM</a> · <a href="${unsubLink}" style="color:#9ca3af;">UNSUBSCRIBE</a>
          </p>
        </div>
      </div></body></html>`
  }

  return personalized
}