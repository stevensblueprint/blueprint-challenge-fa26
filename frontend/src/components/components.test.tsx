import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import type { BookFormValues, CheckoutFormValues, Genre } from '../types'

import CheckoutForm from './CheckoutForm'
import BookDetail from './BookDetail'
import BookForm from './BookForm'
import BookList from './BookList'

describe('component behavior contracts', () => {
  test('BookList renders books, supports search/filter, and selection callback', async () => {
    const user = userEvent.setup()
    const onSearchChange = jest.fn()
    const onGenreChange = jest.fn()
    const onSelectBook = jest.fn()

    function Harness() {
      const [search, setSearch] = useState('')
      const [genreFilter, setGenreFilter] = useState<Genre | 'All'>('All')
      return (
        <BookList
          books={[
            {
              id: 1,
              title: 'The Hobbit',
              genre: 'Fiction',
              description: 'A hobbit goes on an adventure',
              author: 'J.R.R. Tolkien',
              publisher_email: 'contact@allenandunwin.example.org',
              shelf_location: 'FIC-TOL-001',
            },
          ]}
          search={search}
          genreFilter={genreFilter}
          onSearchChange={(next) => { setSearch(next); onSearchChange(next) }}
          onGenreChange={(next) => { setGenreFilter(next); onGenreChange(next) }}
          onSelectBook={onSelectBook}
          genres={['Fiction', 'Reference']}
        />
      )
    }
    render(<Harness />)

    expect(screen.getByRole('heading', { name: /books/i })).toBeInTheDocument()
    expect(screen.getByText('The Hobbit')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search/i), 'hobbit')
    expect(onSearchChange).toHaveBeenLastCalledWith('hobbit')
    expect(screen.getByLabelText(/search/i)).toHaveValue('hobbit')

    await user.selectOptions(screen.getByLabelText(/genre/i), 'Reference')
    expect(onGenreChange).toHaveBeenLastCalledWith('Reference')

    await user.click(screen.getByRole('button', { name: /view details/i }))
    expect(onSelectBook).toHaveBeenCalledWith(1)
  })

  test('BookForm submits edited field values', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    function Harness() {
      const [values, setValues] = useState<BookFormValues>({
        title: '', genre: 'Fiction', description: '', author: '',
        publisher_email: '', shelf_location: '',
      })
      return (
        <BookForm
          values={values}
          genres={['Fiction', 'Children']}
          onChange={setValues}
          onSubmit={() => onSubmit(values)}
        />
      )
    }
    render(<Harness />)

    await user.type(screen.getByLabelText(/^title$/i), 'Where the Wild Things Are')
    await user.selectOptions(screen.getByLabelText(/^genre$/i), 'Children')
    await user.type(screen.getByLabelText(/description/i), 'A boy meets monsters')
    await user.type(screen.getByLabelText(/author/i), 'Maurice Sendak')
    await user.type(screen.getByLabelText(/publisher email/i), 'books@example.org')
    await user.type(screen.getByLabelText(/shelf location/i), 'CHI-002')

    await user.click(screen.getByRole('button', { name: /create book/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Where the Wild Things Are', genre: 'Children',
      description: 'A boy meets monsters', author: 'Maurice Sendak',
      publisher_email: 'books@example.org', shelf_location: 'CHI-002',
    })
  })

  test('BookDetail shows selected book data and related checkouts', () => {
    render(
      <BookDetail
        book={{
          id: 1,
          title: 'The Hobbit',
          genre: 'Fiction',
          description: 'A hobbit goes on an adventure',
          author: 'J.R.R. Tolkien',
          publisher_email: 'contact@allenandunwin.example.org',
          shelf_location: 'FIC-TOL-001',
        }}
        checkouts={[
          {
            id: 12,
            patron_name: 'Priya Nair',
            book_id: 1,
            date: '2026-02-20',
            notes: 'Due back in 3 weeks',
          },
        ]}
      />,
    )

    expect(screen.getByText('The Hobbit')).toBeInTheDocument()
    expect(screen.getByText(/a hobbit goes on an adventure/i)).toBeInTheDocument()
    expect(screen.getByText(/priya nair/i)).toBeInTheDocument()
    expect(screen.getByText(/due back in 3 weeks/i)).toBeInTheDocument()
  })

  test('CheckoutForm captures user inputs and submits', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    function Harness() {
      const [values, setValues] = useState<CheckoutFormValues>({
        patron_name: '', book_id: '', date: '2026-02-21', notes: '',
      })
      return (
        <CheckoutForm
          values={values}
          books={[
            {
              id: 1,
              title: 'The Hobbit',
              genre: 'Fiction',
              description: 'A hobbit goes on an adventure',
              author: 'J.R.R. Tolkien',
              publisher_email: 'contact@allenandunwin.example.org',
              shelf_location: 'FIC-TOL-001',
            },
          ]}
          onChange={setValues}
          onSubmit={() => onSubmit(values)}
        />
      )
    }
    render(<Harness />)

    await user.type(screen.getByLabelText(/patron name/i), 'Marcus Webb')
    await user.selectOptions(screen.getByLabelText(/^book$/i), '1')
    await user.clear(screen.getByLabelText(/^date$/i))
    await user.type(screen.getByLabelText(/^date$/i), '2026-02-20')
    await user.type(screen.getByLabelText(/notes/i), 'Renewed once')

    await user.click(screen.getByRole('button', { name: /create checkout/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      patron_name: 'Marcus Webb', book_id: '1', date: '2026-02-20', notes: 'Renewed once',
    })
  })
})
