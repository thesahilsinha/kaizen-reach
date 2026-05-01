export interface Contact {
  id: string
  email: string
  name?: string
  company?: string
  tags?: string[]
  category: string
  status: string
  created_at: string
}

export interface Template {
  id: string
  name: string
  subject: string
  body: string
  cta_text?: string
  cta_url?: string
  style?: string
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  cta_text?: string
  cta_url?: string
  style?: string
  target_category?: string
  status: string
  sent_count: number
  failed_count: number
  scheduled_at?: string
  sent_at?: string
  created_at: string
}

export interface EmailLog {
  id: string
  campaign_id: string
  contact_email: string
  status: string
  error?: string
  sent_at: string
}

export interface Note {
  id: string
  title: string
  content: string
  color: string
  pinned: boolean
  created_at: string
}