// UserSidebar.jsx
import React from 'react'

export default function UserSidebar({ 
  activePage, 
  setActivePage, 
  collapsed, 
  setCollapsed, 
  disabled = false, 
  mobileOpen = false, 
  onMobileClose = null,
  profile = null
}) {
  const navItems = [
    { id: 'inventory', label: 'Inventory', icon: InventoryIcon },
    { id: 'brands', label: 'Brands', icon: BrandsIcon },
  ]

  const sidebarClasses = `
    fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 transition-all duration-300
    ${collapsed ? 'w-20' : 'w-64'}
    transform transition-transform duration-300 ease-in-out
    md:transform-none
    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Logo Section - using your custom image */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-200 ${
          collapsed ? 'flex-col gap-3' : ''
        }`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
            {/* Custom logo image */}
            <img 
              src="/img/logo1.png" 
              alt="Triangle Tire System Logo"
              className={`object-contain transition-all duration-200 ${
                collapsed ? 'h-8 w-8' : 'h-9 w-9'
              }`}
            />
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-xs font-semibold tracking-wider text-gray-400">TRIANGLE</div>
                <div className="text-sm font-bold tracking-wide text-gray-800">TIRE SYSTEM</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {!collapsed && (
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              NAVIGATION
            </div>
          )}
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id)
                  if (onMobileClose) onMobileClose()
                }}
                disabled={disabled}
                className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-gray-100 text-black'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                } ${collapsed ? 'justify-center' : 'gap-3'} ${
                  disabled ? 'cursor-not-allowed opacity-50' : ''
                }`}
                title={collapsed ? item.label : ''}
              >
                <span className="h-5 w-5 shrink-0 text-gray-500"><item.icon /></span>
                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                {activePage === item.id && !collapsed && (
                  <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
                )}
              </button>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}

// Icons (unchanged)
function InventoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
      <line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function BrandsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="8"/>
      <line x1="12" y1="16" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="8" y2="12"/>
      <line x1="16" y1="12" x2="22" y2="12"/>
    </svg>
  ) 
}