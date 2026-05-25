import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const BRANDS = ['Michelin', 'Maxxis', 'Bridgestone', 'Goodyear', 'Yokohama', 'Other']

export default function TireForm({ editTire, onClose, onSaved }) {
  const isEdit = !!editTire
  const [form, setForm] = useState({
    id_number: '',
    brand: 'Michelin',
    description: '',
    quantity: 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (editTire) {
      setForm({
        id_number: editTire.id_number || '',
        brand: editTire.brand || 'Michelin',
        description: editTire.description || '',
        quantity: editTire.quantity ?? 0,
      })
    }
  }, [editTire])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // 3-second countdown effect after saving
  useEffect(() => {
    let timer
    if (loading && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && loading) {
      onSaved()
    }
    return () => clearInterval(timer)
  }, [loading, countdown, onSaved])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  // Function to increase quantity
  function increaseQuantity() {
    setForm(prev => ({ 
      ...prev, 
      quantity: (prev.quantity || 0) + 1 
    }))
  }

  // Function to decrease quantity
  function decreaseQuantity() {
    setForm(prev => ({ 
      ...prev, 
      quantity: Math.max(0, (prev.quantity || 0) - 1)
    }))
  }

  // Manual input for quantity
  function handleQuantityChange(e) {
    const value = e.target.value
    if (value === '') {
      setForm(prev => ({ ...prev, quantity: 0 }))
    } else {
      const numValue = parseInt(value, 10)
      if (!isNaN(numValue) && numValue >= 0) {
        setForm(prev => ({ ...prev, quantity: numValue }))
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setCountdown(3)
    setError('')

    const payload = {
      id_number: form.id_number.trim(),
      brand: form.brand,
      description: form.description.trim(),
      quantity: form.quantity,
      updated_at: new Date().toISOString(),
    }

    let error
    if (isEdit) {
      ({ error } = await supabase.from('tires').update(payload).eq('id', editTire.id))
    } else {
      ({ error } = await supabase.from('tires').insert([payload]))
    }

    if (error) {
      setError(error.message)
      setLoading(false)
      setCountdown(0)
    }
    // If no error, countdown continues and onSaved will be called when countdown reaches 0
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/30 animate-in fade-in duration-200"
      onClick={!loading ? onClose : undefined}
    >
      <div 
        className="w-full max-w-lg rounded-md bg-white shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 p-1.5 text-gray-700">
              {isEdit ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              )}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {isEdit ? 'Edit Tire Record' : 'Add New Tire'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          {!loading ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="id_number"
                    value={form.id_number}
                    onChange={handleChange}
                    placeholder="e.g. TIR-001"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brand"
                    value={form.brand}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Michelin Pilot Sport 4 - 225/45 R17"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {/* Decrease Button */}
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                  
                  {/* Quantity Input */}
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleQuantityChange}
                    min="0"
                    required
                    className="w-24 text-center rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  
                  {/* Increase Button */}
                  <button
                    type="button"
                    onClick={increaseQuantity}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </button>
                </div>
                
                {/* Low stock warning */}
                {form.quantity < 5 && form.quantity > 0 && (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    ⚠ Quantity is below 5 — will be marked as low stock
                  </p>
                )}
                {form.quantity === 0 && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    ⚠ Quantity is 0 — out of stock
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  {isEdit ? 'Save Changes' : 'Add Tire'}
                </button>
              </div>
            </form>
          ) : (
            /* LOADING MODAL - Spinner only, no countdown number or progress bar */
            <div className="py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex justify-center">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEdit ? 'Updating Tire Record...' : 'Adding New Tire...'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Please wait</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}