import { useEffect, useRef, useState } from 'react'
import './App.css'
import { createBook, createCheckout, getBook, listBookCheckouts, listBooks } from './api/api'
import CheckoutForm from './components/CheckoutForm'
import BookDetail from './components/BookDetail'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import {
  GENRES,
  type Genre,
  type Checkout,
  type CheckoutFormValues,
  type Book,
  type BookFormValues,
  type FormFeedback,
} from './types'

const initialBookForm: BookFormValues = {
  title: '',
  genre: 'Fiction',
  description: '',
  author: '',
  publisher_email: '',
  shelf_location: '',
}

// Today's date as YYYY-MM-DD in the librarian's own time zone.
// (toISOString() uses UTC, which is already "tomorrow" in the evening in the US.)
function todayLocal(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function emptyCheckoutForm(bookId = ''): CheckoutFormValues {
  return { patron_name: '', book_id: bookId, date: todayLocal(), notes: '' }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [booksLoaded, setBooksLoaded] = useState(false)
  // Bumped after a book is created, to make the list load again.
  const [reloadCount, setReloadCount] = useState(0)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [bookCheckouts, setBookCheckouts] = useState<Checkout[]>([])
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<Genre | 'All'>('All')
  const [bookForm, setBookForm] = useState<BookFormValues>(initialBookForm)
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormValues>(emptyCheckoutForm)
  const [error, setError] = useState<string | null>(null)
  const [bookFeedback, setBookFeedback] = useState<FormFeedback | null>(null)
  const [checkoutFeedback, setCheckoutFeedback] = useState<FormFeedback | null>(null)
  // The id of the book the user clicked most recently.
  const latestSelection = useRef<number | null>(null)

  // Load the book list when the page opens, and again whenever the search
  // text or genre filter changes or a book is added.
  useEffect(() => {
    // If the search changes again before this answer arrives, the answer is
    // out of date and must not replace the newer one.
    let outdated = false

    async function loadBooks() {
      try {
        const result = await listBooks({ q: search, genre: genreFilter })
        if (outdated) return
        setBooks(result)
        setError(null)
      } catch (loadError) {
        if (outdated) return
        setError(errorText(loadError))
      }
      setBooksLoaded(true)
    }

    void loadBooks()
    return () => {
      outdated = true
    }
  }, [search, genreFilter, reloadCount])

  async function handleSelectBook(bookId: number) {
    latestSelection.current = bookId
    setError(null)
    try {
      const [book, checkouts] = await Promise.all([getBook(bookId), listBookCheckouts(bookId)])
      // Ignore this answer if the user has clicked a different book meanwhile.
      if (latestSelection.current !== bookId) return
      setSelectedBook(book)
      setBookCheckouts(checkouts)
      // Prefill the checkout form with the book that is on screen.
      setCheckoutForm((current) => ({ ...current, book_id: String(book.id) }))
      setCheckoutFeedback(null)
    } catch (selectError) {
      if (latestSelection.current !== bookId) return
      setError(errorText(selectError))
    }
  }

  function handleBookFormChange(next: BookFormValues) {
    setBookForm(next)
    setBookFeedback(null)
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    setCheckoutForm(next)
    setCheckoutFeedback(null)
  }

  async function handleCreateBook() {
    setBookFeedback({ kind: 'saving', message: 'Saving book...' })
    try {
      const created = await createBook(bookForm)
      setBookForm(initialBookForm)
      setBookFeedback({ kind: 'success', message: `Saved "${created.title}" to the catalog.` })
      setReloadCount((count) => count + 1)
    } catch (createError) {
      setBookFeedback({ kind: 'error', message: errorText(createError) })
    }
  }

  async function handleCreateCheckout() {
    setCheckoutFeedback({ kind: 'saving', message: 'Saving checkout...' })
    try {
      const created = await createCheckout(checkoutForm)
      // Show the new checkout straight away if its book is the one on screen.
      if (selectedBook && created.book_id === selectedBook.id) {
        setBookCheckouts((current) => [...current, created])
      }
      // Clear the form but keep the same book chosen for the next patron.
      setCheckoutForm(emptyCheckoutForm(checkoutForm.book_id))
      setCheckoutFeedback({
        kind: 'success',
        message: `Checkout recorded for ${created.patron_name}.`,
      })
    } catch (createError) {
      setCheckoutFeedback({ kind: 'error', message: errorText(createError) })
    }
  }

  // Keep the selected book in the checkout dropdown even when the current
  // search hides it from the list.
  const checkoutBooks =
    selectedBook && !books.some((book) => book.id === selectedBook.id)
      ? [selectedBook, ...books]
      : books

  return (
    <main className="layout">
      <header>
        <h1>LibraryConnect Resource Hub</h1>
        <p>Find books in the catalog, record checkouts, and add new books.</p>
      </header>

      {error ? (
        <p className="error" role="alert">
          {error}
        </p>
      ) : null}

      <BookList
        books={books}
        search={search}
        genreFilter={genreFilter}
        onSearchChange={setSearch}
        onGenreChange={setGenreFilter}
        onSelectBook={(bookId) => void handleSelectBook(bookId)}
        genres={GENRES}
        loading={!booksLoaded}
      />

      <BookDetail book={selectedBook} checkouts={bookCheckouts} />

      <CheckoutForm
        values={checkoutForm}
        books={checkoutBooks}
        onChange={handleCheckoutFormChange}
        onSubmit={() => void handleCreateCheckout()}
        feedback={checkoutFeedback}
      />

      <BookForm
        values={bookForm}
        genres={GENRES}
        onChange={handleBookFormChange}
        onSubmit={() => void handleCreateBook()}
        feedback={bookFeedback}
      />
    </main>
  )
}

export default App
