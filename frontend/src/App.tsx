import { useState } from 'react'
import './App.css'
import CheckoutForm from './components/CheckoutForm'
import BookDetail from './components/BookDetail'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import { GENRES, type Genre, type Checkout, type CheckoutFormValues, type Book, type BookFormValues } from './types'
import { listBooks, getBook, createBook, listBookCheckouts, createCheckout, } from './api/api'

const initialBookForm: BookFormValues = {
  title: '',
  genre: 'Fiction',
  description: '',
  author: '',
  publisher_email: '',
  shelf_location: '',
}

const initialCheckoutForm: CheckoutFormValues = {
  patron_name: '',
  book_id: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [bookCheckouts, setBookCheckouts] = useState<Checkout[]>([])
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<Genre | 'All'>('All')
  const [bookForm, setBookForm] = useState<BookFormValues>(initialBookForm)
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormValues>(initialCheckoutForm)
  const [error, setError] = useState<string | null>(null)
  const [bookSubmitting, setBookSubmitting] = useState(false)
  const [bookSuccess, setBookSuccess] = useState(false)
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  async function handleLoadBooks() {
    try {
      setError(null)

      const loadedBooks = await listBooks({
        q: search,
        genre: genreFilter,
      })

      setBooks(loadedBooks)
    } catch {
      setError('Failed to load books')
    }
  }

  async function handleSelectBook(bookId: number) {
    try {
      setError(null)

      const book = await getBook(bookId)
      const checkouts = await listBookCheckouts(bookId)

      setSelectedBook(book)
      setBookCheckouts(checkouts)
      setCheckoutForm({
        ...initialCheckoutForm,
        book_id: String(bookId),
      })
    } catch {
      setError('Failed to load book details')
    }
  }

  function handleBookFormChange(next: BookFormValues) {
    setBookForm(next)
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    setCheckoutForm(next)
  }

  async function handleCreateBook() {
    try {
      setError(null)
      setBookSubmitting(true)
      setBookSuccess(false)

      const newBook = await createBook(bookForm)

      setBooks((currentBooks) => [...currentBooks, newBook])
      setBookForm(initialBookForm)
      setBookSuccess(true)
    } catch {
      setError('Failed to create book')
    } finally {
      setBookSubmitting(false)
    }
  }

  async function handleCreateCheckout() {
    try {
      setError(null)
      setCheckoutSubmitting(true)
      setCheckoutSuccess(false)

      const newCheckout = await createCheckout(checkoutForm)

      setBookCheckouts((currentCheckouts) => [
        ...currentCheckouts,
        newCheckout,
      ])

      setCheckoutForm({
        ...initialCheckoutForm,
        book_id: selectedBook ? String(selectedBook.id) : '',
      })

      setCheckoutSuccess(true)
    } catch {
      setError('Failed to create checkout')
    } finally {
      setCheckoutSubmitting(false)
    }
  }

  return (
    <main className="layout">
      <header>
        <h1>LibraryConnect Resource Hub</h1>
        <p>Starter frontend scaffold with TODOs for API integration.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <h2>Integration TODO</h2>
        <p>
          Route handlers, form wiring, and API calls are intentionally left as TODOs for the team.
        </p>
        <button onClick={() => void handleLoadBooks()}>Load Books (TODO API)</button>
      </section>

      <BookList
        books={books}
        search={search}
        genreFilter={genreFilter}
        onSearchChange={setSearch}
        onGenreChange={setGenreFilter}
        onSelectBook={(bookId) => void handleSelectBook(bookId)}
        genres={GENRES}
      />

      <BookForm
        values={bookForm}
        genres={GENRES}
        onChange={handleBookFormChange}
        onSubmit={() => void handleCreateBook()}
        submitting={bookSubmitting}
        success={bookSuccess}
      />

      <BookDetail book={selectedBook} checkouts={bookCheckouts} />

      <CheckoutForm
        values={checkoutForm}
        books={books}
        onChange={handleCheckoutFormChange}
        onSubmit={() => void handleCreateCheckout()}
        submitting={checkoutSubmitting}
        success={checkoutSuccess}
      />
    </main>
  )
}

export default App
