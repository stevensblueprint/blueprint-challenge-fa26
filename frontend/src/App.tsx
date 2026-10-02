import { useEffect, useRef, useState } from 'react'
import { motion, MotionConfig, useReducedMotion } from 'motion/react'
import Icon from './components/Icon'
import ActionButton from './components/ActionButton'
import Feedback from './components/Feedback'
import './App.css'
import { listBooks } from './api/api'
import BookList from './components/BookList'
import LibraryEntrance from './components/LibraryEntrance'
import CatalogSummary from './components/CatalogSummary'
import BookPage from './pages/BookPage'
import NewBookPage from './pages/NewBookPage'
import { navigate, usePath } from './navigation'
import { GENRES, type Genre, type Book } from './types'

function App() {
  const path = usePath()
  const reduceMotion = useReducedMotion()
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState<Genre | 'All'>('All')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [loadVersion, setLoadVersion] = useState(0)
  const [notice, setNotice] = useState('')
  const main = useRef<HTMLElement>(null)
  const bookRoute = /^\/books\/([1-9]\d*)(\/checkout)?$/.exec(path)
  const isEntrance = path === '/'
  const isCatalog = path === '/books'
  const [enteringCatalog, setEnteringCatalog] = useState(false)
  const catalog = useRef<HTMLDivElement>(null)
  const isNewBook = path === '/books/new'

  useEffect(() => {
    let active = true
    listBooks().then((result) => {
      if (active) setBooks(result)
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Could not load the catalog.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [loadVersion])

  useEffect(() => {
    if (path !== '/' && !enteringCatalog) main.current?.focus({ preventScroll: true })
    document.documentElement.scrollTop = 0
    document.title = `${path === '/books/new' ? 'Add a book' : path.endsWith('/checkout') ? 'Record a checkout' : path === '/' ? 'Reading room' : path === '/books' ? 'Catalog' : 'Book details'} · LibraryConnect`
  }, [path, enteringCatalog])

  function bookCreated(book: Book) {
    setLoadError('')
    setLoading(true)
    setLoadVersion((version) => version + 1)
    setBooks((current) => [...current, book])
    setSearch('')
    setGenreFilter('All')
    setNotice(`Added ${book.title} to the catalog.`)
    navigate('/books')
  }

  const visibleBooks = books.filter((book) =>
    book.title.toLowerCase().includes(search.trim().toLowerCase()) &&
    (genreFilter === 'All' || book.genre === genreFilter))
  const genreCount = new Set(books.map((book) => book.genre)).size
  const authorCount = new Set(books.map(book => book.author.trim().toLowerCase())).size
  const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`
  const collectionLine = loading ? 'Counting the shelves…' : loadError ? 'The catalog could not be reached just now.'
    : books.length === 0 ? 'Nothing has been cataloged yet. Every book added here gets a record and a place on the shelf.'
    : `${plural(books.length, 'title')} by ${plural(authorCount, 'author')}, shelved across ${plural(genreCount, 'genre')}.`
  const section = isCatalog || bookRoute ? 'catalog' : isNewBook ? 'new' : null
  const ribbon = <motion.span className="nav-ribbon" layoutId="nav-ribbon" aria-hidden="true" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
    <div className={`app-shell${isEntrance ? ' at-entrance' : ''}`}>
      {!isEntrance && <><a className="skip-link" href="#main-content" onClick={(event) => { event.preventDefault(); main.current?.focus() }}>Skip to content</a>
      <header className="app-header" inert={enteringCatalog}>
        <a className="brand" href="#/" aria-label="LibraryConnect reading room">LibraryConnect</a>
        <nav aria-label="Main navigation">
          <a href="#/">Reading room</a>
          <a href="#/books" aria-current={section === 'catalog' ? 'page' : undefined}>Catalog{section === 'catalog' && ribbon}</a>
          <a href="#/books/new" aria-current={section === 'new' ? 'page' : undefined}>Add a book{section === 'new' && ribbon}</a>
        </nav>
      </header></>}

      {(isEntrance || enteringCatalog) && <LibraryEntrance transitioning={enteringCatalog}
        onReveal={() => { setEnteringCatalog(true); navigate('/books') }}
        onComplete={() => setEnteringCatalog(false)} />}
      {!isEntrance && <>
      <main className={`layout${isCatalog ? ' is-spread' : ''}`} inert={enteringCatalog} id="main-content" ref={main} tabIndex={-1}>
        <motion.div key={isCatalog ? 'catalog' : isNewBook ? 'new-book' : bookRoute ? `book-${bookRoute[1]}` : 'missing'}
          className="page-content" initial={enteringCatalog ? false : { opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.26 }}>
        {isCatalog ? <div ref={catalog} className="catalog-destination" tabIndex={-1} aria-label="Library catalog">
          <div className="spread-left">
            <h1>Find your next chapter.</h1>
            <p className="collection-line">{collectionLine}</p>
            <CatalogSummary books={books} loading={loading} unavailable={!!loadError} selectedGenre={genreFilter} onSelectGenre={setGenreFilter} />
          </div>
          <div className="spread-right">
            <Feedback message={notice} />
            {loadError && <div className="error" role="alert">
              <p className="message-line"><Icon name="error" />{loadError}</p>
              <ActionButton onClick={() => { setLoading(true); setLoadError(''); setLoadVersion((version) => version + 1) }}>Retry loading books</ActionButton>
            </div>}
            <BookList books={visibleBooks} search={search} genreFilter={genreFilter} onSearchChange={setSearch}
              onGenreChange={setGenreFilter} onSelectBook={(bookId) => navigate(`/books/${bookId}`)} genres={GENRES}
              loading={loading} unavailable={!!loadError} total={books.length} onClearFilters={() => { setSearch(''); setGenreFilter('All') }} />
          </div>
        </div> : isNewBook ? <NewBookPage onCreated={bookCreated} /> : bookRoute ? (
          <BookPage key={bookRoute[1]} bookId={Number(bookRoute[1])} checkout={!!bookRoute[2]} />
        ) : <div className="empty-page">
          <h1>This page isn’t on our shelves.</h1>
          <p>The address may be mistyped, or the record was moved.</p>
          <ActionButton onClick={() => navigate('/books')}>Back to catalog</ActionButton>
        </div>}
        </motion.div>
      </main>
      </>}
    </div>
    </MotionConfig>
  )
}

export default App
