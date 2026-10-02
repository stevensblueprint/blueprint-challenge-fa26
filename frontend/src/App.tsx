import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { listBooks, getBook, listBookCheckouts, createBook, createCheckout } from './api/api'
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

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [bookCheckouts, setBookCheckouts] = useState<Checkout[]>([])
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<Genre | 'All'>('All')
  const [bookForm, setBookForm] = useState<BookFormValues>(initialBookForm)
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormValues>(initialCheckoutForm)
  const [error, setError] = useState<string | null>(null)

  const [loadingBooks, setLoadingBooks] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [savingBook, setSavingBook] = useState(false)
  const [savingCheckout, setSavingCheckout] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const selectionRequest = useRef(0)
  const catalogRequest = useRef(0)
  const selectedId = useRef<number | null>(null)
  const bookPending = useRef(false)
  const checkoutPending = useRef(false)

  function errorMessage(reason: unknown) {
    return reason instanceof Error ? reason.message : 'Request failed. Please try again.'
  }

  const handleLoadBooks = useCallback(async () => {
    const request = ++catalogRequest.current
    setLoadingBooks(true)
    setError(null)
    try {
      const savedBooks = await listBooks()
      if (request === catalogRequest.current) setBooks(savedBooks)
    } catch (reason) {
      if (request === catalogRequest.current) setError(errorMessage(reason))
    } finally {
      if (request === catalogRequest.current) setLoadingBooks(false)
    }
  }, [])

  useEffect(() => {
    const catalog = catalogRequest
    const selection = selectionRequest
    void handleLoadBooks()
    return () => {
      catalog.current++
      selection.current++
      selectedId.current = null
    }
  }, [handleLoadBooks])

  async function handleSelectBook(bookId: number) {
    const request = ++selectionRequest.current
    selectedId.current = bookId
    setSelectedBook(null)
    setBookCheckouts([])
    setLoadingDetails(true)
    setError(null)
    // Do not change the submitted form while its request is pending.
    if (!checkoutPending.current) {
      setCheckoutForm((current) => ({ ...current, book_id: String(bookId) }))
    }
    try {
      const [book, checkouts] = await Promise.all([getBook(bookId), listBookCheckouts(bookId)])
      if (request !== selectionRequest.current) return
      setSelectedBook(book)
      setBookCheckouts(checkouts)
    } catch (reason) {
      if (request === selectionRequest.current) setError(errorMessage(reason))
    } finally {
      if (request === selectionRequest.current) setLoadingDetails(false)
    }
  }

  function handleBookFormChange(next: BookFormValues) {
    setBookForm(next)
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    setCheckoutForm(next)
  }

  async function handleCreateBook() {
    if (bookPending.current) return
    bookPending.current = true
    setSavingBook(true)
    setError(null)
    setNotice(null)
    try {
      const book = await createBook(bookForm)
      // Ignore an older catalog load that could otherwise erase the new book.
      catalogRequest.current++
      setLoadingBooks(false)
      setBooks((current) => [...current.filter((item) => item.id !== book.id), book])
      setBookForm({ ...initialBookForm })
      setSearch('')
      setGenreFilter('All')
      setNotice(`Created "${book.title}".`)
      await handleSelectBook(book.id)
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      bookPending.current = false
      setSavingBook(false)
    }
  }

  async function handleCreateCheckout() {
    if (checkoutPending.current) return
    if (!checkoutForm.book_id) {
      setError('Select a book for the checkout.')
      return
    }
    checkoutPending.current = true
    setSavingCheckout(true)
    setError(null)
    setNotice(null)
    try {
      const checkout = await createCheckout(checkoutForm)
      setCheckoutForm((current) => ({ ...current, patron_name: '', notes: '' }))
      setNotice('Checkout created.')
      // Refresh only if the user is still viewing the submitted book.
      // A later selection increments the request token and invalidates this fetch.
      if (selectedId.current === checkout.book_id) {
        const request = ++selectionRequest.current
        setLoadingDetails(true)
        try {
          const [book, checkouts] = await Promise.all([
            getBook(checkout.book_id), listBookCheckouts(checkout.book_id),
          ])
          if (request === selectionRequest.current) {
            setSelectedBook(book)
            setBookCheckouts(checkouts)
          }
        } catch (reason) {
          if (request === selectionRequest.current) {
            setError(`Checkout saved, but history could not refresh: ${errorMessage(reason)}`)
          }
        } finally {
          if (request === selectionRequest.current) setLoadingDetails(false)
        }
      }
    } catch (reason) {
      setError(errorMessage(reason))
    } finally {
      checkoutPending.current = false
      setSavingCheckout(false)
    }
  }

  // Keep the full catalog for checkout choices when the visible list is filtered.
  const visibleBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.toLowerCase()) &&
    (genreFilter === 'All' || book.genre === genreFilter),
  )

  return (
    <main className="layout">
      <header>
        <h1>LibraryConnect Resource Hub</h1>
        <p>Manage books and patron checkouts.</p>
      </header>

      {error ? <p className="error" role="alert">{error}</p> : null}

      {notice ? <p role="status">{notice}</p> : null}
      <button disabled={loadingBooks} onClick={() => void handleLoadBooks()}>
        {loadingBooks ? 'Loading books…' : 'Reload Books'}
      </button>
      {loadingBooks ? <p role="status">Loading books…</p> : null}

      <BookList
        books={visibleBooks}
        loading={loadingBooks}
        search={search}
        genreFilter={genreFilter}
        onSearchChange={setSearch}
        onGenreChange={setGenreFilter}
        onSelectBook={(bookId) => void handleSelectBook(bookId)}
        genres={GENRES}
      />

      <BookForm
        values={bookForm}
        submitting={savingBook}
        genres={GENRES}
        onChange={handleBookFormChange}
        onSubmit={() => void handleCreateBook()}
      />

      <BookDetail book={selectedBook} checkouts={bookCheckouts} loading={loadingDetails} />

      <CheckoutForm
        values={checkoutForm}
        submitting={savingCheckout}
        books={books}
        onChange={handleCheckoutFormChange}
        onSubmit={() => void handleCreateCheckout()}
      />
    </main>
  )
}

export default App
