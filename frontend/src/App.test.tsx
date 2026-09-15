import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'

import App from './App'
import * as api from './api/api'

jest.mock('./api/api', () => ({
  listResources: jest.fn(),
  getResource: jest.fn(),
  createResource: jest.fn(),
  listResourceReferrals: jest.fn(),
  createReferral: jest.fn(),
}))

const listResourcesMock = api.listResources as jest.MockedFunction<typeof api.listResources>
const getResourceMock = api.getResource as jest.MockedFunction<typeof api.getResource>
const createResourceMock = api.createResource as jest.MockedFunction<typeof api.createResource>
const listResourceReferralsMock = api.listResourceReferrals as jest.MockedFunction<
  typeof api.listResourceReferrals
>
const createReferralMock = api.createReferral as jest.MockedFunction<typeof api.createReferral>

describe('App challenge acceptance tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('loads and displays resources, then applies search and category filters', async () => {
    const user = userEvent.setup()

    listResourcesMock
      .mockResolvedValueOnce([
        {
          id: 1,
          name: 'City Food Bank',
          category: 'Food',
          description: 'Food support',
          address: '10 Main St',
          email: 'food@example.org',
          phone: '555-0101',
        },
        {
          id: 2,
          name: 'North Clinic',
          category: 'Healthcare',
          description: 'Community clinic',
          address: '200 Health Ave',
          email: 'clinic@example.org',
          phone: '555-0202',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 1,
          name: 'City Food Bank',
          category: 'Food',
          description: 'Food support',
          address: '10 Main St',
          email: 'food@example.org',
          phone: '555-0101',
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 2,
          name: 'North Clinic',
          category: 'Healthcare',
          description: 'Community clinic',
          address: '200 Health Ave',
          email: 'clinic@example.org',
          phone: '555-0202',
        },
      ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load resources/i }))

    expect(await screen.findByText('City Food Bank')).toBeInTheDocument()
    expect(screen.getByText('North Clinic')).toBeInTheDocument()
    expect(listResourcesMock).toHaveBeenNthCalledWith(1, { q: '', category: 'All' })

    await user.clear(screen.getByLabelText(/search/i))
    await user.type(screen.getByLabelText(/search/i), 'food')

    await waitFor(() => {
      expect(listResourcesMock).toHaveBeenCalledWith({ q: 'food', category: 'All' })
    })

    await user.selectOptions(screen.getByLabelText(/category filter/i), 'Healthcare')

    await waitFor(() => {
      expect(listResourcesMock).toHaveBeenLastCalledWith({ q: 'food', category: 'Healthcare' })
    })
  })

  test('creates a resource and refreshes the list', async () => {
    const user = userEvent.setup()

    createResourceMock.mockResolvedValue({
      id: 3,
      name: 'Future Jobs Center',
      category: 'Employment',
      description: 'Job training',
      address: '300 Career Rd',
      email: 'jobs@example.org',
      phone: '555-0303',
    })

    listResourcesMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 3,
          name: 'Future Jobs Center',
          category: 'Employment',
          description: 'Job training',
          address: '300 Career Rd',
          email: 'jobs@example.org',
          phone: '555-0303',
        },
      ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load resources/i }))

    await user.type(screen.getByLabelText(/^name$/i), 'Future Jobs Center')
    await user.selectOptions(screen.getByLabelText(/^category$/i), 'Employment')
    await user.type(screen.getByLabelText(/description/i), 'Job training')
    await user.type(screen.getByLabelText(/address/i), '300 Career Rd')
    await user.type(screen.getByLabelText(/contact email/i), 'jobs@example.org')
    await user.type(screen.getByLabelText(/phone/i), '555-0303')

    await user.click(screen.getByRole('button', { name: /create resource/i }))

    expect(createResourceMock).toHaveBeenCalledWith({
      name: 'Future Jobs Center',
      category: 'Employment',
      description: 'Job training',
      address: '300 Career Rd',
      email: 'jobs@example.org',
      phone: '555-0303',
    })

    await waitFor(() => {
      expect(listResourcesMock).toHaveBeenCalledTimes(2)
    })
    expect(await screen.findByText('Future Jobs Center')).toBeInTheDocument()
  })

  test('loads selected resource details with referral history', async () => {
    const user = userEvent.setup()

    listResourcesMock.mockResolvedValue([
      {
        id: 1,
        name: 'City Food Bank',
        category: 'Food',
        description: 'Food support',
        address: '10 Main St',
        email: 'food@example.org',
        phone: '555-0101',
      },
    ])

    getResourceMock.mockResolvedValue({
      id: 1,
      name: 'City Food Bank',
      category: 'Food',
      description: 'Food support',
      address: '10 Main St',
      email: 'food@example.org',
      phone: '555-0101',
    })

    listResourceReferralsMock.mockResolvedValue([
      {
        id: 11,
        family_name: 'Garcia Family',
        resource_id: 1,
        date: '2026-02-15',
        notes: 'Needs weekly pickup',
      },
    ])

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load resources/i }))
    await user.click(screen.getByRole('button', { name: /view details/i }))

    expect(getResourceMock).toHaveBeenCalledWith(1)
    expect(listResourceReferralsMock).toHaveBeenCalledWith(1)
    expect(await screen.findByText(/garcia family/i)).toBeInTheDocument()
  })

  test('creates a referral for a selected resource and refreshes referral list', async () => {
    const user = userEvent.setup()

    listResourcesMock.mockResolvedValue([
      {
        id: 1,
        name: 'City Food Bank',
        category: 'Food',
        description: 'Food support',
        address: '10 Main St',
        email: 'food@example.org',
        phone: '555-0101',
      },
    ])

    getResourceMock.mockResolvedValue({
      id: 1,
      name: 'City Food Bank',
      category: 'Food',
      description: 'Food support',
      address: '10 Main St',
      email: 'food@example.org',
      phone: '555-0101',
    })

    listResourceReferralsMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 12,
          family_name: 'Lopez Family',
          resource_id: 1,
          date: '2026-02-20',
          notes: 'Follow up in 1 week',
        },
      ])

    createReferralMock.mockResolvedValue({
      id: 12,
      family_name: 'Lopez Family',
      resource_id: 1,
      date: '2026-02-20',
      notes: 'Follow up in 1 week',
    })

    render(<App />)

    await user.click(screen.getByRole('button', { name: /load resources/i }))
    await user.click(screen.getByRole('button', { name: /view details/i }))

    await user.type(screen.getByLabelText(/family name/i), 'Lopez Family')
    await user.selectOptions(screen.getByLabelText(/^resource$/i), '1')
    await user.clear(screen.getByLabelText(/date/i))
    await user.type(screen.getByLabelText(/date/i), '2026-02-20')
    await user.type(screen.getByLabelText(/notes/i), 'Follow up in 1 week')

    await user.click(screen.getByRole('button', { name: /create referral/i }))

    expect(createReferralMock).toHaveBeenCalledWith({
      family_name: 'Lopez Family',
      resource_id: '1',
      date: '2026-02-20',
      notes: 'Follow up in 1 week',
    })

    await waitFor(() => {
      expect(listResourceReferralsMock).toHaveBeenCalledTimes(2)
    })
    expect(await screen.findByText(/lopez family/i)).toBeInTheDocument()
  })
})
