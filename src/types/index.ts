export interface Contact {
  id: string
  email: string
  name?: string
  company?: string
  tags?: string[]
  status: string
  created_at: string
}

export interface Template {
  id: string
  name: string
  subject: string
  body: string
  created_at: string
}

export interface Campaign {
  id: string
  name: string
  subject: string
  body: string
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