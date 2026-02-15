import { Link, useNavigate } from 'react-router-dom'

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('userInfo')
    setUser(null)
    navigate('/')
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-indigo-600">
              AuthSystem
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">
                  Welcome, {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-150 ease-in-out"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="relative group">
                  <button className="dropdown-button">
                    User
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/user/login" className="dropdown-item">
                      Login
                    </Link>
                    <Link to="/user/register" className="dropdown-item">
                      Register
                    </Link>
                  </div>
                </div>

                <div className="relative group">
                  <button className="dropdown-button">
                    Admin
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/admin/login" className="dropdown-item">
                      Login
                    </Link>
                    <Link to="/admin/register" className="dropdown-item">
                      Register
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}