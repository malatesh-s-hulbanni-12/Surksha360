import { useNavigate } from 'react-router-dom'

export default function Users() {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Two Main Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Registration Box */}
        <div 
          onClick={() => navigate('/admin/user-registration')}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600"></div>
          <div className="p-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">User Registration</h2>
            <p className="text-gray-600 mb-6">
              Register new members and families with our easy-to-use registration form.
            </p>
            <div className="flex items-center text-orange-600 font-semibold">
              <span>Register Now</span>
              <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* User Management Box */}
        <div 
          onClick={() => navigate('/admin/user-management')}
          className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.02] overflow-hidden"
        >
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="p-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl w-20 h-20 flex items-center justify-center mb-6">
              <span className="text-4xl">👥</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">User Management</h2>
            <p className="text-gray-600 mb-6">
              View, edit, and manage all registered users and their details.
            </p>
            <div className="flex items-center text-blue-600 font-semibold">
              <span>Manage Users</span>
              <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-sm text-gray-500">Total Registrations</div>
          <div className="text-2xl font-bold text-gray-800">156</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl mb-2">💰</div>
          <div className="text-sm text-gray-500">Monthly Collection</div>
          <div className="text-2xl font-bold text-green-600">₹45,678</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl mb-2">👨‍👩‍👧‍👦</div>
          <div className="text-sm text-gray-500">Family Registrations</div>
          <div className="text-2xl font-bold text-blue-600">89</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="text-3xl mb-2">👤</div>
          <div className="text-sm text-gray-500">Individual</div>
          <div className="text-2xl font-bold text-purple-600">67</div>
        </div>
      </div>
    </div>
  )
}