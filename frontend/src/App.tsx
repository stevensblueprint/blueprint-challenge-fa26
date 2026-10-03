import { useState } from 'react'
import './App.css'
import CheckoutForm from './components/CheckoutForm'
import BookDetail from './components/BookDetail'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import { GENRES, type Genre, type Checkout, type CheckoutFormValues, type Book, type BookFormValues } from './types'
import { listBooks, getBook, createBook, listBookCheckouts, createCheckout } from './api/api'

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

  async function handleLoadBooks() {
    // loading book list using src/api/api.ts.
    try {
      setError(null) // clear old errors
      const loadedBooks = await listBooks({ q: search, genre: genreFilter})
      setBooks(loadedBooks)
    }
    
    catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load books')
    }
  }

  async function handleSelectBook(bookId: number) {
    // selected book + checkouts fetch using src/api/api.ts.
    try {
      setError(null) // clear old errors
      const [book, checkouts] = await Promise.all([
        getBook(bookId),
        listBookCheckouts(bookId),
      ])
      setSelectedBook(book)
      setBookCheckouts(checkouts)
      setCheckoutForm((curr) => ({ ...curr, book_id: String(bookId) }))
    }

    catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load book details')
    }
  }

  function handleBookFormChange(next: BookFormValues) {
    // book form state handling.
    setBookForm(next)
    setError(null)
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    // Implement checkout form state handling.
    setCheckoutForm(next)
    setError(null)
  }

  async function handleCreateBook() {
    // book creation flow using src/api/api.ts.
    try {
      setError(null)
      const book = await createBook(bookForm)
      setBooks((curr) => [...curr, book])
      setBookForm(initialBookForm)
      alert(`Book created successfully! ID: ${book.id}, Title: ${book.title}`)
    }

    catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create book')
    }
  }

  async function handleCreateCheckout() {
    // checkout creation flow using src/api/api.ts.
    try {
      setError(null)

      if(!selectedBook) {
        setError('Select a book before creating a checkout.')
        return
      }

      const checkout = await createCheckout(checkoutForm)
      setBookCheckouts((curr) => [...curr, checkout])
      alert(`Checkout created successfully! ID: ${checkout.id}, Book: ${selectedBook?.title}`)
      setCheckoutForm((curr) => ({ ...initialCheckoutForm, book_id: curr.book_id }))
    }

    catch (e) {
      setError(e instanceof Error ? e.message: 'Failed to create checkout')
    }
  }

  return (
    <main className="layout">
      <header>
        <h1>LibraryConnect Resource Hub</h1>
        <p>Manage books, browse the library catalog, and track checkouts</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <h2>Browse Books</h2>
        <p>
          Load the library catalog to browse available books.
        </p>
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
      />

      <BookForm
        values={bookForm}
        genres={GENRES}
        onChange={handleBookFormChange}
        onSubmit={() => void handleCreateBook()}
      />

      <BookDetail book={selectedBook} checkouts={bookCheckouts} />

      <CheckoutForm
        values={checkoutForm}
        books={books}
        onChange={handleCheckoutFormChange}
        onSubmit={() => void handleCreateCheckout()}
      />
    </main>
  )
}

export default App
