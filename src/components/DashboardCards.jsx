import React from 'react'

export default function DashboardCards({ tires }) {
  const totalItems = tires.length
  const totalQuantity = tires.reduce((sum, t) => sum + (t.quantity || 0), 0)
  const lowStockItems = tires.filter(t => t.quantity < 5).length
  const brands = [...new Set(tires.map(t => t.brand))].length

  const cards = [
    {
      label: 'Total Tire Items',
      value: totalItems,
      icon: <ItemsIcon />,
      bgClass: 'bg-white',
      borderClass: 'border-gray-200',
      valueClass: 'text-gray-900',
      suffix: 'SKUs'
    },
    {
      label: 'Total Quantity',
      value: totalQuantity.toLocaleString(),
      icon: <QuantityIcon />,
      bgClass: 'bg-white',
      borderClass: 'border-gray-200',
      valueClass: 'text-gray-900',
      suffix: 'units'
    },
    {
      label: 'Low Stock Items',
      value: lowStockItems,
      icon: <WarningIcon />,
      bgClass: lowStockItems > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200',
      valueClass: lowStockItems > 0 ? 'text-red-600' : 'text-gray-900',
      suffix: 'below 5'
    },
    {
      label: 'All Brands',
      value: brands,
      icon: <BrandsIcon />,
      bgClass: 'bg-white',
      borderClass: 'border-gray-200',
      valueClass: 'text-gray-900',
      suffix: 'brands'
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div 
          key={i}
          className={`relative overflow-hidden rounded-md border p-5 transition-all hover:shadow-md ${card.bgClass} ${card.borderClass}`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                {card.label}
              </p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className={`text-2xl font-bold ${card.valueClass}`}>{card.value}</span>
                <span className="text-xs text-gray-400">{card.suffix}</span>
              </div>
            </div>
            <div className="rounded-full p-2 text-gray-400">
              {card.icon}
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-gray-100 opacity-30"></div>
        </div>
      ))}
    </div>
  )
}

function ItemsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )
}

function QuantityIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  )
}

function BrandsIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/>
    </svg>
  )
}