import { motion, useReducedMotion } from 'motion/react'
import Icon from '../components/Icon'
import ActionButton from '../components/ActionButton'
import Feedback from '../components/Feedback'
import { useState } from 'react'
import { createBook } from '../api/api'
import BookForm from '../components/BookForm'
import BookCover from '../components/BookCover'
import { GENRES, type Book, type BookFormValues } from '../types'
import { navigate } from '../navigation'

const emptyForm: BookFormValues = {
  title: '', genre: 'Fiction', description: '', author: '', publisher_email: '', shelf_location: '',
}

export default function NewBookPage({ onCreated }: { onCreated: (book: Book) => void }) {
  const reduceMotion = useReducedMotion()
  const [values, setValues] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (saving) return
    setSaving(true)
    setError('')
    try {
      const book = await createBook({
        ...values, title: values.title.trim(), description: values.description.trim(),
        author: values.author.trim(), publisher_email: values.publisher_email.trim(),
        shelf_location: values.shelf_location.trim(),
      })
      onCreated(book)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not save the book. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ActionButton className="back-link" onClick={() => navigate('/books')} disabled={saving}><Icon name="back" />Back to catalog</ActionButton>
      <div className="page-heading">
        <h1>Add a book</h1>
        <p>Copy the details from the title page. Every field is needed to file the record.</p>
      </div>
      <Feedback message={error} error />
      <motion.div key="form" className="form-layout" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}>
        <BookForm values={values} genres={GENRES} onChange={setValues} onSubmit={() => void save()} submitting={saving} />
        <aside className="record-preview" aria-label="Catalog record preview">
          <p className="preview-caption">How it will be filed</p>
          <div className="preview-card">
            <BookCover book={{ ...values, id: 0, title: values.title || '?' }} />
            <div>
              <strong className="book-title">{values.title.trim() || 'Untitled'}</strong>
              <p className="book-byline">{values.author.trim() || 'Author unknown'} <span className="genre-name" data-genre={values.genre}>{values.genre}</span></p>
              <span className="call-number">{values.shelf_location.trim() || 'Shelf —'}</span>
            </div>
          </div>
          <p className="preview-note">Shelf locations work best as a short code, like FIC-TOL-001, so staff can walk straight to the copy.</p>
        </aside>
      </motion.div>
    </>
  )
}
