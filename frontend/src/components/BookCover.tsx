import type { Book } from '../types'

type BookCoverProps = { book: Book; large?: boolean }

export default function BookCover({ book, large = false }: BookCoverProps) {
  const initials = book.title.trim().split(/\s+/).filter(word => !/^(the|a|an)$/i.test(word)).slice(0, 2).map((word) => word[0]).join('').toUpperCase()
  return (
    <div className={`book-cover${large ? ' book-cover-large' : ''}`} data-genre={book.genre} aria-hidden="true">
      <span className="cover-monogram">{initials || book.title.trim()[0]}</span>
      {large && <span className="cover-location">{book.shelf_location}</span>}
    </div>
  )
}
