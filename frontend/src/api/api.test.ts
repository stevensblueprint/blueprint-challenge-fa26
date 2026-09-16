import {
  createCheckout,
  createBook,
  getBook,
  listBookCheckouts,
  listBooks,
} from './api'

describe('api contract', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock
  })

  test('listBooks calls GET /books with q and genre query params', async () => {
    const books = [
      {
        id: 1,
        title: 'The Hobbit',
        genre: 'Fiction',
        description: 'A hobbit goes on an adventure',
        author: 'J.R.R. Tolkien',
        publisher_email: 'contact@allenandunwin.example.org',
        shelf_location: 'FIC-TOL-001',
      },
    ]

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => books,
    } as Response)

    const result = await listBooks({ q: 'hobbit', genre: 'Fiction' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/books?q=hobbit&genre=Fiction',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual(books)
  })

  test('getBook calls GET /books/{id} and returns parsed payload', async () => {
    const book = {
      id: 7,
      title: 'The Elements of Style',
      genre: 'Reference' as const,
      description: 'Guide to writing well',
      author: 'William Strunk Jr.',
      publisher_email: 'contact@pearson.example.org',
      shelf_location: 'REF-STR-014',
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => book,
    } as Response)

    const result = await getBook(7)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/books/7',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual(book)
  })

  test('createBook calls POST /books with JSON payload', async () => {
    const payload = {
      title: 'Where the Wild Things Are',
      genre: 'Children' as const,
      description: 'A boy sails to an island of monsters',
      author: 'Maurice Sendak',
      publisher_email: 'contact@harpercollins.example.org',
      shelf_location: 'CHI-SEN-002',
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, ...payload }),
    } as Response)

    const created = await createBook(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/books',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      }),
    )
    expect(created).toEqual({ id: 3, ...payload })
  })

  test('listBookCheckouts calls GET /books/{id}/checkouts', async () => {
    const checkouts = [
      {
        id: 11,
        patron_name: 'Priya Nair',
        book_id: 1,
        date: '2026-02-15',
        notes: 'Due back in 3 weeks',
      },
    ]

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => checkouts,
    } as Response)

    const result = await listBookCheckouts(1)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/books/1/checkouts',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual(checkouts)
  })

  test('createCheckout calls POST /checkouts with JSON payload', async () => {
    const payload = {
      patron_name: 'Marcus Webb',
      book_id: '1',
      date: '2026-02-20',
      notes: 'Renewed once already',
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 12, ...payload, book_id: 1 }),
    } as Response)

    const created = await createCheckout(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/checkouts',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      }),
    )
    expect(created).toEqual({ id: 12, ...payload, book_id: 1 })
  })
})
