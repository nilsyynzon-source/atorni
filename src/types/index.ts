export type UserRole = 'client' | 'lawyer'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface LawyerProfile {
  id: string
  user_id: string
  bio: string | null
  specializations: string[]
  hourly_rate: number | null
  years_experience: number | null
  bar_number: string | null
  location: string | null
  languages: string[]
  is_verified: boolean
  is_accepting_clients: boolean
  stripe_account_id: string | null
  website: string | null
  linkedin_url: string | null
  phone: string | null
  created_at: string
  updated_at: string
  // joined
  profile?: Profile
}

export interface AvailabilitySlot {
  id: string
  lawyer_id: string
  start_time: string
  end_time: string
  is_booked: boolean
  created_at: string
}

export interface Booking {
  id: string
  client_id: string
  lawyer_id: string
  slot_id: string
  status: BookingStatus
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  amount: number | null
  notes: string | null
  meeting_link: string | null
  created_at: string
  updated_at: string
  // joined
  lawyer_profile?: LawyerProfile
  client?: Profile
  slot?: AvailabilitySlot
}

export interface AdvicePost {
  id: string
  author_id: string
  title: string
  content: string
  category: string | null
  is_answered: boolean
  view_count: number
  created_at: string
  updated_at: string
  // joined
  author?: Profile
  answers?: AdviceAnswer[]
  answer_count?: number
}

export interface AdviceAnswer {
  id: string
  post_id: string
  author_id: string
  content: string
  is_accepted: boolean
  upvotes: number
  created_at: string
  // joined
  author?: Profile
}

export const LEGAL_SPECIALIZATIONS = [
  'Family Law',
  'Criminal Defense',
  'Corporate Law',
  'Immigration',
  'Real Estate',
  'Employment Law',
  'Personal Injury',
  'Intellectual Property',
  'Tax Law',
  'Bankruptcy',
  'Estate Planning',
  'Civil Rights',
  'Environmental Law',
  'Healthcare Law',
  'Contract Law',
] as const

export type LegalSpecialization = (typeof LEGAL_SPECIALIZATIONS)[number]

export const ADVICE_CATEGORIES = [
  'Family Law',
  'Criminal Defense',
  'Corporate Law',
  'Immigration',
  'Real Estate',
  'Employment Law',
  'Personal Injury',
  'Intellectual Property',
  'Tax Law',
  'Bankruptcy',
  'Estate Planning',
  'General Legal Question',
  'Other',
] as const
