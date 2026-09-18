import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, within } from '@testing-library/react'

import App from './App'
import * as api from './api/api'
import type { Book, Checkout } from './types'

jest.mock('./api/api', () => ({
  listBooks: jest.fn(),
  getBook: jest.fn(),
  createBook: jest.fn(),
  listBookCheckouts: jest.fn(),
  createCheckout: jest.fn(),
}))

const listBooksMock = jest.mocked(api.listBooks)
const getBookMock = jest.mocked(api.getBook)
const createBookMock = jest.mocked(api.createBook)
const listBookCheckoutsMock = jest.mocked(api.listBookCheckouts)
const createCheckoutMock = jest.mocked(api.createCheckout)

const hobbit: Book = {
  id: 17,
  title: 'The Hobbit',
  genre: 'Fiction',
  description: 'A hobbit goes on an adventure',
  author: 'J.R.R. Tolkien',
  publisher_email: 'contact@allenandunwin.org',
  shelf_location: 'FIC-TOL-001',
}
const companion: Book = {
  ...hobbit,
  id: 42,
  title: 'The Hobbit Companion',
  genre: 'Reference',
  description: 'A guide to the characters and places',
  author: 'David Day',
  shelf_location: 'REF-DAY-002',
}
const handbook: Book = {
  ...companion,
  id: 65,
  title: 'Writing Handbook',
  description: 'A guide to writing clearly',
}

// The scaffold has two Genre labels. Scope by each section's heading,
// so a correct implementation need not rename either label to satisfy a test.
function section(heading: string) {
  const element = screen.getByRole('heading', { name: heading }).closest('section')
  if (!element) throw new Error(`Missing section for ${heading}`)
  return within(element)
}

async function loadBooks(user: ReturnType<typeof userEvent.setup>) {
  const button = screen.queryByRole('button', { name: /load books/i })
  if (button) await user.click(button)
  await expectCatalog([hobbit.title, companion.title, handbook.title])
}

async function expectCatalog(titles: string[]) {
  await waitFor(() => {
    for (const book of [hobbit, companion, handbook]) {
      const element = section('Books').queryByText(book.title)
      if (titles.includes(book.title)) expect(element).toBeInTheDocument()
      else expect(element).not.toBeInTheDocument()
    }
  })
}

async function selectBook(user: ReturnType<typeof userEvent.setup>, book: Book) {
  const row = section('Books').getByText(book.title).closest('li')
  if (!row) throw new Error(`Missing catalog row for ${book.title}`)
  await user.click(within(row).getByRole('button', { name: /view details/i }))
  expect(await screen.findByRole('heading', { name: book.title })).toBeInTheDocument()
}

