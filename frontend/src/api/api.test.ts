import {
  createCheckout,
  createBook,
  getBook,
  listBookCheckouts,
  listBooks,
} from './api'

describe('api contract', () => {
  const fetchMock = jest.fn()
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    fetchMock.mockReset()
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  // Compare HTTP semantics rather than query order, JSON key order, header
  // casing, or whether the implementation spells out the default GET method.
  function request() {
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [input, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit?]
    const base = typeof input === 'object' && 'url' in input ? input : undefined
    return {
      url: new URL(base ? base.url : String(input), 'http://localhost:8000'),
      method: (init?.method ?? base?.method ?? 'GET').toUpperCase(),
      headers: new Headers(init?.headers ?? base?.headers),
      json: async () => init?.body != null ? JSON.parse(String(init.body)) : base?.clone().json(),
    }
  }

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

    const sent = request()
    expect(sent.method).toBe('GET')
    expect(sent.url.pathname).toBe('/books')
    expect(sent.url.searchParams.get('q')).toBe('hobbit')
    expect(sent.url.searchParams.get('genre')).toBe('Fiction')
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

    const sent = request()
    expect(sent.method).toBe('GET')
    expect(sent.url.pathname).toBe('/books/7')
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

    const sent = request()
    expect(sent.method).toBe('POST')
    expect(sent.url.pathname).toBe('/books')
    expect(sent.headers.get('content-type')).toMatch(/^application\/json(?:;|$)/i)
    expect(await sent.json()).toEqual(payload)
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

    const sent = request()
    expect(sent.method).toBe('GET')
    expect(sent.url.pathname).toBe('/books/1/checkouts')
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

    const sent = request()
    expect(sent.method).toBe('POST')
    expect(sent.url.pathname).toBe('/checkouts')
    expect(sent.headers.get('content-type')).toMatch(/^application\/json(?:;|$)/i)
    const body = await sent.json()
    expect([payload.book_id, Number(payload.book_id)]).toContain(body.book_id)
    expect({ ...body, book_id: payload.book_id }).toEqual(payload)
    expect(created).toEqual({ id: 12, ...payload, book_id: 1 })
  })

  test.each([undefined, {}, { q: '', genre: 'All' as const }])(
    'listBooks omits inactive filters for %j', async (params) => {
      fetchMock.mockResolvedValue({ ok: true, json: async () => [] })
      expect(await listBooks(params)).toEqual([])
      const sent = request()
      expect(sent.method).toBe('GET')
      expect(sent.url.pathname).toBe('/books')
      expect(sent.url.searchParams.get('q') ?? '').toBe('')
      expect(sent.url.searchParams.get('genre') ?? '').toBe('')
    },
  )

  test('listBooks preserves special characters in a search query', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => [] })
    const q = 'C++ & books? #1'
    await listBooks({ q, genre: 'Non-Fiction' })
    const sent = request()
    expect(sent.url.pathname).toBe('/books')
    expect(sent.url.searchParams.get('q')).toBe(q)
    expect(sent.url.searchParams.get('genre')).toBe('Non-Fiction')
  })
})
