import { useState, type FormEvent } from 'react'
import type { CheckoutFormValues, Book } from '../types'

type CheckoutFormProps = {
  values: CheckoutFormValues
  books: Book[]
  onChange: (next: CheckoutFormValues) => void
  onSubmit: () => void
  submitting?: boolean
  successMessage?: string | null
  errorMessage?: string | null
}

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>

// Matches the backend's String(255) patron_name column.
const MAX_PATRON_NAME = 255

function validate(values: CheckoutFormValues): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {}
  if (!values.patron_name.trim()) {
    errors.patron_name = "Enter the patron's name."
  } else if (values.patron_name.length > MAX_PATRON_NAME) {
    errors.patron_name = `Keep the name under ${MAX_PATRON_NAME} characters.`
  }
  if (!values.book_id) errors.book_id = 'Choose a book.'
  if (!values.date) errors.date = 'Choose a date.'
  return errors
}

function CheckoutForm({
  values,
  books,
  onChange,
  onSubmit,
  submitting = false,
  successMessage = null,
  errorMessage = null,
}: CheckoutFormProps) {
  // Errors stay hidden until the first submit attempt, then update as fields are fixed.
  const [showErrors, setShowErrors] = useState(false)
  const errors = showErrors ? validate(values) : {}

  function update<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
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

  function fieldProps(key: keyof CheckoutFormValues) {
    return {
      'aria-invalid': errors[key] ? true : undefined,
      'aria-describedby': errors[key] ? `checkout-${key}-error` : undefined,
    }
  }

  function fieldError(key: keyof CheckoutFormValues) {
    return errors[key] ? (
      <p className="field-error" id={`checkout-${key}-error`}>
        {errors[key]}
      </p>
    ) : null
  }

  return (
    <section className="card">
      <h2>Create Checkout</h2>
      <p className="muted">Tip: click "View Details" on a book to pre-select it here.</p>

      <form className="form-grid" onSubmit={handleSubmit} noValidate>
        <label htmlFor="checkout-patron-name">Patron Name</label>
        <input
          id="checkout-patron-name"
          value={values.patron_name}
          onChange={(event) => update('patron_name', event.target.value)}
          {...fieldProps('patron_name')}
        />
        {fieldError('patron_name')}

        <label htmlFor="checkout-book">Book</label>
        <select
          id="checkout-book"
          value={values.book_id}
          onChange={(event) => update('book_id', event.target.value)}
          {...fieldProps('book_id')}
        >
          <option value="">Select a book</option>
          {books.map((book) => (
            <option key={book.id} value={String(book.id)}>
              {`${book.id} - ${book.title}`}
            </option>
          ))}
        </select>
        {fieldError('book_id')}

        <label htmlFor="checkout-date">Date</label>
        <input
          id="checkout-date"
          type="date"
          value={values.date}
          onChange={(event) => update('date', event.target.value)}
          {...fieldProps('date')}
        />
        {fieldError('date')}

        <label htmlFor="checkout-notes">Notes</label>
        <textarea
          id="checkout-notes"
          value={values.notes}
          onChange={(event) => update('notes', event.target.value)}
          placeholder="Optional, e.g. due date or condition"
        />

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            Create Checkout
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

export default CheckoutForm
