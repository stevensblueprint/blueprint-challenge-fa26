import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'

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

    render(
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
        search=""
        genreFilter="All"
        onSearchChange={onSearchChange}
        onGenreChange={onGenreChange}
        onSelectBook={onSelectBook}
        genres={['Fiction', 'Reference']}
      />,
    )

    expect(screen.getByRole('heading', { name: /books/i })).toBeInTheDocument()
    expect(screen.getByText('The Hobbit')).toBeInTheDocument()

    await user.type(screen.getByLabelText(/search/i), 'hobbit')
    expect(onSearchChange).toHaveBeenLastCalledWith('hobbit')

    await user.selectOptions(screen.getByLabelText(/genre/i), 'Reference')
    expect(onGenreChange).toHaveBeenLastCalledWith('Reference')

    await user.click(screen.getByRole('button', { name: /view details/i }))
    expect(onSelectBook).toHaveBeenCalledWith(1)
  })

  test('BookForm submits edited field values', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    const onSubmit = jest.fn()

    render(
      <BookForm
        values={{
          title: '',
          genre: 'Fiction',
          description: '',
          author: '',
          publisher_email: '',
          shelf_location: '',
        }}
        genres={['Fiction', 'Children']}
        onChange={onChange}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText(/^title$/i), 'Where the Wild Things Are')
    expect(onChange).toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText(/^genre$/i), 'Children')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        genre: 'Children',
      }),
    )

    await user.click(screen.getByRole('button', { name: /create book/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
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
    const onChange = jest.fn()
    const onSubmit = jest.fn()

    render(
      <CheckoutForm
        values={{ patron_name: '', book_id: '', date: '2026-02-21', notes: '' }}
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
        onChange={onChange}
        onSubmit={onSubmit}
      />,
    )

    await user.type(screen.getByLabelText(/patron name/i), 'Marcus Webb')
    expect(onChange).toHaveBeenCalled()

    await user.selectOptions(screen.getByLabelText(/^book$/i), '1')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        book_id: '1',
      }),
    )

    await user.click(screen.getByRole('button', { name: /create checkout/i }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })
})
