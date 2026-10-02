import { GENRES, type Book, type Genre } from '../types'

type Props = { books: Book[]; loading: boolean; unavailable: boolean; selectedGenre: Genre | 'All'; onSelectGenre: (genre: Genre | 'All') => void }

// Genres as drawers in a card-catalog cabinet; an open drawer is the active filter.
export default function CatalogSummary({ books, loading, unavailable, selectedGenre, onSelectGenre }: Props) {
  return <aside className="card-cabinet" aria-label="Browse by genre">
    <h2>Browse by genre</h2>
    <div className="drawers">
      {GENRES.map(genre => {
        const count = books.filter(book => book.genre === genre).length
        return <button key={genre} className="drawer" aria-pressed={selectedGenre === genre} data-empty={!loading && !count || undefined}
          disabled={loading || unavailable} onClick={() => onSelectGenre(selectedGenre === genre ? 'All' : genre)}>
          <span className="drawer-label">{genre} <strong>{loading || unavailable ? '—' : count}</strong></span>
          <span className="drawer-pull" aria-hidden="true" />
        </button>
      })}
    </div>
  </aside>
}
