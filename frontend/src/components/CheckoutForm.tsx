import type { CheckoutFormValues, Book } from '../types'

type CheckoutFormProps = {
  values: CheckoutFormValues
  books: Book[]
  onChange: (next: CheckoutFormValues) => void
  onSubmit: () => void
}

function CheckoutForm({ values, books, onChange, onSubmit }: CheckoutFormProps) {
  // validation for required fields before submit.
  function handleSubmit() {
    const requiredFields = [values.patron_name, values.book_id, values.date]
    if (requiredFields.some((field) => field.trim() === '')) {
      alert('Please fill in all required fields.')
      return
    }
    onSubmit()
  }

  function update<K extends keyof CheckoutFormValues>(key: K, value: CheckoutFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <section className="card">
      <h2>Create Checkout</h2>

      <div className="form-grid">
        {/* TODO: Prefill selected book context when opened from book details. 
        Notes: Selected book prefill is handled by App.tsx when a book is selected. */}
        <label htmlFor="checkout-patron-name">Patron Name</label>
        <input
          id="checkout-patron-name"
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

      <button onClick={handleSubmit}>Create Checkout</button>
      {/* TODO: Show submit state and confirmation after successful creation. 
      Notes: Form submission and successful-creation handling are also managed by App.tsx. */}
    </section>
  )
}

export default CheckoutForm
