import type { Genre, Checkout, CheckoutFormValues, Book, BookFormValues } from '../types'

declare const __API_BASE_URL__: string
const API_BASE_URL = (typeof __API_BASE_URL__ === 'undefined'
  ? 'http://localhost:8000'
  : __API_BASE_URL__).replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch {
    throw new Error('Could not reach the server. Please try again.')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const detail = body?.detail
    if (typeof detail === 'string') throw new Error(detail)
    if (Array.isArray(detail)) {
      const message = detail.map((error: { loc?: string[]; msg?: string }) => {
        const field = error.loc?.slice(1).join(' ').replaceAll('_', ' ')
        return `${field || 'Input'}: ${error.msg || 'Invalid value'}`
      }).join('; ')
      throw new Error(message || 'Please check the form and try again.')
    }
    throw new Error(`Request failed (${response.status}). Please try again.`)
  }
  return response.json() as Promise<T>
}

export async function listBooks(params?: { q?: string; genre?: Genre | 'All' }): Promise<Book[]> {
  const query = new URLSearchParams()
  if (params?.q) query.set('q', params.q)
  if (params?.genre && params.genre !== 'All') query.set('genre', params.genre)
  const suffix = query.size ? `?${query}` : ''
  return request<Book[]>(`/books${suffix}`)
}

export async function getBook(bookId: number): Promise<Book> {
  return request<Book>(`/books/${bookId}`)
}

export async function createBook(payload: BookFormValues): Promise<Book> {
  return request<Book>('/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function listBookCheckouts(bookId: number): Promise<Checkout[]> {
  return request<Checkout[]>(`/books/${bookId}/checkouts`)
}

export async function createCheckout(payload: CheckoutFormValues): Promise<Checkout> {
  return request<Checkout>('/checkouts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, book_id: Number(payload.book_id) }),
  })
}
