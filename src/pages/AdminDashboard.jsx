import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import DashboardCards from '../components/DashboardCards'
import BrandCards from '../components/BrandCards'
import InventoryTable from '../components/InventoryTable'
import TireForm from '../components/TireForm'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [activePage, setActivePage] = useState('dashboard')
  const [tires, setTires] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editTire, setEditTire] = useState(null)
  const [alert, setAlert] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const fetchTires = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tires')
      .select('*')
      .order('brand', { ascending: true })
      .order('id_number', { ascending: true })
    if (!error) setTires(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchTires() }, [fetchTires])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  async function handleLogout() {
    setDropdownOpen(false)
    setLoggingOut(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  // Kuhaon lang ang tanang tires para sa recent inventory (no pagination)
  const recentTires = tires.slice(0, 5) // First 5 tires lang

  const filtered = tires.filter(t => {
    const matchBrand = selectedBrand ? t.brand === selectedBrand : true
    const q = search.toLowerCase().trim()
    const matchSearch = !q || (t.description && t.description.toLowerCase().includes(q))
    return matchBrand && matchSearch
  })

  const lowStockTires = tires.filter(t => t.quantity < 5)
  const distinctBrands = [...new Set(tires.map(t => t.brand))].sort()

  const userName = profile?.full_name || 'User'
  const userRole = profile?.role?.toUpperCase() || 'ADMIN'
  const userInitial = userName?.[0]?.toUpperCase() || 'A'

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        loggingOut={loggingOut}
      />

      <main className="flex-1 ml-0 lg:ml-64 transition-all duration-300">
        {alert && (
          <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-md shadow-lg text-sm font-medium transition-all duration-200 ${
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
            <div className="flex items-center gap-4">
              {/* Add Tire button - ONLY visible on Inventory page, NOT on Brands */}
              {activePage === 'inventory' && (
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

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={loggingOut}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
                >
                  {userInitial}
                </button>
                
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                          {userInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {userName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {profile?.email || ''}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {userRole}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 lg:px-8">
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
              </div>
            </div>
          )}

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

      {/* Logout Loading Modal */}
      {loggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl border border-gray-700 min-w-[320px]">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-700 border-t-white animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TireLogoIconSmall />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Signing Out</h3>
              <p className="text-gray-400 text-sm">Please wait while we securely log you out...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Maliit na logo ng gulong para sa loading modal
function TireLogoIconSmall() {
  return (
    <div className="h-8 w-8">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2"/>
        <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="5" fill="white"/>
        {[0,60,120,180,240,300].map((angle, i) => (
          <rect key={i} x="18.5" y="2" width="3" height="6" rx="1.5" fill="white"
            transform={`rotate(${angle} 20 20)`}/>
        ))}
      </svg>
    </div>
  )
}