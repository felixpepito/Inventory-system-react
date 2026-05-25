import React from 'react'

const BRAND_META = {
  Michelin: { color: '#1a1a1a' },
  Maxxis: { color: '#2c2c2c' },
  Bridgestone: { color: '#3a3a3a' },
  Goodyear: { color: '#111111' },
  Yokohama: { color: '#333333' },
}

export default function BrandCards({ tires, selectedBrand, onSelectBrand }) {
  // Extract unique brands and sort alphabetically (case-insensitive)
  const brands = [...new Set(tires.map(t => t.brand))]
    .filter(Boolean) // Remove any null/undefined values
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) // Case-insensitive alphabetical sort

  const getBrandData = (brand) => {
    const brandTires = tires.filter(t => t.brand === brand)
    const totalQty = brandTires.reduce((sum, t) => sum + (t.quantity || 0), 0)
    const lowStock = brandTires.filter(t => t.quantity < 5).length
    const meta = BRAND_META[brand] || { color: '#4a4a4a' }
    return { brandTires, totalQty, lowStock, meta }
  }

  if (brands.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Brands</h3>
        {selectedBrand && (
          <button 
            onClick={() => onSelectBrand(null)}
            className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear Filter
          </button>
        )}
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {brands.map((brand, i) => {
          const { brandTires, totalQty, lowStock, meta } = getBrandData(brand)
          const isSelected = selectedBrand === brand
          return (
            <div
              key={brand}
              onClick={() => onSelectBrand(isSelected ? null : brand)}
              className={`group relative cursor-pointer rounded-md border transition-all hover:shadow-md ${
                isSelected 
                  ? 'border-black bg-gray-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Top accent bar */}
              <div 
                className={`h-1 w-full rounded-t-md ${isSelected ? 'bg-black' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                style={{ backgroundColor: isSelected ? meta.color : undefined }}
              ></div>
              
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
                    <div className="text-lg font-semibold text-gray-900">{brandTires.length}</div>
                  </div>
                  <div className="h-6 w-px bg-gray-200"></div>
                  <div>
                    <div className="text-xs text-gray-500">Qty</div>
                    <div className="text-lg font-semibold text-gray-900">{totalQty.toLocaleString()}</div>
                  </div>
                </div>
                
                {lowStock > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    {lowStock} low stock
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}