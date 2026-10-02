import type { Book, Checkout } from '../types'

type BookDetailProps = {
  loading?: boolean
  book: Book | null
  checkouts: Checkout[]
}

function BookDetail({ book, checkouts, loading = false }: BookDetailProps) {
  if (loading) {
    return <section className="card"><h2>Book Details</h2><p role="status">Loading details and checkouts…</p></section>
  }

  if (!book) {
    return (
      <section className="card">
        <h2>Book Details</h2>
        <p>Select a book from the list to view details.</p>
      </section>
    )
  }

  return (
    <section className="card">
      <h2>{book.title}</h2>
      <p className="tag">{book.genre}</p>
      <p>{book.description}</p>

      <dl>
        <dt>Author</dt>
        <dd>{book.author}</dd>
        <dt>Publisher Email</dt>
        <dd>{book.publisher_email}</dd>
        <dt>Shelf Location</dt>
        <dd>{book.shelf_location}</dd>
      </dl>

      <h3>Checkouts</h3>
      {checkouts.length === 0 ? <p>No checkouts recorded for this book.</p> : null}
      <ul className="list">
        {checkouts.map((checkout) => (
          <li key={checkout.id} className="list-item">
            <div>
              <strong>{checkout.patron_name}</strong>
              <span className="tag">{checkout.date}</span>
            </div>
            <p>{checkout.notes}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BookDetail
