import { useEffect, useRef, useState } from 'react'
import { createBook, createCheckout, getBook, listBookCheckouts, listBooks } from './api/api'
import './App.css'
import CheckoutForm from './components/CheckoutForm'
import BookDetail from './components/BookDetail'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import { GENRES, type Genre, type Checkout, type CheckoutFormValues, type Book, type BookFormValues } from './types'

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

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.'
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
  // Bumping this re-runs the book list effect (e.g. after creating a book).
  const [booksVersion, setBooksVersion] = useState(0)
  const [booksLoading, setBooksLoading] = useState(true)
  const [bookSubmitting, setBookSubmitting] = useState(false)
  const [bookSuccess, setBookSuccess] = useState<string | null>(null)
  const [bookError, setBookError] = useState<string | null>(null)
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [allBooks, setAllBooks] = useState<Book[]>([])
  // Id of the most recently clicked book, so a slow earlier response can't overwrite it.
  const latestSelectedId = useRef<number | null>(null)
  const bookSubmittingRef = useRef(false)
  const checkoutSubmittingRef = useRef(false)

  // Load books on mount and whenever the search, genre, or booksVersion changes.
  useEffect(() => {
    let ignore = false
    setBooksLoading(true)
    listBooks({ q: search, genre: genreFilter })
      .then((result) => {
        if (ignore) return
        setBooks(result)
        setError(null)
      })
      .catch((err: unknown) => {
        if (!ignore) setError(errorText(err))
      })
      .finally(() => {
        if (!ignore) setBooksLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [search, genreFilter, booksVersion])

  // full unfiltered list for the checkoutddropdown, reloads after book is created
  useEffect(() => {
    let ignore = false
    listBooks({ q: '', genre: 'All' })
      .then((result) => {
        if (!ignore) setAllBooks(result)
      })
      .catch((err: unknown) => {
        if (!ignore) setError(errorText(err))
      })
    return () => {
      ignore = true
    }
  }, [booksVersion])

  function handleLoadBooks() {
    setBooksVersion((version) => version + 1)
  }

  async function handleSelectBook(bookId: number) {
    latestSelectedId.current = bookId
    setError(null)
    try {
      const [book, checkouts] = await Promise.all([getBook(bookId), listBookCheckouts(bookId)])
      if (latestSelectedId.current !== bookId) return
      setSelectedBook(book)
      setBookCheckouts(checkouts)
      setCheckoutForm((form) => ({ ...form, book_id: String(bookId) }))
    } catch (err) {
      if (latestSelectedId.current === bookId) setError(errorText(err))
    }
  }

  function handleBookFormChange(next: BookFormValues) {
    setBookForm(next)
    setBookSuccess(null)
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    setCheckoutForm(next)
    setCheckoutSuccess(null)
  }

  async function handleCreateBook() {
    if (bookSubmittingRef.current) return
    bookSubmittingRef.current = true
    setBookSubmitting(true)
    setBookError(null)
    setBookSuccess(null)
    try {
      await createBook(bookForm)
      setBookSuccess(`Added "${bookForm.title}" to the catalog.`)
      setBookForm(initialBookForm)
      setBooksVersion((version) => version + 1)
    } catch (err) {
      setBookError(errorText(err))
    } finally {
      bookSubmittingRef.current = false
      setBookSubmitting(false)
    }
  }

  async function handleCreateCheckout() {
    if (checkoutSubmittingRef.current) return      // new
    checkoutSubmittingRef.current = true
    setCheckoutSubmitting(true)
    setCheckoutError(null)
    setCheckoutSuccess(null)
    try {
      const created = await createCheckout(checkoutForm)
      if (selectedBook && created.book_id === selectedBook.id) {
        setBookCheckouts((checkouts) => [...checkouts, created])
      }
      setCheckoutSuccess(`Checkout recorded for ${checkoutForm.patron_name}.`)
      setCheckoutForm({
        ...initialCheckoutForm,
        book_id: selectedBook ? String(selectedBook.id) : '',
      })
    } catch (err) {
      setCheckoutError(errorText(err))
    } finally {
      checkoutSubmittingRef.current = false
      setCheckoutSubmitting(false)
    }
  }

  return (
    <main className="layout">
      <header>
        <h1>LibraryConnect Resource Hub</h1>
        <p>Manage the catalog and record checkouts</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <button onClick={() => void handleLoadBooks()}>Load Books</button>
      </section>

      <BookList
        books={books}
        search={search}
        genreFilter={genreFilter}
        onSearchChange={setSearch}
        onGenreChange={setGenreFilter}
        onSelectBook={(bookId) => void handleSelectBook(bookId)}
        genres={GENRES}
        loading={booksLoading}
      />

      <BookForm
        values={bookForm}
        genres={GENRES}
        onChange={handleBookFormChange}
        onSubmit={() => void handleCreateBook()}
        submitting={bookSubmitting}
        successMessage={bookSuccess}
        errorMessage={bookError}
      />

      <BookDetail book={selectedBook} checkouts={bookCheckouts} />

      <CheckoutForm
        values={checkoutForm}
        books={allBooks}
        onChange={handleCheckoutFormChange}
        onSubmit={() => void handleCreateCheckout()}
        submitting={checkoutSubmitting}
        successMessage={checkoutSuccess}
        errorMessage={checkoutError}
      />
    </main>
  )
}

export default App
