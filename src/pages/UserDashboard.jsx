import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import UserSidebar from '../components/UserSidebar'
import InventoryTable from '../components/InventoryTable'

export default function UserDashboard() {
  const [activePage, setActivePage] = useState('inventory')
  const [tires, setTires] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedBrand, setSelectedBrand] = useState(null)

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

  // Get all unique brands and sort in specific order
  const allBrands = ['Bridgestone', 'Goodyear', 'Maxxis', 'Michelin', 'Yokohama']
  
  // Filter tires by selected brand or show all
  const getTiresByBrand = (brand) => {
    return tires.filter(t => t.brand === brand)
  }

  // Global search filter for all tires
  const getFilteredTiresBySearch = (tiresList) => {
    if (!search) return tiresList
    return tiresList.filter(t => 
      t.id_number?.toLowerCase().includes(search.toLowerCase()) ||
      t.brand?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase())
    )
  }

  // Filter brands by search (para sa Brands page)
  const getFilteredBrands = () => {
    if (!search) return allBrands
    return allBrands.filter(brand => 
      brand.toLowerCase().includes(search.toLowerCase())
    )
  }

  const filtered = selectedBrand 
    ? tires.filter(t => t.brand === selectedBrand)
    : tires
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 lg:ml-64 transition-all duration-300">
        {/* Page Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-5 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {activePage === 'inventory' && 'Tire Inventory Management'}
                {activePage === 'brands' && 'Brand Management'}
              </h2>
              <p className="mt-1 text-sm text-gray-500">Triangle Outsourcing Corporation — Viewer Portal</p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              View Only Mode
            </div>
          </div>
        </div>

        <div className="px-6 py-6 lg:px-8">
          {/* INVENTORY VIEW - Full Inventory Table */}
          {activePage === 'inventory' && (
            <div className="space-y-6">
              {/* Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by ID, brand, or description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {selectedBrand && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand(null)} className="text-gray-500 hover:text-gray-700">×</button>
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{getFilteredTiresBySearch(filtered).length} result{getFilteredTiresBySearch(filtered).length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Inventory Table */}
              <InventoryTable
                tires={getFilteredTiresBySearch(filtered)}
                isAdmin={false}
                onEdit={null}
                onRefresh={fetchTires}
                loading={loading}
              />

              {/* No Results Message */}
              {getFilteredTiresBySearch(filtered).length === 0 && (
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

          {/* BRANDS VIEW - Grouped by Brand in Vertical Format */}
          {activePage === 'brands' && (
            <div className="space-y-6">
              {/* Search Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative max-w-md w-full">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by ID, brand, or description..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {selectedBrand && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                      {selectedBrand}
                      <button onClick={() => setSelectedBrand(null)} className="text-gray-500 hover:text-gray-700">×</button>
                    </span>
                  )}
                  <span className="text-sm text-gray-500">{getFilteredTiresBySearch(filtered).length} result{getFilteredTiresBySearch(filtered).length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Brand Cards for Quick Filter */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {allBrands.map((brand) => {
                  const brandTires = getTiresByBrand(brand)
                  const filteredBrandTiresForCard = getFilteredTiresBySearch(brandTires)
                  const totalQty = filteredBrandTiresForCard.reduce((sum, t) => sum + (t.quantity || 0), 0)
                  const isSelected = selectedBrand === brand
                  // Only show brand card if may laman after search
                  if (search && filteredBrandTiresForCard.length === 0) return null
                  return (
                    <div
                      key={brand}
                      onClick={() => setSelectedBrand(isSelected ? null : brand)}
                      className={`group relative cursor-pointer rounded-md border transition-all hover:shadow-md ${
                        isSelected 
                          ? 'border-black bg-gray-50 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`h-1 w-full rounded-t-md transition-colors ${
                        isSelected ? 'bg-black' : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}></div>
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{brand}</span>
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-black">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                          <div>
                            <div className="text-xs text-gray-500">Items</div>
                            <div className="text-lg font-semibold text-gray-900">{filteredBrandTiresForCard.length}</div>
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

              {/* Brand Sections with Tables - VERTICAL FORMAT */}
              <div className="flex flex-col space-y-6">
                {allBrands.map((brand) => {
                  const brandTires = getTiresByBrand(brand)
                  const filteredBrandTires = getFilteredTiresBySearch(brandTires)
                  if (filteredBrandTires.length === 0) return null

                  return (
                    <div key={brand} className="rounded-md border border-gray-200 bg-white overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{brand}</h3>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {filteredBrandTires.length} item{filteredBrandTires.length !== 1 ? 's' : ''} • 
                              Total Quantity: {filteredBrandTires.reduce((sum, t) => sum + (t.quantity || 0), 0)}
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-600">{filteredBrandTires.length}</span>
                          </div>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-white">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">#</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">ID Number</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Quantity</th>
                              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredBrandTires.map((tire, idx) => (
                              <tr key={tire.id} className="hover:bg-gray-50 transition-colors">
                                <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm font-mono font-medium text-gray-900">{tire.id_number}</td>
                                <td className="px-4 py-2 text-sm text-gray-700 max-w-md truncate">{tire.description}</td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm">
                                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    tire.quantity < 5 ? 'bg-red-100 text-red-800' : tire.quantity < 20 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                  }`}>{tire.quantity}</span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-2 text-sm">
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
                  )
                })}
              </div>

              {/* No Results Message */}
              {allBrands.every(brand => {
                const brandTires = getTiresByBrand(brand)
                const filteredBrandTires = getFilteredTiresBySearch(brandTires)
                return filteredBrandTires.length === 0
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
    </div>
  )
}