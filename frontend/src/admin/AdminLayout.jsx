import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'

export default function AdminLayout({ user, setUser }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    setUser(null)
    navigate('/')
  }

  // Determine active page based on current path
  const getActivePage = () => {
    const path = location.pathname.split('/').pop()
    if (path === 'dashboard') return 'dashboard'
    if (path === 'users') return 'users'
    if (path === 'benefits') return 'benefits'
    if (path === 'payments') return 'payments'
    if (path === 'settings') return 'settings'
    if (path === 'user-registration') return 'users' // Keep users active for registration
    if (path === 'user-management') return 'users' // Keep users active for management
    return 'dashboard'
  }

  const activePage = getActivePage()

  // All original menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { id: 'users', label: 'Users', icon: '👥', path: '/admin/users', badge: '24 new' },
    { id: 'benefits', label: 'Benefits', icon: '🎁', path: '/admin/benefits', badge: '12 pending' },
    { id: 'payments', label: 'Payments', icon: '💰', path: '/admin/payments', badge: '₹45.2K' },
    { id: 'settings', label: 'Settings', icon: '⚙️', path: '/admin/settings' }
  ]

  const handleNavigation = (path) => {
    navigate(path)
    setIsSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="flex justify-between items-center h-20 px-4 sm:px-6 lg:px-8">
          {/* Left side - Logo and Menu Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
              <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-1">
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
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent hidden sm:block">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Right side - User Info and Logout */}
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-500">Welcome,</p>
                <p className="font-semibold text-gray-800">{user?.name || 'Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area with Sidebar */}
      <div className="flex">
        {/* Sidebar - Collapsible */}
        <div className={`
          ${isSidebarOpen ? 'w-64' : 'w-20'} 
          transition-all duration-300 ease-in-out
          bg-white shadow-lg min-h-screen sticky top-20
          hidden lg:block
        `}>
          <div className="py-6">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`
                  w-full flex items-center px-4 py-3 mb-2 transition-all duration-200
                  ${activePage === item.id 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'}
                  ${!isSidebarOpen && 'justify-center'}
                `}
              >
                <span className="text-2xl">{item.icon}</span>
                {isSidebarOpen && (
                  <>
                    <span className="ml-3 font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${activePage === item.id 
                          ? 'bg-white text-orange-600' 
                          : 'bg-orange-100 text-orange-600'}
                      `}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Sidebar - Overlay */}
        {isSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}></div>
            <div className="relative w-64 bg-white h-full overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-800">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="py-4">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center px-4 py-3 mb-1
                      ${activePage === item.id 
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white' 
                        : 'text-gray-700 hover:bg-orange-50'}
                    `}
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="ml-3 font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Right Side Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden mb-4 px-4 py-2 bg-white rounded-lg shadow-md flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Menu</span>
            </button>

            {/* Dynamic Page Content using Outlet */}
            <Outlet context={{ user, setUser }} />
          </div>
        </div>
      </div>
    </div>
  )
}