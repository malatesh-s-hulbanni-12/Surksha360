import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UserLogin from './UserLogin'
import AdminLogin from './AdminLogin'
import backgroundImage from '../assets/backgroundlogo.png'

export default function Home({ user, setUser }) {
  const navigate = useNavigate()
  const [activeRole, setActiveRole] = useState('user')
  const [showLogin, setShowLogin] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    setUser(null)
  }

  const goToDashboard = () => {
    if (user.role === 'user') {
      navigate('/user/dashboard')
    } else {
      navigate('/admin/dashboard')
    }
  }

  if (user) {
    return (
      <div 
        className="home-container"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
        <div className="user-info">
          Welcome, {user.name} ({user.role})
        </div>
        <div className="content-wrapper text-center">
          <h1 className="main-title">Welcome Back!</h1>
          <p className="main-subtitle">
            You are logged in as {user.role}
          </p>
          <div className="max-w-md mx-auto">
            <div className="light-card p-8">
              <div className="selection-icon text-6xl mb-4">
                {user.role === 'user' ? '👤' : '👑'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
              <p className="text-gray-600 mb-6">
                Access your {user.role} dashboard
              </p>
              <button 
                onClick={goToDashboard}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition duration-150 ease-in-out"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="home-container"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="content-wrapper">
        {/* Main Container */}
        <div className="main-container">
          <h1 className="main-title">
            Welcome to AuthSystem
          </h1>
          <p className="main-subtitle">
            Choose your role to continue
          </p>

          {/* Role Selection Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <button
              onClick={() => {
                setActiveRole('user')
                setShowLogin(true)
              }}
              className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeRole === 'user'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white border-2 border-green-500 text-green-600 hover:bg-green-50'
              }`}
            >
              <div className="text-3xl mb-2">👤</div>
              <div>User</div>
            </button>

            <button
              onClick={() => {
                setActiveRole('admin')
                setShowLogin(true)
              }}
              className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeRole === 'admin'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50'
              }`}
            >
              <div className="text-3xl mb-2">👑</div>
              <div>Admin</div>
            </button>
          </div>

          {/* Login Form Container */}
          <div className="login-container">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeRole === 'user' ? (
                  <span className="flex items-center gap-2">
                    <span className="text-green-600">👤</span> User Login
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-orange-600">👑</span> Admin Login
                  </span>
                )}
              </h2>
              {showLogin && (
                <button
                  onClick={() => setShowLogin(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Render appropriate login form */}
            {activeRole === 'user' ? (
              <UserLogin setUser={setUser} embedded={true} />
            ) : (
              <AdminLogin setUser={setUser} embedded={true} />
            )}
          </div>

          {/* Registration Links */}
          <div className="mt-6 text-center text-sm text-gray-600">
            {activeRole === 'user' ? (
              <p>
                New user?{' '}
                <button
                  onClick={() => navigate('/user/register')}
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors"
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                New admin?{' '}
                <button
                  onClick={() => navigate('/admin/register')}
                  className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                >
                  Register as admin
                </button>
              </p>
            )}
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-green-200 rounded-full blur-3xl -z-10 opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-orange-200 rounded-full blur-3xl -z-10 opacity-30"></div>
        </div>
      </div>
    </div>
  )
}