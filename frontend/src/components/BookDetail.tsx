import { motion, useReducedMotion } from 'motion/react'
import Icon from './Icon'
import ActionButton from './ActionButton'
import type { Book, Checkout } from '../types'

type BookDetailProps = {
  book: Book | null
  checkouts: Checkout[]
  loading?: boolean
  onCheckout?: () => void
}

function BookDetail({ book, checkouts, loading = false, onCheckout }: BookDetailProps) {
  const reduceMotion = useReducedMotion()
  if (!book) {
    return (
      <section className="card book-detail">
        <h2>Book Details</h2>
        <p role={loading ? 'status' : undefined}>{loading ? 'Loading book details…' : 'Select a book from the list to view details.'}</p>
      </section>
    )
  }

  return (
    <section className="card book-detail">
      <h2>{book.title}</h2>
      <p className="book-byline"><span className="genre-name" data-genre={book.genre}>{book.genre}</span></p>
      <p className="detail-description">{book.description}</p>

      <dl className="record-fields">
        <div><dt>Author</dt><dd>{book.author}</dd></div>
        <div><dt>Publisher Email</dt><dd><a href={`mailto:${book.publisher_email}`}>{book.publisher_email}</a></dd></div>
        <div><dt>Shelf Location</dt><dd><span className="call-number">{book.shelf_location}</span></dd></div>
      </dl>

      <div className="checkout-card">
        <div className="checkout-heading">
          <h3>Checkouts</h3>
          <p>{checkouts.length ? `${checkouts.length} on this card` : 'Never lent'}</p>
          {onCheckout && <ActionButton onClick={onCheckout}><Icon name="plus" size={16} />Record checkout</ActionButton>}
        </div>
        <div className="checkout-columns" aria-hidden="true"><span>Date</span><span>Borrower</span><span>Notes</span></div>
        {checkouts.length === 0 && <p className="checkout-empty">No checkouts recorded for this book yet.</p>}
        <ul className="list">
          {checkouts.map((checkout) => (
            <motion.li key={checkout.id} className="list-item" initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}>
              <span className="checkout-date">{checkout.date}</span>
              <strong>{checkout.patron_name}</strong>
              <p>{checkout.notes || '—'}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default BookDetail
