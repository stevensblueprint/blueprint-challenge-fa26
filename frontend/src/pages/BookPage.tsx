import Spinner from '../components/Spinner'
import { motion, useReducedMotion } from 'motion/react'
import Icon from '../components/Icon'
import ActionButton from '../components/ActionButton'
import Feedback from '../components/Feedback'
import { useEffect, useState } from 'react'
import * as api from '../api/api'
import BookDetail from '../components/BookDetail'
import BookCover from '../components/BookCover'
import CheckoutForm from '../components/CheckoutForm'
import { navigate } from '../navigation'
import type { Book, Checkout, CheckoutFormValues } from '../types'

function newCheckout(bookId: number): CheckoutFormValues {
  const today = new Date()
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  return { patron_name: '', book_id: String(bookId), date, notes: '' }
}

type BookPageProps = { bookId: number; checkout: boolean }

export default function BookPage({ bookId, checkout }: BookPageProps) {
  const reduceMotion = useReducedMotion()
  const [book, setBook] = useState<Book | null>(null)
  const [checkouts, setCheckouts] = useState<Checkout[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [reload, setReload] = useState(0)
  const [form, setForm] = useState(() => newCheckout(bookId))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([api.getBook(bookId), api.listBookCheckouts(bookId)]).then(([book, history]) => {
      if (!active) return
      setBook(book)
      setCheckouts(history)
    }).catch((error: unknown) => {
      if (active) setLoadError(error instanceof Error ? error.message : 'Could not load this book.')
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [bookId, reload])

  async function saveCheckout() {
    if (saving || !book) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const created = await api.createCheckout({
        ...form, book_id: String(book.id), patron_name: form.patron_name.trim(), notes: form.notes.trim(),
      })
      setCheckouts((current) => [...current, created].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id))
      setForm(newCheckout(bookId))
      setNotice(`Checkout recorded for ${created.patron_name}.`)
      navigate(`/books/${bookId}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save the checkout. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ActionButton className="back-link" disabled={saving} onClick={() => navigate(checkout ? `/books/${bookId}` : '/books')}>
        <Icon name="back" />{checkout ? 'Back to book details' : 'Back to catalog'}
      </ActionButton>
      {checkout ? <div className="page-heading">
        <h1>Record a checkout</h1>
        <p>Add the borrower and date to this book’s card. It stays with the book’s history.</p>
      </div> : <h1 className="visually-hidden">Book details</h1>}
      <Feedback message={notice} />
      <Feedback message={error} error />
      {loading && <div className="loading-panel" role="status"><Spinner />Loading book details…</div>}
      {loadError && <div className="error" role="alert">
        <p className="message-line"><Icon name="error" />{loadError}</p>
        <ActionButton onClick={() => { setLoading(true); setLoadError(''); setReload((current) => current + 1) }}>Retry book details</ActionButton>
      </div>}
      {!loading && !loadError && book && (checkout ? (
        <motion.div key="form" className="form-layout" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}>
          <CheckoutForm values={form} books={[book]} onChange={setForm} onSubmit={() => void saveCheckout()} submitting={saving} lockBook />
          <aside className="selected-book">
            <BookCover book={book} />
            <div>
              <h2>{book.title}</h2>
              <p>{book.author} <span className="genre-name" data-genre={book.genre}>{book.genre}</span></p>
              <span className="call-number" title="Shelf location">{book.shelf_location}</span>
              <p className="lending-count">{checkouts.length ? `Lent ${checkouts.length === 1 ? 'once' : `${checkouts.length} times`} before.` : 'This will be its first checkout.'}</p>
            </div>
          </aside>
        </motion.div>
      ) : (
        <motion.div key="detail" className="detail-layout" initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.94 }} animate={{ opacity: 1, scale: 1 }}>
          <BookCover book={book} large />
          <BookDetail book={book} checkouts={checkouts} onCheckout={() => { setError(''); setNotice(''); navigate(`/books/${bookId}/checkout`) }} />
        </motion.div>
      ))}
    </>
  )
}
