import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../AuthContext'
import VehicleCard from '../components/VehicleCard'
import VehicleForm from '../components/VehicleForm'

const emptyFilters = { make: '', model: '', category: '', minPrice: '', maxPrice: '' }

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const refresh = () => setReloadKey((k) => k + 1)

  const flash = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const data = await api.searchVehicles(filters)
        if (!cancelled) {
          setVehicles(data)
          setError('')
        }
      } catch (err) {
        if (err.status === 401) logout()
        else if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [filters, reloadKey, logout])

  async function run(action, successMessage) {
    try {
      await action()
      flash(successMessage)
    } catch (err) {
      if (err.status === 401) logout()
      else flash(err.message, 'error')
    }
  }

  async function handlePurchase(vehicle) {
    setBusyId(vehicle.id)
    await run(async () => {
      const updated = await api.purchaseVehicle(vehicle.id, 1)
      setVehicles((list) => list.map((v) => (v.id === updated.id ? updated : v)))
    }, `Purchased ${vehicle.make} ${vehicle.model}`)
    setBusyId(null)
  }

  async function handleRestock(vehicle, quantity) {
    await run(async () => {
      const updated = await api.restockVehicle(vehicle.id, quantity)
      setVehicles((list) => list.map((v) => (v.id === updated.id ? updated : v)))
    }, `Restocked ${vehicle.make} ${vehicle.model}`)
  }

  async function handleDelete(vehicle) {
    if (!window.confirm(`Delete ${vehicle.make} ${vehicle.model}?`)) return
    await run(async () => {
      await api.deleteVehicle(vehicle.id)
      refresh()
    }, 'Vehicle deleted')
  }

  async function handleSave(values) {
    if (editing) await api.updateVehicle(editing.id, values)
    else await api.createVehicle(values)
    flash(editing ? 'Vehicle updated' : 'Vehicle added')
    setShowForm(false)
    setEditing(null)
    refresh()
  }

  const setFilter = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.value }))
  const filterInput =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <h1 className="text-xl font-bold">🚗 Car Dealership Inventory</h1>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden sm:inline">{user.email}</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">{isAdmin ? 'ADMIN' : 'USER'}</span>
            <button onClick={logout} className="rounded-lg bg-white/15 px-3 py-1.5 font-medium hover:bg-white/25">Log out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input aria-label="Make" placeholder="Make" value={filters.make} onChange={setFilter('make')} className={filterInput} />
          <input aria-label="Model" placeholder="Model" value={filters.model} onChange={setFilter('model')} className={filterInput} />
          <input aria-label="Category" placeholder="Category" value={filters.category} onChange={setFilter('category')} className={filterInput} />
          <input aria-label="Min price" type="number" min="0" placeholder="Min price" value={filters.minPrice} onChange={setFilter('minPrice')} className={filterInput} />
          <input aria-label="Max price" type="number" min="0" placeholder="Max price" value={filters.maxPrice} onChange={setFilter('maxPrice')} className={filterInput} />
          <button onClick={() => setFilters(emptyFilters)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Clear filters</button>
        </div>

        {isAdmin && !showForm && (
          <button
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="mb-6 rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            + Add vehicle
          </button>
        )}

        {isAdmin && showForm && (
          <VehicleForm
            key={editing?.id ?? 'new'}
            initial={editing}
            title={editing ? `Edit ${editing.make} ${editing.model}` : 'Add a vehicle'}
            onSubmit={handleSave}
            onCancel={() => {
              setShowForm(false)
              setEditing(null)
            }}
          />
        )}

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}

        {loading && vehicles.length === 0 ? (
          <p className="py-16 text-center text-slate-500">Loading vehicles…</p>
        ) : vehicles.length === 0 ? (
          <p className="py-16 text-center text-slate-500">No vehicles found.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isAdmin={isAdmin}
                busy={busyId === vehicle.id}
                onPurchase={handlePurchase}
                onEdit={(v) => {
                  setEditing(v)
                  setShowForm(true)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                onDelete={handleDelete}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </main>

      {toast && (
        <div role="status" className={`fixed bottom-5 right-5 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-slate-900'}`}>
          {toast.message}
        </div>
      )}
    </div>
  )
}