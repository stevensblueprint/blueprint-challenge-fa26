import type { BookFormValues, Genre } from '../types'

type BookFormProps = {
  values: BookFormValues
  genres: Genre[]
  onChange: (next: BookFormValues) => void
  onSubmit: () => void
  submitting?: boolean
  success?: boolean
}

function BookForm({ values, genres, onChange, onSubmit, submitting=false, success=false }: BookFormProps) {
  function update<K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  function handleSubmit() {
    if (
      !values.title.trim() ||
      !values.description.trim() ||
      !values.author.trim() ||
      !values.publisher_email.trim() ||
      !values.shelf_location.trim()
    ) {
      return
    }

    onSubmit()
  }

  return (
    <section className="card">
      <h2>Create Book</h2>

      <div className="form-grid">
        <label htmlFor="book-title">Title</label>
        <input
          id="book-title"
          value={values.title}
          onChange={(event) => update('title', event.target.value)}
        />

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
        />

        <label htmlFor="book-author">Author</label>
        <input
          id="book-author"
          value={values.author}
          onChange={(event) => update('author', event.target.value)}
        />

        <label htmlFor="book-publisher-email">Publisher Email</label>
        <input
          id="book-publisher-email"
          type="email"
          value={values.publisher_email}
          onChange={(event) => update('publisher_email', event.target.value)}
        />

        <label htmlFor="book-shelf-location">Shelf Location</label>
        <input
          id="book-shelf-location"
          value={values.shelf_location}
          onChange={(event) => update('shelf_location', event.target.value)}
        />
      </div>

      <button onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Book'}
      </button>

      {success ? <p>Book created successfully!</p> : null}
    </section>
  )
}

export default BookForm
