import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'

export default function InventoryTable({ tires, isAdmin, onEdit, onRefresh, loading }) {
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteCountdown, setDeleteCountdown] = useState(0)

  const performDelete = useCallback(async () => {
    const { error } = await supabase.from('tires').delete().eq('id', deleteTarget.id)
    if (error) {
      setDeleteError(error.message)
      setDeleting(false)
      setDeleteCountdown(0)
    } else {
      setDeleteTarget(null)
      setDeleting(false)
      setDeleteCountdown(0)
      onRefresh()
    }
  }, [deleteTarget, onRefresh])

  // Countdown effect for single delete
  useEffect(() => {
    let timer
    if (deleting && deleteCountdown > 0) {
      timer = setInterval(() => {
        setDeleteCountdown(prev => prev - 1)
      }, 1000)
    } else if (deleteCountdown === 0 && deleting) {
      performDelete()
    }
    return () => clearInterval(timer)
  }, [deleting, deleteCountdown, performDelete])

  function handleDeleteClick(tire) {
    setDeleteTarget(tire)
  }

  function confirmDelete() {
    setDeleting(true)
    setDeleteCountdown(5)
    setDeleteError('')
  }

  function handleEditClick(tire) {
    onEdit(tire)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-black"></div>
          <p className="mt-2 text-sm text-gray-500">Loading inventory...</p>
        </div>
      </div>
    )
  }

  if (tires.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
        <EmptyTireIcon />
        <p className="mt-4 text-sm font-medium text-gray-900">No tire records found</p>
        <p className="mt-1 text-xs text-gray-500">Try adjusting your search or filter</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID Number</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Brand</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              {isAdmin && <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tires.map((tire, idx) => (
              <tr key={tire.id} className={`hover:bg-gray-50 transition-colors ${tire.quantity < 5 ? 'bg-red-50/30' : ''}`}>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm font-mono font-medium text-gray-900">{tire.id_number}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                    {tire.brand}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{tire.description}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    tire.quantity < 5 
                      ? 'bg-red-100 text-red-800' 
                      : tire.quantity < 20 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {tire.quantity}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    tire.quantity < 5 
                      ? 'bg-red-100 text-red-800' 
                      : tire.quantity < 20 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      tire.quantity < 5 ? 'bg-red-500' : tire.quantity < 20 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    {tire.quantity < 5 ? 'Low Stock' : tire.quantity < 20 ? 'Medium' : 'In Stock'}
                  </span>
                </td>
                {isAdmin && (
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(tire)}
                        className="rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-black transition-colors"
                        title="Edit"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(tire)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-1">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && !deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !deleting && setDeleteTarget(null)}>
          <div className="w-full max-w-md rounded-md bg-white shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="mt-4 text-center text-lg font-semibold text-gray-900">Delete Tire Record?</h3>
              <p className="mt-2 text-center text-sm text-gray-500">You are about to permanently delete:</p>
              <div className="mt-2 rounded-md bg-gray-100 p-2 text-center">
                <p className="text-sm font-mono font-medium text-gray-900">{deleteTarget.id_number}</p>
                <p className="text-xs text-gray-600">{deleteTarget.description}</p>
              </div>
              <p className="mt-3 text-center text-xs text-red-600">This action cannot be undone.</p>
              {deleteError && (
                <div className="mt-3 rounded-md bg-red-50 p-2 text-center text-xs text-red-600">
                  {deleteError}
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Loading Modal */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-2xl text-center">
            <div className="relative flex h-28 w-28 mx-auto items-center justify-center">
              <svg className="h-28 w-28 -rotate-90 transform">
                <circle
                  className="text-gray-200"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="56"
                  cy="56"
                />
                <circle
                  className="text-red-600 transition-all duration-1000 ease-linear"
                  strokeWidth="5"
                  strokeDasharray={314.16}
                  strokeDashoffset={314.16 * (1 - (5 - deleteCountdown) / 5)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="50"
                  cx="56"
                  cy="56"
                />
              </svg>
              <span className="absolute text-4xl font-bold text-black">{deleteCountdown}</span>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold text-gray-900">Deleting Tire Record...</h3>
              <p className="text-sm text-gray-500 mt-1">
                Please wait {deleteCountdown} second{deleteCountdown !== 1 ? 's' : ''}
              </p>
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-full rounded-full bg-red-600 transition-all duration-1000 ease-linear"
                    style={{ width: `${((5 - deleteCountdown) / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function EmptyTireIcon() {
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16 text-gray-300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="2" strokeDasharray="6 4"/>
      <circle cx="40" cy="40" r="18" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="40" cy="40" r="6" fill="currentColor" opacity="0.3"/>
    </svg>
  )
}