describe('App challenge acceptance tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    const books = [hobbit, companion, handbook].map((book) => ({ ...book }))
    const checkouts: Checkout[] = [{
      id: 11,
      patron_name: 'Priya Nair',
      book_id: companion.id,
      date: '2026-02-15',
      notes: 'Due back in 3 weeks',
    }]

    // Responses follow the request and stored data, never an assumed call count.
    listBooksMock.mockImplementation(async (params = {}) => books
      .filter((book) =>
        (!params.q || book.title.toLowerCase().includes(params.q.toLowerCase())) &&
        (!params.genre || params.genre === 'All' || book.genre === params.genre))
      .map((book) => ({ ...book })))
    getBookMock.mockImplementation(async (id) => {
      const book = books.find((candidate) => candidate.id === id)
      if (!book) throw new Error('Book not found')
      return { ...book }
    })
    createBookMock.mockImplementation(async (payload) => {
      const book = { ...payload, id: 90 }
      books.push(book)
      return { ...book }
    })
    listBookCheckoutsMock.mockImplementation(async (id) => checkouts
      .filter((checkout) => checkout.book_id === id)
      .map((checkout) => ({ ...checkout })))
    createCheckoutMock.mockImplementation(async (payload) => {
      const checkout = { ...payload, id: 12, book_id: Number(payload.book_id) }
      checkouts.push(checkout)
      return { ...checkout }
    })
  })

  test.each([
    ['title search', 'Hobbit', 'All', [hobbit.title, companion.title]],
    ['genre filter', '', 'Reference', [companion.title, handbook.title]],
    ['combined filters', 'Hobbit', 'Reference', [companion.title]],
    ['no matching books', 'unmatched title', 'Reference', []],
  ])('displays the correct catalog for %s', async (_name, query, genre, expected) => {
    const user = userEvent.setup()
    render(<App />)
    await loadBooks(user)

    if (query) await user.type(section('Books').getByLabelText(/search/i), query)
    await user.selectOptions(section('Books').getByLabelText(/genre/i), genre)
    // Both automatic filtering and explicitly applying/loading filters are valid.
    const apply = screen.queryByRole('button', { name: /load books|apply filters|^search$/i })
    if (apply) await user.click(apply)
    await expectCatalog(expected)

    await user.clear(section('Books').getByLabelText(/search/i))
    await user.selectOptions(section('Books').getByLabelText(/genre/i), 'All')
    if (apply) await user.click(apply)
    await expectCatalog([hobbit.title, companion.title, handbook.title])
  })

  test('saves all book fields and displays the created book', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loadBooks(user)

    const payload = {
      title: 'Where the Wild Things Are',
      genre: 'Children',
      description: 'A boy sails to an island of monsters',
      author: 'Maurice Sendak',
      publisher_email: 'contact@harpercollins.org',
      shelf_location: 'CHI-SEN-002',
    }
    const form = section('Create Book')
    await user.type(form.getByLabelText(/^title$/i), payload.title)
    await user.selectOptions(form.getByLabelText(/genre/i), payload.genre)
    await user.type(form.getByLabelText(/description/i), payload.description)
    await user.type(form.getByLabelText(/author/i), payload.author)
    await user.type(form.getByLabelText(/publisher email/i), payload.publisher_email)
    await user.type(form.getByLabelText(/shelf location/i), payload.shelf_location)
    await user.click(form.getByRole('button', { name: /create book/i }))

    await waitFor(() => expect(createBookMock).toHaveBeenCalledWith(payload))
    expect(await section('Books').findByText(payload.title)).toBeInTheDocument()
  })

  test('shows the selected book details and its checkout history', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loadBooks(user)
    await selectBook(user, companion)

    const detail = section(companion.title)
    for (const value of [companion.description, companion.author,
      companion.publisher_email, companion.shelf_location, companion.genre]) {
      expect(detail.getByText(value)).toBeInTheDocument()
    }
    expect(await detail.findByText('Priya Nair')).toBeInTheDocument()
    expect(detail.getByText('Due back in 3 weeks')).toBeInTheDocument()

    await selectBook(user, hobbit)
    expect(section(hobbit.title).getByText(hobbit.description)).toBeInTheDocument()
    await waitFor(() => expect(section(hobbit.title).queryByText('Priya Nair')).not.toBeInTheDocument())
  })

  test('saves a checkout for the selected book and displays it alongside existing history', async () => {
    const user = userEvent.setup()
    render(<App />)
    await loadBooks(user)
    await selectBook(user, companion)
    expect(await section(companion.title).findByText('Priya Nair')).toBeInTheDocument()

    const form = section('Create Checkout')
    await user.type(form.getByLabelText(/patron name/i), 'Marcus Webb')
    await user.selectOptions(form.getByLabelText(/^book$/i), String(companion.id))
    await user.clear(form.getByLabelText(/^date$/i))
    await user.type(form.getByLabelText(/^date$/i), '2026-02-20')
    await user.type(form.getByLabelText(/notes/i), 'Renewed once already')
    await user.click(form.getByRole('button', { name: /create checkout/i }))

    await waitFor(() => {
      expect(createCheckoutMock).toHaveBeenCalled()
      const [payload] = createCheckoutMock.mock.calls[0]
      expect({ ...payload, book_id: Number(payload.book_id) }).toEqual({
        patron_name: 'Marcus Webb', book_id: companion.id,
        date: '2026-02-20', notes: 'Renewed once already',
      })
    })
    expect(await section(companion.title).findByText('Marcus Webb')).toBeInTheDocument()
    expect(section(companion.title).getByText('Priya Nair')).toBeInTheDocument()
    expect(section(companion.title).getByText('Renewed once already')).toBeInTheDocument()
  })
})
