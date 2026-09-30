import { useState } from 'react'
import './App.css'
import CheckoutForm from './components/CheckoutForm'
import BookDetail from './components/BookDetail'
import BookForm from './components/BookForm'
import BookList from './components/BookList'
import { GENRES, type Genre, type Checkout, type CheckoutFormValues, type Book, type BookFormValues } from './types'

import {
  listBooks,
  getBook,
  createBook,
  listBookCheckouts,
  createCheckout,
} from './api/api'

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
  const [bookError, setBookError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  async function handleLoadBooks() {
    const loadedBooks = await listBooks({ q: search, genre: genreFilter })

    setBooks(loadedBooks)
    setHasSearched(true)
  }

  async function handleSelectBook(bookId: number) {
    const book = await getBook(bookId)
    const checkouts = await listBookCheckouts(bookId)

    setSelectedBook(book)
    setBookCheckouts(checkouts)

    setCheckoutForm((current) => ({
      ...current,
      book_id: String(bookId),
    }))
  }

  function handleBookFormChange(next: BookFormValues) {
    setBookForm(next)
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    setCheckoutForm(next)
  }

  async function handleCreateBook() {
    if (
      !bookForm.title.trim() ||
      !bookForm.description.trim() ||
      !bookForm.author.trim() ||
      !bookForm.publisher_email.trim() ||
      !bookForm.shelf_location.trim()
    ) {
      setBookError('Please complete all book fields.')
      return
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailPattern.test(bookForm.publisher_email)) {
      setBookError('Please enter a valid publisher email address.')
      return
    }

    const createdBook = await createBook(bookForm)

    setBooks((current) => [...current, createdBook])
    setBookForm(initialBookForm)
    setBookError(null)
  }

  async function handleCreateCheckout() {
    if (
      !checkoutForm.patron_name.trim() ||
      !checkoutForm.book_id ||
      !checkoutForm.date ||
      !checkoutForm.notes.trim()
    ) {
      setCheckoutError('Please complete all checkout fields.')
      return
    }

    await createCheckout(checkoutForm)

    if (selectedBook) {
      const checkouts = await listBookCheckouts(selectedBook.id)
      setBookCheckouts(checkouts)
    }

    setCheckoutForm({
      ...initialCheckoutForm,
      book_id: selectedBook ? String(selectedBook.id) : '',
    })

    setCheckoutError(null)
  }

  return (
    <main className="layout">
      <header className="app-header">
        <h1>LibraryConnect Resource Hub</h1>
        <p>Manage the library catalog, view book details, and manage checkouts.</p>
      </header>

      <section className="card catalog-controls">
        <div>
          <h2>Catalog</h2>
          <p>Search the catalog by title or narrow results by genre.</p>
        </div>

        <button onClick={() => void handleLoadBooks()}>Load Books</button>
      </section>

      <div className="dashboard-grid">
        <BookList
          books={books}
          search={search}
          genreFilter={genreFilter}
          onSearchChange={setSearch}
          onGenreChange={setGenreFilter}
          onSelectBook={(bookId) => void handleSelectBook(bookId)}
          genres={GENRES}
          hasSearched={hasSearched}
        />

        <BookDetail
          book={selectedBook}
          checkouts={bookCheckouts}
        />
      </div>

      <div className="forms-grid">
        <div className="form-column">
          <BookForm
            values={bookForm}
            genres={GENRES}
            onChange={handleBookFormChange}
            onSubmit={() => void handleCreateBook()}
          />

          {bookError ? (
            <p className="error form-error">{bookError}</p>
          ) : null}
        </div>

        <div className="form-column">
          <CheckoutForm
            values={checkoutForm}
            books={books}
            onChange={handleCheckoutFormChange}
            onSubmit={() => void handleCreateCheckout()}
          />

          {checkoutError ? (
            <p className="error form-error">{checkoutError}</p>
          ) : null}
        </div>
      </div>
    </main>
  )
}

export default App
