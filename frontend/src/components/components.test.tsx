import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

import ReferralForm from './ReferralForm'
import ResourceDetail from './ResourceDetail'
import ResourceForm from './ResourceForm'
import ResourceList from './ResourceList'

describe('component behavior contracts', () => {
  test('ResourceList renders resources, supports search/filter, and selection callback', async () => {
    const user = userEvent.setup()
    const onSearchChange = jest.fn()
    const onCategoryChange = jest.fn()
    const onSelectResource = jest.fn()

    render(
      <ResourceList
        resources={[
          {
            id: 1,
            name: 'City Food Bank',
            category: 'Food',
            description: 'Food support',
            address: '10 Main St',
            email: 'food@example.org',
            phone: '555-0101',
          },
        ]}
        search=""
        categoryFilter="All"
        onSearchChange={onSearchChange}
        onCategoryChange={onCategoryChange}
        onSelectResource={onSelectResource}
        categories={['Food', 'Healthcare']}
      />,
    )

    expect(screen.getByRole('heading', { name: /resources/i })).toBeInTheDocument()
    expect(screen.getByText('City Food Bank')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search/i), 'food')
    expect(onSearchChange).toHaveBeenLastCalledWith('food')

    await user.selectOptions(screen.getByLabelText(/category/i), 'Healthcare')
    expect(onCategoryChange).toHaveBeenLastCalledWith('Healthcare')

    await user.click(screen.getByRole('button', { name: /view details/i }))
    expect(onSelectResource).toHaveBeenCalledWith(1)
  })

  test('ResourceForm submits edited field values', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const onSubmit = jest.fn()

    render(
      <ResourceForm
        values={{
          name: '',
          category: 'Food',
          description: '',
          address: '',
          email: '',
          phone: '',
        }}
        categories={['Food', 'Employment']}
        onChange={onChange}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText(/^name$/i), 'Future Jobs Center')
    expect(onChange).toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText(/^category$/i), 'Employment')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        category: 'Employment',
      }),
    )

    await user.click(screen.getByRole('button', { name: /create resource/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  test('ResourceDetail shows selected resource data and related referrals', () => {
    render(
      <ResourceDetail
        resource={{
          id: 1,
          name: 'City Food Bank',
          category: 'Food',
          description: 'Food support',
          address: '10 Main St',
          email: 'food@example.org',
          phone: '555-0101',
        }}
        referrals={[
          {
            id: 12,
            family_name: 'Lopez Family',
            resource_id: 1,
            date: '2026-02-20',
            notes: 'Follow up in 1 week',
          },
        ]}
      />,
    )

    expect(screen.getByText('City Food Bank')).toBeInTheDocument()
    expect(screen.getByText(/food support/i)).toBeInTheDocument()
    expect(screen.getByText(/lopez family/i)).toBeInTheDocument()
    expect(screen.getByText(/follow up in 1 week/i)).toBeInTheDocument()
  })

  test('ReferralForm captures user inputs and submits', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const onSubmit = jest.fn()

    render(
      <ReferralForm
        values={{ family_name: '', resource_id: '', date: '2026-02-21', notes: '' }}
        resources={[
          {
            id: 1,
            name: 'City Food Bank',
            category: 'Food',
            description: 'Food support',
            address: '10 Main St',
            email: 'food@example.org',
            phone: '555-0101',
          },
        ]}
        onChange={onChange}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText(/family name/i), 'Garcia Family')
    expect(onChange).toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText(/^resource$/i), '1')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        resource_id: '1',
      }),
    )

    await user.click(screen.getByRole('button', { name: /create referral/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
