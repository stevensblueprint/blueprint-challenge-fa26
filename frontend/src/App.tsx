import { useState } from 'react'
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
    void search
    void genreFilter
    void setBooks
    // TODO: Implement book list loading using src/api/api.ts.
    setError('TODO: implement handleLoadBooks in App.tsx')
  }

  async function handleSelectBook(bookId: number) {
    void bookId
    void setSelectedBook
    void setBookCheckouts
    void setCheckoutForm
    // TODO: Implement selected book + checkouts fetch using src/api/api.ts.
    setError('TODO: implement handleSelectBook in App.tsx')
  }

  function handleBookFormChange(next: BookFormValues) {
    void next
    // TODO: Implement book form state handling.
    setError('TODO: implement book form state updates in App.tsx')
  }

  function handleCheckoutFormChange(next: CheckoutFormValues) {
    void next
    // TODO: Implement checkout form state handling.
    setError('TODO: implement checkout form state updates in App.tsx')
  }

  async function handleCreateBook() {
    void bookForm
    void setBookForm
    // TODO: Implement book creation flow using src/api/api.ts.
    setError('TODO: implement handleCreateBook in App.tsx')
  }

  async function handleCreateCheckout() {
    void checkoutForm
    void selectedBook
    void setCheckoutForm
    // TODO: Implement checkout creation flow using src/api/api.ts.
    setError('TODO: implement handleCreateCheckout in App.tsx')
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
