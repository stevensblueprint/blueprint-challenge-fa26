import type { Book, Genre } from '../types'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import BookCard from './BookCard'
import Icon from './Icon'
import ActionButton from './ActionButton'
import Spinner from './Spinner'

type BookListProps = {
  books: Book[]
  search: string
  genreFilter: Genre | 'All'
  onSearchChange: (next: string) => void
  onGenreChange: (next: Genre | 'All') => void
  onSelectBook: (id: number) => void
  genres: Genre[]
  loading?: boolean
  unavailable?: boolean
  disabled?: boolean
  total?: number
  onClearFilters?: () => void
}

function EmptyShelf() {
  // A bare shelf with one book left leaning against the bookend.
  return <svg className="empty-shelf" viewBox="0 0 96 40" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
    <rect x="0" y="32" width="96" height="4" fill="#8a6339" /><rect x="0" y="36" width="96" height="2" fill="#5e4126" />
    <rect x="0" y="0" width="3" height="38" fill="#6e4d2c" /><rect x="93" y="0" width="3" height="38" fill="#6e4d2c" />
    <rect x="70" y="18" width="5" height="14" fill="#7d6a52" /><rect x="70" y="18" width="8" height="3" fill="#7d6a52" />
    <g transform="rotate(-14 66 32)"><rect x="56" y="10" width="7" height="22" fill="#4f7a3a" /><rect x="56" y="13" width="7" height="1" fill="#d6b46a" /><rect x="56" y="28" width="7" height="1" fill="#d6b46a" /></g>
  </svg>
}

function BookList({ books, search, genreFilter, onSearchChange, onGenreChange, onSelectBook, genres,
  loading = false, unavailable = false, disabled = false, total, onClearFilters }: BookListProps) {
  const reduceMotion = useReducedMotion()
  const query = search.trim()
  const filtered = !!query || genreFilter !== 'All'
  const scope = [genreFilter !== 'All' && genreFilter, query && `titles matching “${query}”`].filter(Boolean).join(', ')
  return (
    <section className="catalog-section">
      <div className="records-heading">
        <h2>Books</h2>
        {!loading && !unavailable && <p className="result-count">
          {filtered ? `${books.length} of ${total ?? books.length}` : books.length} {books.length === 1 && !filtered ? 'title' : 'titles'}
          {filtered && <span className="result-scope"> · {scope}</span>}
        </p>}
      </div>
      <div className="filters">
        <div className="search-field">
          <label htmlFor="book-search" className="visually-hidden">Search</label>
          <Icon name="search" size={19} />
          <input id="book-search" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by title" type="search" />
        </div>
        <div className="genre-field">
          <label htmlFor="book-genre-filter">Genre</label>
          <select id="book-genre-filter" value={genreFilter} onChange={(event) => onGenreChange(event.target.value as Genre | 'All')}>
            <option value="All">All genres</option>
            {genres.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
          </select>
        </div>
      </div>
      {filtered && onClearFilters && <ActionButton className="clear-filters" onClick={onClearFilters}><Icon name="close" size={15} />Clear filters</ActionButton>}
      {loading && <p className="loading-panel" role="status"><Spinner />Loading books…</p>}
      {!loading && !unavailable && books.length === 0 && <motion.div className="empty" initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}>
        <EmptyShelf />
        <h3>{filtered ? 'No matching titles' : 'The shelves are bare.'}</h3>
        <p>{filtered ? 'Nothing on the shelves matches that. Try another title, or browse a different genre.' : 'Add a book with its author, description and shelf location, and its record will be filed here. Open any record to lend it out.'}</p>
        {!filtered && <a className="button-link" href="#/books/new"><Icon name="plus" size={17} />Add the first book</a>}
      </motion.div>}
      <ul className="book-rows">
        <AnimatePresence>
          {books.map((book, index) => <BookCard key={book.id} book={book} index={index} disabled={disabled} onSelect={onSelectBook} />)}
        </AnimatePresence>
      </ul>
    </section>
  )
}

export default BookList
