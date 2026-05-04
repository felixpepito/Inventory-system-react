import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const BRANDS = ['Michelin', 'Maxxis', 'Bridgestone', 'Goodyear', 'Yokohama', 'Other']

export default function TireForm({ editTire, onClose, onSaved }) {
  const isEdit = !!editTire
  const [form, setForm] = useState({
    id_number: '',
    brand: 'Michelin',
    description: '',
    quantity: '',
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
        quantity: editTire.quantity ?? '',
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

  // Countdown timer effect - AFTER saving
  useEffect(() => {
    let timer
    if (loading && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && loading) {
      // Countdown finished, close modal and refresh
      onSaved()
    }
    return () => clearInterval(timer)
  }, [loading, countdown, onSaved])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setCountdown(5) // Start 5-second countdown
    setError('')

    const payload = {
      id_number: form.id_number.trim(),
      brand: form.brand,
      description: form.description.trim(),
      quantity: parseInt(form.quantity, 10),
      updated_at: new Date().toISOString(),
    }

    // Save to Supabase
    let error
    if (isEdit) {
      ;({ error } = await supabase.from('tires').update(payload).eq('id', editTire.id))
    } else {
      ;({ error } = await supabase.from('tires').insert([payload]))
    }

    if (error) {
      setError(error.message)
      setLoading(false)
      setCountdown(0)
    }
    // If no error, countdown will continue and onSaved will be called when countdown reaches 0
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
        {/* Modal Header */}
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

        {/* Modal Content */}
        <div className="p-4">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          {/* Show form fields when NOT loading */}
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
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                {parseInt(form.quantity) < 5 && form.quantity !== '' && (
                  <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                    ⚠ Quantity is below 5 — will be marked as low stock
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
            /* 5 SECONDS LOADING - Lumalabas lang AFTER mag-save */
            <div className="py-8">
              <div className="flex flex-col items-center justify-center gap-4">
                {/* Circular Countdown Timer */}
                <div className="relative flex h-32 w-32 items-center justify-center">
                  <svg className="h-32 w-32 -rotate-90 transform">
                    <circle
                      className="text-gray-200"
                      strokeWidth="6"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-black transition-all duration-1000 ease-linear"
                      strokeWidth="6"
                      strokeDasharray={364.42}
                      strokeDashoffset={364.42 * (1 - (5 - countdown) / 5)}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-4xl font-bold text-black">{countdown}</span>
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isEdit ? 'Updating Tire Record...' : 'Adding New Tire...'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Please wait {countdown} second{countdown !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full max-w-xs">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div 
                      className="h-full rounded-full bg-black transition-all duration-1000 ease-linear"
                      style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-gray-400 animate-pulse">
                  Saving to database...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}