// Sidebar.jsx
import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ activePage, setActivePage, collapsed, setCollapsed, loggingOut = false }) {
  const { profile } = useAuth()

  const navItems = profile?.role === 'admin'
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { id: 'inventory', label: 'Inventory', icon: InventoryIcon },
        { id: 'brands', label: 'Brands', icon: BrandsIcon },
      ]
    : [
        { id: 'inventory', label: 'Inventory', icon: InventoryIcon },
        { id: 'brands', label: 'Brands', icon: BrandsIcon },
      ]

  return (
    <>
      {/* Full Screen Loading Modal - triggered by parent loggingOut */}
      {loggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl border border-gray-700 min-w-[320px]">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-700 border-t-white animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Logo image in loading modal - now circular */}
                <img 
                  src="/img/logo1.png" 
                  alt="Triangle Tire System Logo"
                  className="h-8 w-8 rounded-full object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-2">Signing Out</h3>
              <p className="text-gray-400 text-sm">Please wait while we securely log you out...</p>
            </div>
          </div>
        </div>
      )}

      <aside className={`fixed left-0 top-0 z-40 h-screen bg-black text-white transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo Section */}
        <div className={`flex items-center justify-between p-4 border-b border-gray-800 ${
          collapsed ? 'flex-col gap-3' : ''
        }`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'flex-col' : ''}`}>
            {/* Custom logo image - now circular */}
            <img 
              src="/img/logo1.png" 
              alt="Triangle Tire System Logo"
              className={`rounded-full object-cover transition-all duration-200 ${
                collapsed ? 'h-8 w-8' : 'h-9 w-9'
              }`}
            />
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-xs font-semibold tracking-wider text-gray-400">TRIANGLE</div>
                <div className="text-sm font-bold tracking-wide">TIRE SYSTEM</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3">
          {!collapsed && (
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              NAVIGATION
            </div>
          )}
          <div className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${collapsed ? 'justify-center' : 'gap-3'}`}
                title={collapsed ? item.label : ''}
              >
                <span className="h-5 w-5 shrink-0"><item.icon /></span>
                {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                {activePage === item.id && !collapsed && (
                  <span className="h-1.5 w-1.5 rounded-full bg-black"></span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* No logout button here anymore */}
      </aside>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  )
}

// Icons (unchanged)
function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )
}

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