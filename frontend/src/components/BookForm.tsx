import { useState, type FormEvent } from 'react'
import type { BookFormValues, Genre } from '../types'

type BookFormProps = {
  values: BookFormValues
  genres: Genre[]
  onChange: (next: BookFormValues) => void
  onSubmit: () => void
  submitting?: boolean
  successMessage?: string | null
  errorMessage?: string | null
}

type BookFormErrors = Partial<Record<keyof BookFormValues, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: BookFormValues): BookFormErrors {
  const errors: BookFormErrors = {}
  if (!values.title.trim()) errors.title = 'Enter a title.'
  if (!values.description.trim()) errors.description = 'Enter a short description.'
  if (!values.author.trim()) errors.author = 'Enter the author.'
  if (!values.publisher_email.trim()) {
    errors.publisher_email = 'Enter the publisher email.'
  } else if (!EMAIL_PATTERN.test(values.publisher_email.trim())) {
    errors.publisher_email = 'Enter a valid email, like name@example.org.'
  }
  if (!values.shelf_location.trim()) errors.shelf_location = 'Enter the shelf location.'
  return errors
}

function BookForm({
  values,
  genres,
  onChange,
  onSubmit,
  submitting = false,
  successMessage = null,
  errorMessage = null,
}: BookFormProps) {
  // Errors stay hidden until the first submit attempt, then update as fields are fixed.
  const [showErrors, setShowErrors] = useState(false)
  const errors = showErrors ? validate(values) : {}

  function update<K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    if (Object.keys(validate(values)).length > 0) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    onSubmit()
  }

  function fieldProps(key: keyof BookFormValues) {
    return {
      'aria-invalid': errors[key] ? true : undefined,
      'aria-describedby': errors[key] ? `book-${key}-error` : undefined,
    }
  }

  function fieldError(key: keyof BookFormValues) {
    return errors[key] ? (
      <p className="field-error" id={`book-${key}-error`}>
        {errors[key]}
      </p>
    ) : null
  }

  return (
    <section className="card">
      <h2>Create Book</h2>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label htmlFor="book-title">Title</label>
        <input
          id="book-title"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
          {...fieldProps('title')}
        />
        {fieldError('title')}

        <label htmlFor="book-genre">Genre</label>
        <select
          id="book-genre"
          value={values.genre}
          onChange={(event) => update('genre', event.target.value as Genre)}
        >
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        <label htmlFor="book-description">Description</label>
        <textarea
          id="book-description"
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
          {...fieldProps('description')}
        />
        {fieldError('description')}

        <label htmlFor="book-author">Author</label>
        <input
          id="book-author"
          value={values.author}
          onChange={(event) => update('author', event.target.value)}
          {...fieldProps('author')}
        />
        {fieldError('author')}

        <label htmlFor="book-publisher-email">Publisher Email</label>
        <input
          id="book-publisher-email"
          type="email"
          value={values.publisher_email}
          onChange={(event) => update('publisher_email', event.target.value)}
          {...fieldProps('publisher_email')}
        />
        {fieldError('publisher_email')}

        <label htmlFor="book-shelf-location">Shelf Location</label>
        <input
          id="book-shelf-location"
          value={values.shelf_location}
          onChange={(event) => update('shelf_location', event.target.value)}
          placeholder="e.g. FIC-TOL-001"
          {...fieldProps('shelf_location')}
        />
        {fieldError('shelf_location')}

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            Create Book
          </button>
          {submitting ? <span className="muted">Saving…</span> : null}
        </div>
      </form>

      {successMessage ? (
        <p className="success" role="status">
          {successMessage}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  )
}

export default BookForm
