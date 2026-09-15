import { useState } from 'react'
import './App.css'
import ReferralForm from './components/ReferralForm'
import ResourceDetail from './components/ResourceDetail'
import ResourceForm from './components/ResourceForm'
import ResourceList from './components/ResourceList'
import { CATEGORIES, type Category, type Referral, type ReferralFormValues, type Resource, type ResourceFormValues } from './types'

const initialResourceForm: ResourceFormValues = {
  name: '',
  category: 'Food',
  description: '',
  address: '',
  email: '',
  phone: '',
}

const initialReferralForm: ReferralFormValues = {
  family_name: '',
  resource_id: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
}

function App() {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [resourceReferrals, setResourceReferrals] = useState<Referral[]>([])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All')
  const [resourceForm, setResourceForm] = useState<ResourceFormValues>(initialResourceForm)
  const [referralForm, setReferralForm] = useState<ReferralFormValues>(initialReferralForm)
  const [error, setError] = useState<string | null>(null)

  async function handleLoadResources() {
    void search
    void categoryFilter
    void setResources
    // TODO: Implement resource list loading using src/api/api.ts.
    setError('TODO: implement handleLoadResources in App.tsx')
  }

  async function handleSelectResource(resourceId: number) {
    void resourceId
    void setSelectedResource
    void setResourceReferrals
    void setReferralForm
    // TODO: Implement selected resource + referrals fetch using src/api/api.ts.
    setError('TODO: implement handleSelectResource in App.tsx')
  }

  function handleResourceFormChange(next: ResourceFormValues) {
    void next
    // TODO: Implement resource form state handling.
    setError('TODO: implement resource form state updates in App.tsx')
  }

  function handleReferralFormChange(next: ReferralFormValues) {
    void next
    // TODO: Implement referral form state handling.
    setError('TODO: implement referral form state updates in App.tsx')
  }

  async function handleCreateResource() {
    void resourceForm
    void setResourceForm
    // TODO: Implement resource creation flow using src/api/api.ts.
    setError('TODO: implement handleCreateResource in App.tsx')
  }

  async function handleCreateReferral() {
    void referralForm
    void selectedResource
    void setReferralForm
    // TODO: Implement referral creation flow using src/api/api.ts.
    setError('TODO: implement handleCreateReferral in App.tsx')
  }

  return (
    <main className="layout">
      <header>
        <h1>CommunityBridge Resource Hub</h1>
        <p>Starter frontend scaffold with TODOs for API integration.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <section className="card">
        <h2>Integration TODO</h2>
        <p>
          Route handlers, form wiring, and API calls are intentionally left as TODOs for the team.
        </p>
        <button onClick={() => void handleLoadResources()}>Load Resources (TODO API)</button>
      </section>

      <ResourceList
        resources={resources}
        search={search}
        categoryFilter={categoryFilter}
        onSearchChange={setSearch}
        onCategoryChange={setCategoryFilter}
        onSelectResource={(resourceId) => void handleSelectResource(resourceId)}
        categories={CATEGORIES}
      />

      <ResourceForm
        values={resourceForm}
        categories={CATEGORIES}
        onChange={handleResourceFormChange}
        onSubmit={() => void handleCreateResource()}
      />

      <ResourceDetail resource={selectedResource} referrals={resourceReferrals} />

      <ReferralForm
        values={referralForm}
        resources={resources}
        onChange={handleReferralFormChange}
        onSubmit={() => void handleCreateReferral()}
      />
    </main>
  )
}

export default App
