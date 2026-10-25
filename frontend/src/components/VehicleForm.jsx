import { useState } from 'react'

const fields = [
  ['make', 'Make', 'text'],
  ['model', 'Model', 'text'],
  ['category', 'Category', 'text'],
  ['price', 'Price (USD)', 'number'],
  ['quantity', 'Quantity in stock', 'number'],
]

export default function VehicleForm({ initial, title, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    make: initial?.make ?? '',
    model: initial?.model ?? '',
    category: initial?.category ?? '',
    price: initial ? String(initial.price) : '',
    quantity: initial ? String(initial.quantity) : '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        make: values.make,
        model: values.model,
        category: values.category,
        price: Number(values.price),
        quantity: Number(values.quantity),
      })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-indigo-200">
      <h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map(([name, label, type]) => (
          <div key={name}>
            <label htmlFor={`vf-${name}`} className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
            <input
              id={`vf-${name}`}
              type={type}
              required
              min={type === 'number' ? 0 : undefined}
              step={name === 'price' ? '0.01' : name === 'quantity' ? '1' : undefined}
              value={values[name]}
              onChange={set(name)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mt-4 flex gap-3">
        <button type="submit" disabled={saving} className="rounded-lg bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
          {saving ? 'Saving…' : 'Save vehicle'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-300 px-5 py-2 font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
      </div>
    </form>
  )
}