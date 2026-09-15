import type { Category, Resource } from '../types'
import { useEffect, useState } from 'react'

type ResourceListProps = {
  resources: Resource[]
  search: string
  categoryFilter: Category | 'All'
  onSearchChange: (value: string) => void
  onCategoryChange: (value: Category | 'All') => void
  onSelectResource: (resourceId: number) => void
  categories: readonly Category[]
  isLoading?: boolean
}

function ResourceList({
  resources,
  search,
  categoryFilter,
  onSearchChange,
  onCategoryChange,
  onSelectResource,
  categories,
  isLoading = false,
}: ResourceListProps) {
  // TODO: Add debounced input handling to reduce API calls while typing.
  const [localSearch, setLocalSearch] = useState(search)

  useEffect(() => {
    // TODO: Replace local sync with a controlled pattern or shared form state.
    setLocalSearch(search)
  }, [search])

  return (
    <section className="card">
      <h2>Resources</h2>

      <div className="form-grid">
        {/* TODO: Add clear/reset controls for search and category filters. */}
        <label htmlFor="resource-search">Search</label>
        <input
          id="resource-search"
          type="text"
          value={localSearch}
          onChange={(event) => {
            setLocalSearch(event.target.value)
            onSearchChange(event.target.value)
          }}
          placeholder="Search by name"
        />

        <label htmlFor="resource-category">Category Filter</label>
        <select
          id="resource-category"
          value={categoryFilter}
          onChange={(event) => onCategoryChange(event.target.value as Category | 'All')}
        >
          <option value="All">All</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? <p>Loading resources...</p> : null}

      {resources.length === 0 ? <p>No resources found.</p> : null}

      <ul>
        {/* TODO: Add pagination UI when resource count grows. */}
        {resources.map((resource) => (
          <li key={resource.id} className="card">
            <h3>{resource.name}</h3>
            <p>{resource.category}</p>
            <button onClick={() => onSelectResource(resource.id)}>View Details</button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ResourceList
