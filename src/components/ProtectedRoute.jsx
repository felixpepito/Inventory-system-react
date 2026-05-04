import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'  // Fixed import path

export default function ProtectedRoute({ children, requiredRole }) {
  const { session, profile } = useAuth()

  // Wait while Supabase is checking session
  if (session === undefined) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/80 text-sm tracking-wide">Checking session...</span>
        </div>
      </div>
    )
  }

  // Redirect only if session is really null
  if (session === null) {
    return <Navigate to="/login" replace />
  }

  // Wait while profile is loading
  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          <span className="text-white/80 text-sm tracking-wide">Verifying access...</span>
        </div>
      </div>
    )
  }

  // Role protection
  if (requiredRole && profile.role !== requiredRole) {
    return <Navigate to={profile.role === 'admin' ? '/admin' : '/user'} replace />
  }

  return children
}