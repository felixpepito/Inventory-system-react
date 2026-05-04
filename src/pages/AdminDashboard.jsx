import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import Sidebar from '../components/Sidebar'
import DashboardCards from '../components/DashboardCards'
import BrandCards from '../components/BrandCards'
import InventoryTable from '../components/InventoryTable'
import TireForm from '../components/TireForm'

export default function AdminDashboard() {
  const [activePage, setActivePage] = useState('dashboard')
  const [tires, setTires] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editTire, setEditTire] = useState(null)
  const [alert, setAlert] = useState(null)

  // Pagination for dashboard recent inventory
  const [recentPage, setRecentPage] = useState(1)
  const itemsPerPage = 5

  const fetchTires = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tires')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTires(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTires() }, [fetchTires])

  useEffect(() => {
    setRecentPage(1)
  }, [tires])

  function showAlert(msg, type = 'success') {
    setAlert({ msg, type })
    setTimeout(() => setAlert(null), 3500)
  }

  function handleEdit(tire) {
    setEditTire(tire)
    setShowForm(true)
  }

  function handleAdd() {
    setEditTire(null)
    setShowForm(true)
  }

  function handleFormSaved() {
    setShowForm(false)
    setEditTire(null)
    fetchTires()
    showAlert(editTire ? 'Tire updated successfully!' : 'Tire added successfully!')
  }

  // Pagination logic for dashboard
  const totalRecentItems = tires.length
  const totalRecentPages = Math.ceil(totalRecentItems / itemsPerPage)
  const startIndex = (recentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const recentTires = tires.slice(startIndex, endIndex)

  function goToNextPage() {
    if (recentPage < totalRecentPages) setRecentPage(recentPage + 1)
  }

  function goToPrevPage() {
    if (recentPage > 1) setRecentPage(recentPage - 1)
  }

  // Filtering logic (used on both Inventory and Brands pages)
  const filtered = tires.filter(t => {
    const matchBrand = selectedBrand ? t.brand === selectedBrand : true
    const q = search.toLowerCase().trim()
    const matchSearch = !q || (t.description && t.description.toLowerCase().includes(q))
    return matchBrand && matchSearch
  })

  const lowStockTires = tires.filter(t => t.quantity < 5)

  // Distinct brands for dropdown filter on Inventory page
  const distinctBrands = [...new Set(tires.map(t => t.brand))].sort()

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {/* Alert Toast */}
        {alert && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md shadow-lg text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-2 ${
            alert.type === 'success' ? 'bg-black text-white' : 'bg-red-600 text-white'
          }`}>
            {alert.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <span>⚠</span>
            )}
            <span>{alert.msg}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {activePage === 'dashboard' && 'Overview Dashboard'}
                {activePage === 'inventory' && 'Inventory Management'}
                {activePage === 'brands' && 'Brands Overview'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">Triangle Outsourcing Corporation — Admin Portal</p>
            </div>
            {(activePage === 'inventory' || activePage === 'brands') && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Tire
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-6 lg:px-8">
          {/* DASHBOARD VIEW (unchanged) */}
          {activePage === 'dashboard' && (
            <div className="space-y-8">
              <DashboardCards tires={tires} />

              {lowStockTires.length > 0 && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span className="text-sm font-medium text-red-800">
                      <strong>{lowStockTires.length} item{lowStockTires.length !== 1 ? 's' : ''}</strong> with low stock (below 5 units):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {lowStockTires.slice(0, 5).map(t => (
                        <span key={t.id} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          {t.id_number} <em className="not-italic">({t.quantity})</em>
                        </span>
                      ))}
                      {lowStockTires.length > 5 && (
                        <span className="text-xs text-gray-500">+{lowStockTires.length - 5} more</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Inventory</h3>
                  <button 
                    onClick={() => setActivePage('brands')}
                    className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
                  >
                    View all →
                  </button>
                </div>
                
                <InventoryTable
                  tires={recentTires}
                  isAdmin={true}
                  onEdit={handleEdit}
                  onRefresh={fetchTires}
                  loading={loading}
                />
                
                {totalRecentItems > itemsPerPage && (
                  <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-md">
                    <div className="flex flex-1 justify-between sm:hidden">
                      <button onClick={goToPrevPage} disabled={recentPage === 1} className="...">Previous</button>
                      <button onClick={goToNextPage} disabled={recentPage === totalRecentPages} className="...">Next</button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(endIndex, totalRecentItems)}</span> of{' '}
                        <span className="font-medium">{totalRecentItems}</span> results
                      </p>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <button onClick={goToPrevPage} disabled={recentPage === 1} className="...">Previous</button>
                        {[...Array(totalRecentPages)].map((_, idx) => {
                          const pageNum = idx + 1
                          if (pageNum === 1 || pageNum === totalRecentPages || (pageNum >= recentPage - 1 && pageNum <= recentPage + 1)) {
                            return (
                              <button key={pageNum} onClick={() => setRecentPage(pageNum)} className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                recentPage === pageNum ? 'z-10 bg-black text-white' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                              }`}>
                                {pageNum}
                              </button>
                            )
                          } else if ((pageNum === recentPage - 2 && recentPage > 3) || (pageNum === recentPage + 2 && recentPage < totalRecentPages - 2)) {
                            return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">...</span>
                          }
                          return null
                        })}
                        <button onClick={goToNextPage} disabled={recentPage === totalRecentPages} className="...">Next</button>
                      </nav>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVENTORY PAGE - No brand cards, only table + brand dropdown */}
          {activePage === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>}
                </div>
                <div className="flex items-center gap-3">
                  {/* Brand filter dropdown */}
                  <select
                    value={selectedBrand || ''}
                    onChange={e => setSelectedBrand(e.target.value || null)}
                    className="rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">All Brands</option>
                    {distinctBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                  <span className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <InventoryTable
                tires={filtered}
                isAdmin={true}
                onEdit={handleEdit}
                onRefresh={fetchTires}
                loading={loading}
              />
            </div>
          )}

          {/* BRANDS PAGE - Brand cards + inventory table */}
          {activePage === 'brands' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>}
                </div>
                <div className="flex items-center gap-3">
                  {selectedBrand && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand(null)} className="text-gray-500 hover:text-gray-700">×</button>
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <BrandCards tires={tires} selectedBrand={selectedBrand} onSelectBrand={setSelectedBrand} />

              <InventoryTable
                tires={filtered}
                isAdmin={true}
                onEdit={handleEdit}
                onRefresh={fetchTires}
                loading={loading}
              />
            </div>
          )}
        </div>
      </main>

      {showForm && (
        <TireForm
          editTire={editTire}
          onClose={() => { setShowForm(false); setEditTire(null) }}
          onSaved={handleFormSaved}
        />
      )}
    </div>
  )
}