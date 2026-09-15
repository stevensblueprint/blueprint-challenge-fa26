import type { Category, ResourceFormValues } from '../types'

type ResourceFormProps = {
  values: ResourceFormValues
  categories: readonly Category[]
  onChange: (next: ResourceFormValues) => void
  onSubmit: () => void
}

function ResourceForm({ values, categories, onChange, onSubmit }: ResourceFormProps) {
  // TODO: Add field-level validation and surface inline error messages.
  function update<K extends keyof ResourceFormValues>(key: K, value: ResourceFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <section className="card">
      <h2>Create Resource</h2>

      <div className="form-grid">
        {/* TODO: Mark required fields and add helper text for expected formats. */}
        <label htmlFor="resource-name">Name</label>
        <input
          id="resource-name"
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
        />

        <label htmlFor="resource-form-category">Category</label>
        <select
          id="resource-form-category"
          value={values.category}
          onChange={(event) => update('category', event.target.value as Category)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <label htmlFor="resource-description">Description</label>
        <textarea
          id="resource-description"
          value={values.description}
          onChange={(event) => update('description', event.target.value)}
        />

        <label htmlFor="resource-address">Address</label>
        <input
          id="resource-address"
          value={values.address}
          onChange={(event) => update('address', event.target.value)}
        />

        <label htmlFor="resource-email">Contact Email</label>
        <input
          id="resource-email"
          type="email"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
        />

        <label htmlFor="resource-phone">Phone</label>
        <input
          id="resource-phone"
          value={values.phone}
          onChange={(event) => update('phone', event.target.value)}
        />
      </div>

      <button onClick={onSubmit}>Create Resource</button>
      {/* TODO: Disable submit while request is pending and show success feedback. */}
    </section>
  )
}

export default ResourceForm
