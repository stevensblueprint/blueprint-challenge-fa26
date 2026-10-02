import { motion, useIsPresent, useReducedMotion } from 'motion/react'
import type { Book } from '../types'
import BookCover from './BookCover'
import ActionButton from './ActionButton'
import Icon from './Icon'

type BookCardProps = { book: Book; index: number; disabled: boolean; onSelect: (id: number) => void }

export default function BookCard({ book, index, disabled, onSelect }: BookCardProps) {
  const reduceMotion = useReducedMotion()
  const present = useIsPresent()
  return <motion.li className="book-row" layout={reduceMotion ? false : 'position'}
    aria-hidden={!present || undefined} inert={!present}
    initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : 0.14 } }}
    transition={{ duration: reduceMotion ? 0 : 0.24, delay: reduceMotion ? 0 : Math.min(index, 6) * 0.035, layout: { duration: 0.22 } }}
  >
    <BookCover book={book} />
    <div className="book-row-content">
      <strong className="book-title">{book.title}</strong>
      <p className="book-byline">{book.author} <span className="genre-name" data-genre={book.genre}>{book.genre}</span></p>
      <p className="book-description">{book.description}</p>
      <p className="publisher-contact">Publisher <a href={`mailto:${book.publisher_email}`}>{book.publisher_email}</a></p>
    </div>
    <div className="book-row-actions">
      <span className="call-number" title="Shelf location"><span className="visually-hidden">Shelf location </span>{book.shelf_location}</span>
      <ActionButton className="detail-button" disabled={disabled || !present} onClick={() => onSelect(book.id)}>View Details <Icon name="arrow" size={15} /></ActionButton>
    </div>
  </motion.li>
}
