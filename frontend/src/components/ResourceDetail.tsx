import type { Referral, Resource } from '../types'

type ResourceDetailProps = {
  resource: Resource | null
  referrals: Referral[]
  isLoading?: boolean
}

function ResourceDetail({ resource, referrals, isLoading = false }: ResourceDetailProps) {
  return (
    <section className="card">
      <h2>Resource Detail</h2>
      {/* TODO: Add edit/delete actions for the selected resource. */}

      {isLoading ? <p>Loading resource details...</p> : null}

      {!resource ? <p>Select a resource to view details.</p> : null}

      {resource ? (
        <>
          {/* TODO: Improve layout hierarchy for long descriptions and contact details. */}
          <h3>{resource.name}</h3>
          <p>{resource.category}</p>
          <p>{resource.description}</p>
          <p>{resource.address}</p>
          <p>{resource.email}</p>
          <p>{resource.phone}</p>

          <h4>Referrals</h4>
          {/* TODO: Add sorting/filter controls for referral history. */}
          {referrals.length === 0 ? <p>No referrals yet.</p> : null}
          <ul>
            {referrals.map((referral) => (
              <li key={referral.id}>
                <p>{referral.family_name}</p>
                <p>{referral.date}</p>
                <p>{referral.notes}</p>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </section>
  )
}

export default ResourceDetail
