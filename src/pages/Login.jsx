import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-stretch relative overflow-hidden">
      {/* Main container */}
      <div className="flex w-full min-h-screen">
        {/* Left Panel - White side with Branding */}
        <div className="hidden lg:flex flex-1 bg-white flex-col justify-between p-12 lg:p-16 relative overflow-hidden">
          {/* Decorative circles - subtle gray */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-gray-100 to-transparent pointer-events-none" />
          <div className="absolute -right-28 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border-2 border-dashed border-gray-200 animate-[spin_30s_linear_infinite] pointer-events-none" />

          {/* Logo Area */}
          <div className="relative space-y-8">
            <div className="w-24 h-24 animate-[float_4s_ease-in-out_infinite]">
              <img 
                src="/img/logo.png"
                alt="Tire Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-2">
              <span className="font-['Barlow_Condensed'] text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase">
                TRIANGLE OUTSOURCING CORPORATION
              </span>
              <h1 className="font-['Barlow_Condensed'] text-5xl lg:text-6xl font-black leading-tight text-black uppercase">
                TIRE INVENTORY<br />
                <span className="text-gray-700">SYSTEM</span>
              </h1>
            </div>
          </div>

          {/* Bottom Text */}
        </div>

        {/* Right Panel - Black side with Form */}
        <div className="flex-1 lg:w-[460px] lg:flex-none bg-black flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="mb-9">
              <h2 className="font-['Barlow_Condensed'] text-3xl lg:text-4xl font-extrabold text-white mb-1.5">
                Welcome Back
              </h2>
              <p className="text-gray-500 text-sm">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-800/30 animate-[slideDown_0.2s_ease]">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <span>⚠</span> {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="font-['Barlow_Condensed'] text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-3.5 px-4 pl-11 bg-gray-900 border-2 border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-600 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="font-['Barlow_Condensed'] text-xs font-semibold tracking-[0.12em] uppercase text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full py-3.5 px-4 pl-11 pr-12 bg-gray-900 border-2 border-gray-800 rounded-lg text-white placeholder:text-gray-600 focus:outline-none focus:border-gray-600 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.05)] transition-all"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-6 bg-white text-black rounded-lg font-['Barlow_Condensed'] font-bold text-base tracking-[0.08em] uppercase flex items-center justify-center gap-2.5 hover:bg-gray-100 hover:translate-y-[-2px] hover:shadow-[0_6px_20px_rgba(255,255,255,0.1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                      <polyline points="10 17 15 12 10 7"/>
                      <line x1="15" y1="12" x2="3" y2="12"/>
                    </svg>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}