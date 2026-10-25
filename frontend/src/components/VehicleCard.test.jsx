import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import VehicleCard from './VehicleCard'

const vehicle = { id: 1, make: 'Toyota', model: 'Camry', category: 'Sedan', price: 25000, quantity: 3 }

describe('VehicleCard', () => {
  it('disables the Purchase button when the vehicle is sold out', () => {
    render(<VehicleCard vehicle={{ ...vehicle, quantity: 0 }} />)
    expect(screen.getByRole('button', { name: /sold out/i })).toBeDisabled()
  })

  it('calls onPurchase with the vehicle when stock is available', async () => {
    const onPurchase = vi.fn()
    render(<VehicleCard vehicle={vehicle} onPurchase={onPurchase} />)
    await userEvent.click(screen.getByRole('button', { name: /purchase/i }))
    expect(onPurchase).toHaveBeenCalledWith(vehicle)
  })

  it('hides admin controls for regular users', () => {
    render(<VehicleCard vehicle={vehicle} />)
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('shows admin controls for admins', () => {
    render(<VehicleCard vehicle={vehicle} isAdmin />)
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})