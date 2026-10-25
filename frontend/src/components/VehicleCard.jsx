import { useState } from 'react'

export default function VehicleCard({ vehicle, isAdmin = false, busy = false, onPurchase, onEdit, onDelete, onRestock }) {
  const soldOut = vehicle.quantity === 0
  const [restockQty, setRestockQty] = useState(5)

  const price = vehicle.price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-indigo-100 to-violet-100 text-5xl">🚘</div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{vehicle.category}</p>
          <h3 className="text-lg font-bold text-slate-900">{vehicle.make} {vehicle.model}</h3>
        </div>

        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-slate-900">{price}</p>
          <p className={`text-sm font-medium ${soldOut ? 'text-red-600' : 'text-emerald-600'}`}>
            {soldOut ? 'Out of stock' : `${vehicle.quantity} in stock`}
          </p>
        </div>

        <button
          type="button"
          disabled={soldOut || busy}
          onClick={() => onPurchase(vehicle)}
          className="rounded-lg bg-indigo-600 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
        >
          {soldOut ? 'Sold out' : 'Purchase'}
        </button>

        {isAdmin && (
          <div className="mt-1 space-y-2 border-t border-slate-100 pt-3">
            <div className="flex gap-2">
              <button type="button" onClick={() => onEdit(vehicle)} className="flex-1 rounded-lg border border-slate-300 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Edit</button>
              <button type="button" onClick={() => onDelete(vehicle)} className="flex-1 rounded-lg border border-red-200 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">Delete</button>
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                aria-label="Restock quantity"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
              />
              <button type="button" onClick={() => onRestock(vehicle, Number(restockQty))} className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">Restock</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}