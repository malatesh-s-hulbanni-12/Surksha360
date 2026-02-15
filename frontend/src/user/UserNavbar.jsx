import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserNavbar({ user, setUser }) {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Logo and Name - Click to go to Dashboard */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/user/dashboard')}>
            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-1">
              <img 
                src="/logo.png" 
                alt="Suraksha360 Logo" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = 'https://via.placeholder.com/48x48?text=S360'
                }}
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent hidden sm:block">
              Suraksha360
            </span>
          </div>

          {/* Center - Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Benefits Link - Navigates to Benefits Page */}
            <button
              onClick={() => navigate('/user/benefits')}
              className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium"
            >
              Benefits
            </button>

            {/* Installments Button - Navigates to Installments Page */}
            <button
              onClick={() => navigate('/user/installments')}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <span>📦</span>
              <span>Get Your Installments</span>
            </button>

            {/* Apply for Benefit Button - Navigates to Apply Page */}
            <button
              onClick={() => navigate('/user/apply-benefit')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <span>📝</span>
              <span>Apply for Benefit</span>
            </button>
          </div>

          {/* Right side - Logout (Desktop) */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 animate-slideDown">
            {/* Navigation Links */}
            <div className="space-y-2 mb-4">
              {/* Benefits Link */}
              <button
                onClick={() => {
                  navigate('/user/benefits')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-green-50 rounded-lg transition-colors font-medium"
              >
                Benefits
              </button>

              {/* Installments Button */}
              <button
                onClick={() => {
                  navigate('/user/installments')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>📦</span>
                <span>Get Your Installments</span>
              </button>

              {/* Apply for Benefit Button */}
              <button
                onClick={() => {
                  navigate('/user/apply-benefit')
                  setIsMobileMenuOpen(false)
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2"
              >
                <span>📝</span>
                <span>Apply for Benefit</span>
              </button>
            </div>

            {/* User Info and Logout */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-500">Logged in as</p>
                  <p className="font-semibold text-gray-800">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </nav>
  )
}