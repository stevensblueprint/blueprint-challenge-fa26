import { useState } from 'react'
import type { CheckoutFormValues, Book, FormFeedback } from '../types'

type CheckoutFormProps = {
  values: CheckoutFormValues
  books: Book[]
  onChange: (next: CheckoutFormValues) => void
  onSubmit: () => void
  feedback?: FormFeedback | null
}

function findProblems(values: CheckoutFormValues, books: Book[]): string[] {
  const problems: string[] = []
  if (!values.patron_name.trim()) problems.push('Patron name is required.')
  // The chosen book has to be one that is actually in the dropdown.
  if (!books.some((book) => String(book.id) === values.book_id)) {
    problems.push('Choose a book.')
  }
  if (!values.date) problems.push('Date is required.')
  return problems
}

function CheckoutForm({ values, books, onChange, onSubmit, feedback = null }: CheckoutFormProps) {
  // Problems stay hidden until the first submit attempt, then update as the user types.
  const [showProblems, setShowProblems] = useState(false)
  const problems = showProblems ? findProblems(values, books) : []
  const saving = feedback?.kind === 'saving'

  function update<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  function handleSubmit() {
    if (findProblems(values, books).length > 0) {
      setShowProblems(true)
      return
    }
    setShowProblems(false)
    onSubmit()
  }

  return (
    <section className="card">
      <h2>Create Checkout</h2>

      <div className="form-grid">
        <label htmlFor="checkout-patron-name">Patron Name</label>
        <input
          id="checkout-patron-name"
          maxLength={255}
          value={values.patron_name}
          onChange={(event) => update('patron_name', event.target.value)}
        />

        <label htmlFor="checkout-book">Book</label>
        <select
          id="checkout-book"
          value={values.book_id}
          onChange={(event) => update('book_id', event.target.value)}
        >
          <option value="">Select a book</option>
          {books.map((book) => (
            <option key={book.id} value={String(book.id)}>
              {`${book.id} - ${book.title}`}
            </option>
          ))}
        </select>

        <label htmlFor="checkout-date">Date</label>
        <input
          id="checkout-date"
          type="date"
          value={values.date}
          onChange={(event) => update('date', event.target.value)}
        />

        <label htmlFor="checkout-notes">Notes</label>
        <textarea
          id="checkout-notes"
          value={values.notes}
          onChange={(event) => update('notes', event.target.value)}
        />
      </div>

      {problems.length > 0 ? (
        <ul className="form-problems" role="alert">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}

      <button onClick={handleSubmit} disabled={saving}>
        Create Checkout
      </button>
      {feedback ? (
        <p
          className={`form-feedback ${feedback.kind}`}
          role={feedback.kind === 'error' ? 'alert' : 'status'}
        >
          {feedback.message}
        </p>
      ) : null}
    </section>
  )
}

export default CheckoutForm
