import {
  createReferral,
  createResource,
  getResource,
  listResourceReferrals,
  listResources,
} from './api'

describe('api contract', () => {
  const fetchMock = jest.fn()

  beforeEach(() => {
    fetchMock.mockReset()
    ;(globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock
  })

  test('listResources calls GET /resources with q and category query params', async () => {
    const resources = [
      {
        id: 1,
        name: 'City Food Bank',
        category: 'Food',
        description: 'Food support',
        address: '10 Main St',
        email: 'food@example.org',
        phone: '555-0101',
      },
    ]

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => resources,
    } as Response)

    const result = await listResources({ q: 'food', category: 'Food' })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/resources?q=food&category=Food',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual(resources)
  })

  test('getResource calls GET /resources/{id} and returns parsed payload', async () => {
    const resource = {
      id: 7,
      name: 'North Clinic',
      category: 'Healthcare' as const,
      description: 'Clinic services',
      address: '200 Health Ave',
      email: 'clinic@example.org',
      phone: '555-0202',
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => resource,
    } as Response)

    const result = await getResource(7)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/resources/7',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual(resource)
  })

  test('createResource calls POST /resources with JSON payload', async () => {
    const payload = {
      name: 'Future Jobs Center',
      category: 'Employment' as const,
      description: 'Job training',
      address: '300 Career Rd',
      email: 'jobs@example.org',
      phone: '555-0303',
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3, ...payload }),
    } as Response)

    const created = await createResource(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/resources',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      }),
    )
    expect(created).toEqual({ id: 3, ...payload })
  })

  test('listResourceReferrals calls GET /resources/{id}/referrals', async () => {
    const referrals = [
      {
        id: 11,
        family_name: 'Garcia Family',
        resource_id: 1,
        date: '2026-02-15',
        notes: 'Needs weekly pickup',
      },
    ]

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => referrals,
    } as Response)

    const result = await listResourceReferrals(1)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/resources/1/referrals',
      expect.objectContaining({ method: 'GET' }),
    )
    expect(result).toEqual(referrals)
  })

  test('createReferral calls POST /referrals with JSON payload', async () => {
    const payload = {
      family_name: 'Lopez Family',
      resource_id: '1',
      date: '2026-02-20',
      notes: 'Follow up in 1 week',
    }

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 12, ...payload, resource_id: 1 }),
    } as Response)

    const created = await createReferral(payload)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8000/referrals',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload),
      }),
    )
    expect(created).toEqual({ id: 12, ...payload, resource_id: 1 })
  })
})
