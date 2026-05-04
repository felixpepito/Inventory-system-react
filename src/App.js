import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthContext } from './contexts/AuthContext'

export default function App() {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!session) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user) {
      fetchProfile(session.user.id)
    }
  }, [session])

  async function fetchProfile(userId) {
    setLoadingProfile(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setProfile(data)
    }
    setLoadingProfile(false)
  }

  // Loading state
  if (session === undefined || (session && loadingProfile && !profile)) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_#333_1px,_transparent_1px)] bg-[length:40px_40px] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-gray-900"></div>
        
        <style>
          {`
            @keyframes scrollTread {
              0% { background-position: 0 0; }
              100% { background-position: 80px 80px; }
            }
          `}
        </style>
        
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Animated tire icon */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse"></div>
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 relative z-10">
              <circle cx="60" cy="60" r="55" stroke="#ffffff" strokeWidth="4" fill="none" strokeDasharray="100 200" className="animate-spin" style={{ animationDuration: '3s' }}/>
              <circle cx="60" cy="60" r="38" stroke="#ffffff" strokeWidth="3" fill="none" opacity="0.5"/>
              <circle cx="60" cy="60" r="18" fill="#ffffff" opacity="0.15"/>
              <circle cx="60" cy="60" r="10" fill="#ffffff"/>
              {[0,45,90,135,180,225,270,315].map((angle, i) => (
                <rect
                  key={i}
                  x="57" y="5"
                  width="6" height="16"
                  rx="3"
                  fill="#ffffff"
                  transform={`rotate(${angle} 60 60)`}
                />
              ))}
            </svg>
          </div>
          
          {/* Loading spinner */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span className="text-white/80 text-sm tracking-wide">Loading System...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ session, profile, setProfile }}>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              session && profile
                ? <Navigate to={profile.role === 'admin' ? '/admin' : '/user'} replace />
                : <Login />
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user" 
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="*" 
            element={
              session && profile
                ? <Navigate to={profile.role === 'admin' ? '/admin' : '/user'} replace />
                : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}