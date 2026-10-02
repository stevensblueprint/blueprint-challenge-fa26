import { useState } from 'react'
import type { BookFormValues, FormFeedback, Genre } from '../types'

type BookFormProps = {
  values: BookFormValues
  genres: Genre[]
  onChange: (next: BookFormValues) => void
  onSubmit: () => void
  feedback?: FormFeedback | null
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function findProblems(values: BookFormValues): string[] {
  const problems: string[] = []
  if (!values.title.trim()) problems.push('Title is required.')
  if (!values.description.trim()) problems.push('Description is required.')
  if (!values.author.trim()) problems.push('Author is required.')
  if (!values.publisher_email.trim()) {
    problems.push('Publisher email is required.')
  } else if (!EMAIL_PATTERN.test(values.publisher_email.trim())) {
    problems.push('Publisher email must look like name@example.org.')
  }
  if (!values.shelf_location.trim()) problems.push('Shelf location is required.')
  return problems
}

function BookForm({ values, genres, onChange, onSubmit, feedback = null }: BookFormProps) {
  // Problems stay hidden until the first submit attempt, then update as the user types.
  const [showProblems, setShowProblems] = useState(false)
  const problems = showProblems ? findProblems(values) : []
  const saving = feedback?.kind === 'saving'

  function update<K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  function handleSubmit() {
    if (findProblems(values).length > 0) {
      setShowProblems(true)
      return
    }
    setShowProblems(false)
    onSubmit()
  }

  return (
    <section className="card">
      <h2>Create Book</h2>

      <div className="form-grid">
        <label htmlFor="book-title">Title</label>
        <input
          id="book-title"
          maxLength={255}
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
          maxLength={255}
          value={values.author}
          onChange={(event) => update('author', event.target.value)}
        />

        <label htmlFor="book-publisher-email">Publisher Email</label>
        <input
          id="book-publisher-email"
          type="email"
          maxLength={255}
          value={values.publisher_email}
          onChange={(event) => update('publisher_email', event.target.value)}
        />

        <label htmlFor="book-shelf-location">Shelf Location</label>
        <input
          id="book-shelf-location"
          maxLength={64}
          value={values.shelf_location}
          onChange={(event) => update('shelf_location', event.target.value)}
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
        Create Book
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

export default BookForm
