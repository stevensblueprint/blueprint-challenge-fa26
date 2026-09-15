import type { ReferralFormValues, Resource } from '../types'

type ReferralFormProps = {
  values: ReferralFormValues
  resources: Resource[]
  onChange: (next: ReferralFormValues) => void
  onSubmit: () => void
}

function ReferralForm({ values, resources, onChange, onSubmit }: ReferralFormProps) {
  // TODO: Add validation for required fields before submit.
  function update<K extends keyof ReferralFormValues>(key: K, value: ReferralFormValues[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <section className="card">
      <h2>Create Referral</h2>

      <div className="form-grid">
        {/* TODO: Prefill selected resource context when opened from resource details. */}
        <label htmlFor="referral-family-name">Family Name</label>
        <input
          id="referral-family-name"
          value={values.family_name}
          onChange={(event) => update('family_name', event.target.value)}
        />

        <label htmlFor="referral-resource">Resource</label>
        <select
          id="referral-resource"
          value={values.resource_id}
          onChange={(event) => update('resource_id', event.target.value)}
        >
          <option value="">Select a resource</option>
          {resources.map((resource) => (
            <option key={resource.id} value={String(resource.id)}>
              {`${resource.id} - ${resource.name}`}
            </option>
          ))}
        </select>

        <label htmlFor="referral-date">Date</label>
        <input
          id="referral-date"
          type="date"
          value={values.date}
          onChange={(event) => update('date', event.target.value)}
        />

        <label htmlFor="referral-notes">Notes</label>
        <textarea
          id="referral-notes"
          value={values.notes}
          onChange={(event) => update('notes', event.target.value)}
        />
      </div>

      <button onClick={onSubmit}>Create Referral</button>
      {/* TODO: Show submit state and confirmation after successful creation. */}
    </section>
  )
}

export default ReferralForm
