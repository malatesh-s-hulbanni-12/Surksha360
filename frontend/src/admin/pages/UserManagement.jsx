import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UserManagement() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    registrationId: '',
    registrationType: '',
    numberOfMembers: 1,
    members: [],
    status: 'Active'
  })

  // Use hardcoded URL instead of process.env
  const API_URL = "https://surksha360-backend.onrender.com/api"

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      console.log('Fetching users from:', `${API_URL}/registrations`)
      const response = await axios.get(`${API_URL}/registrations`)
      console.log('Users fetched:', response.data)
      setUsers(response.data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching users:', error)
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await axios.delete(`${API_URL}/registrations/${id}`)
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  const handleEdit = (user) => {
    console.log('Editing user:', user)
    setEditingUser(user)
    setEditFormData({
      registrationId: user.registrationId,
      registrationType: user.registrationType,
      numberOfMembers: user.numberOfMembers,
      members: user.members.map(member => ({ ...member })),
      status: user.status
    })
    setShowEditModal(true)
  }

  const handleEditInputChange = (e, memberIndex, field) => {
    if (memberIndex !== undefined) {
      // Updating a member field
      const updatedMembers = [...editFormData.members]
      updatedMembers[memberIndex][field] = e.target.value
      setEditFormData({
        ...editFormData,
        members: updatedMembers
      })
    } else {
      // Updating main fields
      setEditFormData({
        ...editFormData,
        [e.target.name]: e.target.value
      })
    }
  }

  const handleSaveEdit = async () => {
    try {
      console.log('Saving edit for user:', editingUser._id)
      console.log('Edit data:', editFormData)
      
      const response = await axios.put(`${API_URL}/registrations/${editingUser._id}`, editFormData)
      
      console.log('Save response:', response.data)
      setShowEditModal(false)
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error updating user. Please try again.')
    }
  }

  const filteredUsers = users.filter(user => 
    user.members.some(member => 
      member.name && member.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) ||
    (user.registrationId && user.registrationId.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const calculateTotalAmount = () => {
    return users.reduce((acc, user) => 
      acc + user.members.reduce((sum, m) => sum + parseFloat(m.payingAmount || 0), 0), 0
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => navigate('/admin/users')}
            className="text-gray-600 hover:text-gray-800 mb-3 md:mb-4 flex items-center space-x-2 text-sm md:text-base"
          >
            <span>←</span>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">User Management</h1>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Reg.</p>
                <p className="text-lg md:text-2xl font-bold text-gray-800">{users.length}</p>
              </div>
              <span className="text-2xl md:text-3xl">📋</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Active</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'Active').length}
                </p>
              </div>
              <span className="text-2xl md:text-3xl">✅</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Members</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">
                  {users.reduce((acc, user) => acc + (user.numberOfMembers || 0), 0)}
                </p>
              </div>
              <span className="text-2xl md:text-3xl">👥</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Total Amt</p>
                <p className="text-lg md:text-2xl font-bold text-blue-600">
                  ₹{calculateTotalAmount()}
                </p>
              </div>
              <span className="text-2xl md:text-3xl">💰</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-4 mb-4 md:mb-6">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base">🔍</span>
            <input
              type="text"
              placeholder="Search by ID or Member Name..."
              className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users List - Mobile Optimized */}
        <div className="space-y-3 md:space-y-4">
          {filteredUsers.length > 0 ? filteredUsers.map((user) => (
            <div key={user._id} className="bg-white rounded-lg md:rounded-xl shadow-md overflow-hidden">
              {/* Registration Header - Mobile Friendly */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-3 md:p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="w-full sm:w-auto">
                    <p className="text-orange-100 text-xs md:text-sm">Registration ID</p>
                    <p className="text-white font-bold text-sm md:text-lg break-all">{user.registrationId}</p>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'Active' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-orange-100 text-xs md:text-sm sm:hidden">
                      {new Date(user.registrationDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-orange-100 text-xs md:text-sm mt-2 hidden sm:block">
                  Registered: {new Date(user.registrationDate).toLocaleDateString()}
                </p>
              </div>

              {/* Members List - Mobile Optimized */}
              <div className="p-3 md:p-4">
                <div className="space-y-2 md:space-y-3">
                  {user.members.map((member, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-2 md:p-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="w-full sm:w-auto">
                          <p className="font-semibold text-gray-800 text-sm md:text-base">
                            {member.name || 'No Name'}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            📞 {member.phone || 'N/A'} • 🆔 {member.aadhar ? member.aadhar.slice(-4) : 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                          <p className="text-orange-600 font-semibold text-sm md:text-base">
                            ₹{member.payingAmount || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                  <button
                    onClick={() => handleEdit(user)}
                    className="flex-1 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => navigate(`/admin/user-details/${user._id}`)}
                    className="flex-1 px-3 md:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-xs md:text-sm"
                  >
                    👁️ View Details
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="flex-1 px-3 md:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs md:text-sm"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-6 md:p-8 text-center">
              <span className="text-4xl md:text-6xl mb-4 block">😕</span>
              <p className="text-gray-500 text-sm md:text-base mb-4">No users found</p>
              <button
                onClick={() => navigate('/admin/user-registration')}
                className="px-4 md:px-6 py-2 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base"
              >
                Register New User
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Mobile Responsive */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white rounded-lg md:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-3 md:p-4 flex justify-between items-center">
              <h2 className="text-lg md:text-xl font-bold">Edit Registration</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-3 md:p-4 space-y-3 md:space-y-4">
              {/* Registration ID (Read-only) */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Registration ID
                </label>
                <input
                  type="text"
                  name="registrationId"
                  value={editFormData.registrationId}
                  readOnly
                  className="w-full p-2 md:p-3 text-sm bg-gray-100 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={editFormData.status}
                  onChange={handleEditInputChange}
                  className="w-full p-2 md:p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Members Edit Section */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Members Details
                </label>
                {editFormData.members.map((member, index) => (
                  <div key={index} className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-sm md:text-base mb-2">Member {index + 1}</h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => handleEditInputChange(e, index, 'name')}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={member.phone}
                        onChange={(e) => handleEditInputChange(e, index, 'phone')}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="text"
                        placeholder="Aadhar"
                        value={member.aadhar}
                        onChange={(e) => handleEditInputChange(e, index, 'aadhar')}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <input
                        type="number"
                        placeholder="Paying Amount"
                        value={member.payingAmount}
                        onChange={(e) => handleEditInputChange(e, index, 'payingAmount')}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="sticky bottom-0 bg-white border-t p-3 md:p-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
