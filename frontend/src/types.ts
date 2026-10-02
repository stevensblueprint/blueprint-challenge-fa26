export type Genre = 'Fiction' | 'Non-Fiction' | 'Children' | 'Reference' | 'Periodical' | 'Other'

export type Book = {
  id: number
  title: string
  genre: Genre
  description: string
  author: string
  publisher_email: string
  shelf_location: string
}

export type BookFormValues = {
  title: string
  genre: Genre
  description: string
  author: string
  publisher_email: string
  shelf_location: string
}

export type Checkout = {
  id: number
  patron_name: string
  book_id: number
  date: string
  notes: string
}

export type CheckoutFormValues = {
  patron_name: string
  book_id: string
  date: string
  notes: string
}

// What a form shows under its submit button: saving, saved, or what went wrong.
export type FormFeedback = {
  kind: 'saving' | 'success' | 'error'
  message: string
}

export const GENRES: Genre[] =['Fiction', 'Non-Fiction', 'Children', 'Reference', 'Periodical', 'Other']