import { listBooks } from './api'

const originalFetch = globalThis.fetch
const fetchMock = jest.fn()

beforeEach(() => {
  fetchMock.mockReset()
  globalThis.fetch = fetchMock
})

afterEach(() => { globalThis.fetch = originalFetch })

test('reports an unavailable server', async () => {
  fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
  await expect(listBooks()).rejects.toThrow('Could not reach the server')
})

test('reports API error details', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 404, json: async () => ({ detail: 'Book not found' }) })
  await expect(listBooks()).rejects.toThrow('Book not found')
})

test('formats field validation errors', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 422, json: async () => ({
    detail: [{ loc: ['body', 'patron_name'], msg: 'Field required' }],
  }) })
  await expect(listBooks()).rejects.toThrow('patron name: Field required')
})

test('handles a server error without JSON', async () => {
  fetchMock.mockResolvedValue({ ok: false, status: 502, json: async () => { throw new SyntaxError() } })
  await expect(listBooks()).rejects.toThrow('Request failed (502)')
})
