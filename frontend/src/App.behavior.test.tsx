import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import * as api from './api/api'
import type { Book } from './types'

jest.mock('./api/api', () => ({
  listBooks: jest.fn(), getBook: jest.fn(), listBookCheckouts: jest.fn(),
  createBook: jest.fn(), createCheckout: jest.fn(),
}))

const books: Book[] = [
  { id: 1, title: 'River Stories', genre: 'Fiction', description: 'Stories from the river',
    author: 'Alex Reed', publisher_email: 'books@example.org', shelf_location: 'FIC-1' },
  { id: 2, title: 'Garden Guide', genre: 'Reference', description: 'A gardening handbook',
    author: 'Sam Green', publisher_email: 'books@example.org', shelf_location: 'REF-2' },
]

beforeEach(() => {
  window.history.replaceState(null, '', '#/books')
  jest.resetAllMocks()
  jest.mocked(api.getBook).mockImplementation(async (id) => books.find((book) => book.id === id)!)
  jest.mocked(api.listBooks).mockResolvedValue(books)
  jest.mocked(api.listBookCheckouts).mockResolvedValue([])
})

test('retries a failed catalog request', async () => {
  jest.mocked(api.listBooks).mockRejectedValueOnce(new Error('Connection lost'))
  const user = userEvent.setup()
  render(<App />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Connection lost')
  await user.click(screen.getByRole('button', { name: /retry loading books/i }))
  expect(await screen.findByText('River Stories')).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

test('shows checkout only after selecting a book and choosing the checkout action', async () => {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByText('River Stories')
  await user.type(screen.getByLabelText('Search'), 'River')
  await waitFor(() => expect(screen.queryByText('Garden Guide', { selector: 'strong' })).not.toBeInTheDocument())
  expect(screen.queryByRole('heading', { name: 'Create Book' })).not.toBeInTheDocument()
  expect(screen.queryByLabelText('Patron Name')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /view details/i }))
  await screen.findByRole('heading', { name: 'River Stories' })
  expect(screen.queryByLabelText('Patron Name')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /record checkout/i }))
  expect(screen.getByLabelText('Book')).toHaveValue('1')
  expect(screen.getByLabelText('Book')).toBeDisabled()
  expect(screen.getByLabelText('Patron Name')).toBeInTheDocument()
})

test('ignores an older detail response after selecting another book', async () => {
  let finishFirst!: (book: Book) => void
  jest.mocked(api.getBook).mockImplementation((id) => id === 1
    ? new Promise((resolve) => { finishFirst = resolve })
    : Promise.resolve(books[1]))
  const user = userEvent.setup()
  render(<App />)
  await screen.findByText('River Stories')
  const buttons = screen.getAllByRole('button', { name: 'View Details' })
  await user.click(buttons[0])
  await user.click(screen.getByRole('button', { name: 'Back to catalog' }))
  await user.click(screen.getAllByRole('button', { name: 'View Details' })[1])
  expect(await screen.findByRole('heading', { name: 'Garden Guide' })).toBeInTheDocument()
  await act(async () => { finishFirst(books[0]) })
  expect(screen.getByRole('heading', { name: 'Garden Guide' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /record checkout/i }))
  expect(screen.getByLabelText('Book')).toHaveValue('2')
})

test('keeps a failed checkout draft and prevents a second submission while saving', async () => {
  let failSave!: (reason: Error) => void
  jest.mocked(api.createCheckout).mockImplementation(() => new Promise((_, reject) => { failSave = reject }))
  const user = userEvent.setup()
  render(<App />)
  await screen.findByText('River Stories')
  await user.click(screen.getAllByRole('button', { name: 'View Details' })[0])
  await user.click(await screen.findByRole('button', { name: /record checkout/i }))
  await user.type(screen.getByLabelText('Patron Name'), 'Taylor')
  await user.type(screen.getByLabelText('Notes'), 'Pickup Friday')
  await user.click(screen.getByRole('button', { name: 'Create Checkout' }))
  const saving = screen.getByRole('button', { name: 'Saving checkout…' })
  expect(saving).toBeDisabled()
  await user.click(saving)
  expect(api.createCheckout).toHaveBeenCalledTimes(1)
  await act(async () => { failSave(new Error('Please try again')) })
  expect(await screen.findByRole('alert')).toHaveTextContent('Please try again')
  expect(screen.getByLabelText('Patron Name')).toHaveValue('Taylor')
  expect(screen.getByLabelText('Notes')).toHaveValue('Pickup Friday')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Create Checkout' })).toBeEnabled())
})


test('opens a checkout URL directly and loads the selected book', async () => {
  window.history.replaceState(null, '', '#/books/2/checkout')
  render(<App />)
  expect(await screen.findByRole('heading', { name: 'Garden Guide' })).toBeInTheDocument()
  expect(screen.getByLabelText('Book')).toHaveValue('2')
  expect(screen.queryByRole('heading', { name: 'Books' })).not.toBeInTheDocument()
})

test('shows a useful fallback for an unknown page', async () => {
  window.history.replaceState(null, '', '#/unknown')
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getByRole('heading', { name: 'This page isn’t on our shelves.' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Back to catalog' }))
  expect(await screen.findByText('River Stories')).toBeInTheDocument()
})

test('filters from the genre overview and keeps the filter control in sync', async () => {
  const user = userEvent.setup()
  render(<App />)
  await screen.findByText('River Stories')
  const reference = screen.getByRole('button', { name: /Reference 1/ })
  await user.click(reference)
  expect(reference).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByLabelText('Genre')).toHaveValue('Reference')
  await waitFor(() => expect(screen.queryByText('River Stories')).not.toBeInTheDocument())
  expect(screen.getByText('A gardening handbook')).toBeInTheDocument()
  await user.click(reference)
  expect(screen.getByLabelText('Genre')).toHaveValue('All')
  expect(await screen.findByText('River Stories')).toBeInTheDocument()
})

test('keeps the catalog off the landing page and provides a keyboard fallback without WebGL', async () => {
  window.history.replaceState(null, '', window.location.pathname)
  const user = userEvent.setup()
  render(<App />)
  expect(screen.getByRole('heading', { name: 'The library reading room' })).toBeInTheDocument()
  expect(screen.queryByRole('heading', { name: 'Books' })).not.toBeInTheDocument()
  expect(await screen.findByText('The 3D room is unavailable on this device.')).toBeInTheDocument()
  const skip = screen.getByRole('link', { name: 'Skip to catalog' })
  skip.focus()
  await user.keyboard('{Enter}')
  expect(await screen.findByText('River Stories')).toBeInTheDocument()
  expect(screen.getByRole('main')).toHaveFocus()
  expect(screen.queryByRole('heading', { name: 'The library reading room' })).not.toBeInTheDocument()
})
