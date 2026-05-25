// UserDashboard.jsx - Fixed version

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../supabaseClient'
import UserSidebar from '../components/UserSidebar'
import InventoryTable from '../components/InventoryTable'

export default function UserDashboard() {
  const [activePage, setActivePage] = useState('inventory')
  const [tires, setTires] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [profile, setProfile] = useState(null)
  const dropdownRef = useRef(null)

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    setProfile(data || { full_name: user.email?.split('@')[0] || 'User', role: 'user' })
  }, [])

  // Fetch tires sorted alphabetically
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

  useEffect(() => {
    fetchProfile()
    fetchTires()
  }, [fetchProfile, fetchTires])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    setDropdownOpen(false)
    try {
      await new Promise(resolve => setTimeout(resolve, 5000))
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

  // Get unique brands sorted alphabetically
  const allBrands = [...new Set(tires.map(tire => tire.brand).filter(Boolean))].sort((a, b) => 
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  )
  
  // Filter tires by selected brand and search
  const filteredTires = (() => {
    let result = tires
    if (selectedBrand) result = result.filter(t => t.brand === selectedBrand)
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(t => 
        t.id_number?.toLowerCase().includes(term) ||
        t.brand?.toLowerCase().includes(term) ||
        t.description?.toLowerCase().includes(term)
      )
    }
    return result
  })()

  const handleBrandClick = (brand) => {
    setSelectedBrand(selectedBrand === brand ? null : brand)
  }

  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen)
  const closeMobileSidebar = () => setMobileSidebarOpen(false)

  const mainMarginClass = collapsed ? 'md:ml-20' : 'md:ml-64'
  const userName = profile?.full_name || 'User'
  const userEmail = profile?.email || ''
  const userRole = profile?.role?.toUpperCase() || 'VIEWER'
  const userInitial = userName?.[0]?.toUpperCase() || 'U'

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Logout Modal */}
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

      <UserSidebar 
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        disabled={loggingOut}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={closeMobileSidebar}
        profile={profile}
      />

      <main className={`flex-1 transition-all duration-300 ${mainMarginClass}`}>
        {/* Header */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-20">
          <div className="px-4 py-3 lg:px-8">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={toggleMobileSidebar}
                  className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
                  disabled={loggingOut}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h2 className="text-lg font-bold tracking-tight text-gray-900 sm:text-xl md:text-2xl truncate">
                  {activePage === 'inventory' ? 'Tire Inventory' : 'Tire Brands'}
                </h2>
              </div>
              
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={loggingOut}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors"
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
                          <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                          <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{userRole}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setDropdownOpen(false); handleLogout() }}
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
            <p className="mt-1 text-sm text-gray-500">Triangle Outsourcing Corporation — Viewer Portal</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-4 lg:px-8">
          {/* Search Bar - Common for both pages */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Search by ID, brand, or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ×
                </button>
              )}
            </div>
          </div>

          {/* INVENTORY PAGE */}
          {activePage === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedBrand ? `${selectedBrand} - Inventory` : 'All Inventory'}
                </h3>
                {selectedBrand && (
                  <button onClick={() => setSelectedBrand(null)} className="text-xs text-gray-500 hover:text-black">
                    Clear ✕
                  </button>
                )}
                <span className="text-sm text-gray-500">({filteredTires.length})</span>
              </div>
              <InventoryTable
                tires={filteredTires}
                isAdmin={false}
                onEdit={null}
                onRefresh={fetchTires}
                loading={loading}
              />
            </div>
          )}

          {/* BRANDS PAGE */}
          {activePage === 'brands' && (
            <div className="space-y-6">
              {/* Filter indicator */}
              {selectedBrand && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-black text-white px-3 py-1 text-xs font-medium">
                    Filtered: {selectedBrand}
                    <button onClick={() => setSelectedBrand(null)} className="text-white/80 hover:text-white">×</button>
                  </span>
                  <span className="text-sm text-gray-500">{filteredTires.length} result{filteredTires.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Brand Cards */}
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
                {allBrands.map((brand) => {
                  const brandTires = tires.filter(t => t.brand === brand)
                  const displayTires = search 
                    ? brandTires.filter(t => 
                        t.id_number?.toLowerCase().includes(search.toLowerCase()) ||
                        t.description?.toLowerCase().includes(search.toLowerCase())
                      )
                    : brandTires
                  const totalQty = displayTires.reduce((sum, t) => sum + (t.quantity || 0), 0)
                  const isSelected = selectedBrand === brand
                  
                  if (search && displayTires.length === 0) return null
                  
                  return (
                    <div
                      key={brand}
                      onClick={() => handleBrandClick(brand)}
                      className={`group relative cursor-pointer rounded-md border transition-all hover:shadow-md ${
                        isSelected ? 'border-black bg-gray-50 shadow-md ring-1 ring-black' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`h-1 w-full rounded-t-md transition-colors ${
                        isSelected ? 'bg-black' : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}></div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${isSelected ? 'text-black' : 'text-gray-900'}`}>{brand}</span>
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                          <div>
                            <div className="text-xs text-gray-500">Items</div>
                            <div className="text-lg font-semibold text-gray-900">{displayTires.length}</div>
                          </div>
                          <div className="h-6 w-px bg-gray-200"></div>
                          <div>
                            <div className="text-xs text-gray-500">Qty</div>
                            <div className="text-lg font-semibold text-gray-900">{totalQty.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Selected Brand Full Table */}
              {selectedBrand && (
                <div className="rounded-md border border-gray-200 bg-white overflow-hidden">
                  <div className="bg-black px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{selectedBrand}</h3>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {filteredTires.length} item{filteredTires.length !== 1 ? 's' : ''} • 
                          Total Quantity: {filteredTires.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                        </p>
                      </div>
                      <button onClick={() => setSelectedBrand(null)} className="text-white/80 hover:text-white text-sm">
                        Clear ✕
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ID Number</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredTires.map((tire, idx) => (
                          <tr key={tire.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                            <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">{tire.id_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{tire.description}</td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                tire.quantity < 5 ? 'bg-red-100 text-red-800' : tire.quantity < 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>{tire.quantity}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                tire.quantity < 5 ? 'bg-red-100 text-red-800' : tire.quantity < 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${tire.quantity < 5 ? 'bg-red-500' : tire.quantity < 20 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                {tire.quantity < 5 ? 'Low Stock' : tire.quantity < 20 ? 'Medium' : 'In Stock'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* All Brands Tables (when no brand selected) */}
              {!selectedBrand && (
                <div className="flex flex-col space-y-6">
                  {allBrands.map((brand) => {
                    const brandTires = tires.filter(t => t.brand === brand)
                    const displayTires = search 
                      ? brandTires.filter(t => 
                          t.id_number?.toLowerCase().includes(search.toLowerCase()) ||
                          t.description?.toLowerCase().includes(search.toLowerCase())
                        )
                      : brandTires
                    
                    if (displayTires.length === 0) return null

                    return (
                      <div key={brand} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900">{brand}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {displayTires.length} item{displayTires.length !== 1 ? 's' : ''} • 
                            Total Quantity: {displayTires.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-white">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">#</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">ID Number</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Quantity</th>
                                <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                              {displayTires.slice(0, 5).map((tire, idx) => (
                                <tr key={tire.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                                  <td className="px-4 py-2 text-sm font-mono font-medium text-gray-900">{tire.id_number}</td>
                                  <td className="px-4 py-2 text-sm text-gray-700">{tire.description}</td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                      tire.quantity < 5 ? 'bg-red-100 text-red-800' : tire.quantity < 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}>{tire.quantity}</span>
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                                      tire.quantity < 5 ? 'bg-red-100 text-red-800' : tire.quantity < 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      <span className={`h-1.5 w-1.5 rounded-full ${tire.quantity < 5 ? 'bg-red-500' : tire.quantity < 20 ? 'bg-yellow-500' : 'bg-green-500'}`}></span>
                                      {tire.quantity < 5 ? 'Low Stock' : tire.quantity < 20 ? 'Medium' : 'In Stock'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {displayTires.length > 5 && (
                            <div className="px-4 py-2 text-center border-t border-gray-100 bg-gray-50">
                              <p className="text-xs text-gray-500">+ {displayTires.length - 5} more items</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* No Results */}
              {allBrands.every(brand => {
                const brandTires = tires.filter(t => t.brand === brand)
                const filtered = search 
                  ? brandTires.filter(t => 
                      t.id_number?.toLowerCase().includes(search.toLowerCase()) ||
                      t.description?.toLowerCase().includes(search.toLowerCase())
                    )
                  : brandTires
                return filtered.length === 0
              }) && (
                <div className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white py-12">
                  <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="mt-4 text-sm font-medium text-gray-900">No tires found</p>
                  <p className="mt-1 text-xs text-gray-500">Try adjusting your search</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  )
}

function TireLogoIconSmall() {
  return (
    <div className="h-8 w-8">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2"/>
        <circle cx="20" cy="20" r="12" stroke="white" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="5" fill="white"/>
        {[0,60,120,180,240,300].map((angle, i) => (
          <rect key={i} x="18.5" y="2" width="3" height="6" rx="1.5" fill="white"
            transform={`rotate(${angle} 20 20}`}/>
        ))}
      </svg>
    </div>
  )
}