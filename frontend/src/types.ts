export type Category =
  | 'Food'
  | 'Housing'
  | 'Education'
  | 'Healthcare'
  | 'Employment'
  | 'Other'

export type Resource = {
  id: number
  name: string
  category: Category
  description: string
  address: string
  email: string
  phone: string
}

export type Referral = {
  id: number
  family_name: string
  resource_id: number
  date: string
  notes: string
}

export type ResourceFormValues = Omit<Resource, 'id'>

export type ReferralFormValues = {
  family_name: string
  resource_id: string
  date: string
  notes: string
}

export const CATEGORIES: Category[] = [
  'Food',
  'Housing',
  'Education',
  'Healthcare',
  'Employment',
  'Other',
]
