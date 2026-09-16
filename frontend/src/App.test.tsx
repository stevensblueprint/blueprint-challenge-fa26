import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'

import App from './App'
import * as api from './api/api'

jest.mock('./api/api', () => ({
  listBooks: jest.fn(),
  getBook: jest.fn(),
  createBook: jest.fn(),
  listBookCheckouts: jest.fn(),
  createCheckout: jest.fn(),
}))

const listBooksMock = api.listBooks as jest.MockedFunction<typeof api.listBooks>
const getBookMock = api.getBook as jest.MockedFunction<typeof api.getBook>
const createBookMock = api.createBook as jest.MockedFunction<typeof api.createBook>
const listBookCheckoutsMock = api.listBookCheckouts as jest.MockedFunction
  typeof api.listBookCheckouts
>
const createCheckoutMock = api.createCheckout as jest.MockedFunction<typeof api.createCheckout>

describe('App challenge acceptance tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('loads and displays books, then applies search and genre filters', async () => {
    const user = userEvent.setup()

    listBooksMock
      .mockResolvedValueOnce([
        {
          id: 1,
          title: 'The Hobbit',
          genre: 'Fiction',
          description: 'A hobbit goes on an adventure',
          author: 'J.R.R. Tolkien',
          publisher_email: 'contact@allenandunwin.org',
          shelf_location: 'FIC-TOL-001',
        },
        {
          id: 2,
          title: 'A Brief History of Time',
          genre: 'Non-Fiction',
          description: 'Cosmology for a general audience',
          author: 'Stephen Hawking',
          publisher_email: 'hello@bantam.org',
          shelf_location: 'NF-HAW-003',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          title: 'The Hobbit',
          genre: 'Fiction',
          description: 'A hobbit goes on an adventure',
          author: 'J.R.R. Tolkien',
          publisher_email: 'contact@allenandunwin.org',
          shelf_location: 'FIC-TOL-001',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 2,
          title: 'A Brief History of Time',
          genre: 'Non-Fiction',
          description: 'Cosmology for a general audience',
          author: 'Stephen Hawking',
          publisher_email: 'hello@bantam.org',
          shelf_location: 'NF-HAW-003',
        },
      ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load books/i }))

    expect(await screen.findByText('The Hobbit')).toBeInTheDocument()
    expect(screen.getByText('A Brief History of Time')).toBeInTheDocument()
    expect(listBooksMock).toHaveBeenNthCalledWith(1, { q: '', genre: 'All' })

    await user.clear(screen.getByLabelText(/search/i))
    await user.type(screen.getByLabelText(/search/i), 'hobbit')

    await waitFor(() => {
      expect(listBooksMock).toHaveBeenCalledWith({ q: 'hobbit', genre: 'All' })
    })

    await user.selectOptions(screen.getByLabelText(/genre filter/i), 'Non-Fiction')

    await waitFor(() => {
      expect(listBooksMock).toHaveBeenLastCalledWith({ q: 'hobbit', genre: 'Non-Fiction' })
    })
  })

  test('creates a book and refreshes the list', async () => {
    const user = userEvent.setup()

    createBookMock.mockResolvedValue({
      id: 3,
      title: 'Where the Wild Things Are',
      genre: 'Children',
      description: 'A boy sails to an island of monsters',
      author: 'Maurice Sendak',
      publisher_email: 'contact@harpercollins.org',
      shelf_location: 'CHI-SEN-002',
    })

    listBooksMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 3,
          title: 'Where the Wild Things Are',
          genre: 'Children',
          description: 'A boy sails to an island of monsters',
          author: 'Maurice Sendak',
          publisher_email: 'contact@harpercollins.org',
          shelf_location: 'CHI-SEN-002',
        },
      ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load books/i }))

    await user.type(screen.getByLabelText(/^title$/i), 'Where the Wild Things Are')
    await user.selectOptions(screen.getByLabelText(/^genre$/i), 'Children')
    await user.type(screen.getByLabelText(/description/i), 'A boy sails to an island of monsters')
    await user.type(screen.getByLabelText(/author/i), 'Maurice Sendak')
    await user.type(screen.getByLabelText(/publisher email/i), 'contact@harpercollins.org')
    await user.type(screen.getByLabelText(/shelf location/i), 'CHI-SEN-002')

    await user.click(screen.getByRole('button', { name: /create book/i }))

    expect(createBookMock).toHaveBeenCalledWith({
      title: 'Where the Wild Things Are',
      genre: 'Children',
      description: 'A boy sails to an island of monsters',
      author: 'Maurice Sendak',
      publisher_email: 'contact@harpercollins.org',
      shelf_location: 'CHI-SEN-002',
    })

    await waitFor(() => {
      expect(listBooksMock).toHaveBeenCalledTimes(2)
    })
    expect(await screen.findByText('Where the Wild Things Are')).toBeInTheDocument()
  })

  test('loads selected book details with checkout history', async () => {
    const user = userEvent.setup()

    listBooksMock.mockResolvedValue([
      {
        id: 1,
        title: 'The Hobbit',
        genre: 'Fiction',
        description: 'A hobbit goes on an adventure',
        author: 'J.R.R. Tolkien',
        publisher_email: 'contact@allenandunwin.org',
        shelf_location: 'FIC-TOL-001',
      },
    ])

    getBookMock.mockResolvedValue({
      id: 1,
      title: 'The Hobbit',
      genre: 'Fiction',
      description: 'A hobbit goes on an adventure',
      author: 'J.R.R. Tolkien',
      publisher_email: 'contact@allenandunwin.org',
      shelf_location: 'FIC-TOL-001',
    })

    listBookCheckoutsMock.mockResolvedValue([
      {
        id: 11,
        patron_name: 'Priya Nair',
        book_id: 1,
        date: '2026-02-15',
        notes: 'Due back in 3 weeks',
      },
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load books/i }))
    await user.click(screen.getByRole('button', { name: /view details/i }))

    expect(getBookMock).toHaveBeenCalledWith(1)
    expect(listBookCheckoutsMock).toHaveBeenCalledWith(1)
    expect(await screen.findByText(/priya nair/i)).toBeInTheDocument()
  })

  test('creates a checkout for a selected book and refreshes checkout list', async () => {
    const user = userEvent.setup()

    listBooksMock.mockResolvedValue([
      {
        id: 1,
        title: 'The Hobbit',
        genre: 'Fiction',
        description: 'A hobbit goes on an adventure',
        author: 'J.R.R. Tolkien',
        publisher_email: 'contact@allenandunwin.org',
        shelf_location: 'FIC-TOL-001',
      },
    ])

    getBookMock.mockResolvedValue({
      id: 1,
      title: 'The Hobbit',
      genre: 'Fiction',
      description: 'A hobbit goes on an adventure',
      author: 'J.R.R. Tolkien',
      publisher_email: 'contact@allenandunwin.org',
      shelf_location: 'FIC-TOL-001',
    })

    listBookCheckoutsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 12,
          patron_name: 'Marcus Webb',
          book_id: 1,
          date: '2026-02-20',
          notes: 'Renewed once already',
        },
      ])

    createCheckoutMock.mockResolvedValue({
      id: 12,
      patron_name: 'Marcus Webb',
      book_id: 1,
      date: '2026-02-20',
      notes: 'Renewed once already',
    })

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load books/i }))
    await user.click(screen.getByRole('button', { name: /view details/i }))

    await user.type(screen.getByLabelText(/patron name/i), 'Marcus Webb')
    await user.selectOptions(screen.getByLabelText(/^book$/i), '1')
    await user.clear(screen.getByLabelText(/date/i))
    await user.type(screen.getByLabelText(/date/i), '2026-02-20')
    await user.type(screen.getByLabelText(/notes/i), 'Renewed once already')

    await user.click(screen.getByRole('button', { name: /create checkout/i }))

    expect(createCheckoutMock).toHaveBeenCalledWith({
      patron_name: 'Marcus Webb',
      book_id: '1',
      date: '2026-02-20',
      notes: 'Renewed once already',
    })

    await waitFor(() => {
      expect(listBookCheckoutsMock).toHaveBeenCalledTimes(2)
    })
    expect(await screen.findByText(/marcus webb/i)).toBeInTheDocument()
  })
})
