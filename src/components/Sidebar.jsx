import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../contexts/AuthContext'

export default function Sidebar({ activePage, setActivePage }) {
  const { profile } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      // Show loading for 5 seconds before actually logging out
      await new Promise(resolve => setTimeout(resolve, 5000))
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
      setLoggingOut(false)
    }
  }

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
      {/* Full Screen Loading Modal - Spinner Only */}
      {loggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-gradient-to-br from-gray-900 to-black p-8 shadow-2xl border border-gray-700 min-w-[320px]">
            {/* Spinner - toyok2 lang */}
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-700 border-t-white animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <TireLogoIconSmall />
              </div>
            </div>
            
            {/* Loading Text */}
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
            <TireLogoIcon />
            {!collapsed && (
              <div className="leading-tight">
                <div className="text-xs font-semibold tracking-wider text-gray-400">TRIANGLE</div>
                <div className="text-sm font-bold tracking-wide">TIRE SYSTEM</div>
              </div>
            )}
          </div>
          <button 
            onClick={() => setCollapsed(v => !v)}
            className="rounded p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            disabled={loggingOut}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {collapsed
                ? <polyline points="9 18 15 12 9 6"/>
                : <polyline points="15 18 9 12 15 6"/>
              }
            </svg>
          </button>
        </div>

        {/* User Badge */}
        {!collapsed && profile && (
          <div className="mx-3 mt-6 flex items-center gap-3 rounded-md bg-gray-900 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium uppercase">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-sm font-medium">{profile?.full_name || 'User'}</div>
              <div className="text-xs uppercase text-gray-400">{profile?.role}</div>
            </div>
          </div>
        )}

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
                disabled={loggingOut}
                className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activePage === item.id
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                } ${collapsed ? 'justify-center' : 'gap-3'} ${
                  loggingOut ? 'cursor-not-allowed opacity-50' : ''
                }`}
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

        {/* Bottom Logout */}
        <div className="absolute bottom-6 left-0 right-0 px-3">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 ${
              collapsed ? 'justify-center' : 'gap-3'
            } ${
              loggingOut 
                ? 'cursor-not-allowed bg-gray-800 opacity-70' 
                : 'hover:bg-gray-800 hover:text-white'
            }`}
            title={collapsed ? 'Logout' : ''}
          >
            <span className="h-5 w-5 shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            {!collapsed && (
              <span className="flex-1 text-left">
                Sign Out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* CSS Animations */}
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

// Small logo for loading modal
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

function TireLogoIcon() {
  return (
    <div className="relative h-8 w-8">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" className="text-white"/>
        <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="1.5" className="text-white"/>
        <circle cx="20" cy="20" r="5" fill="currentColor" className="text-white"/>
        {[0,60,120,180,240,300].map((angle, i) => (
          <rect key={i} x="18.5" y="2" width="3" height="6" rx="1.5" fill="currentColor" className="text-white"
            transform={`rotate(${angle} 20 20}`}/>
        ))}
      </svg>
    </div>
  )
}

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