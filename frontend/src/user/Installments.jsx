import React, { useState, useEffect } from 'react'
import axios from 'axios'
import UserNavbar from '../user/UserNavbar'

const Installments = () => {
  const [familyId, setFamilyId] = useState('')
  const [familyData, setFamilyData] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)

  const API_URL = "https://surksha360-backend.onrender.com/api"

  // Fetch family details by ID
  const fetchFamilyDetails = async () => {
    if (!familyId.trim()) {
      setError('Please enter your Family ID')
      return
    }

    setLoading(true)
    setError('')
    setFamilyData(null)
    setPayments([])
    setSearchPerformed(true)

    try {
      // Fetch registrations
      const registrationsResponse = await axios.get(`${API_URL}/registrations`)
      const allRegistrations = registrationsResponse.data

      // Find family by registration ID
      const family = allRegistrations.find(reg => 
        reg.registrationId && reg.registrationId.toString() === familyId.toString()
      )

      if (!family) {
        setError('No family found with this ID')
        setLoading(false)
        return
      }

      setFamilyData(family)

      // Fetch payments for this family
      const paymentsResponse = await axios.get(`${API_URL}/payments`)
      let allPayments = []
      
      if (Array.isArray(paymentsResponse.data)) {
        allPayments = paymentsResponse.data
      } else if (paymentsResponse.data.data && Array.isArray(paymentsResponse.data.data)) {
        allPayments = paymentsResponse.data.data
      }

      // Filter payments for this family's members
      const familyMemberIds = family.members.map(m => m._id)
      const familyPayments = allPayments.filter(payment => 
        familyMemberIds.includes(payment.memberId) && payment.status === 'Completed'
      )

      setPayments(familyPayments)

    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Error fetching data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate payment statistics
  const calculateStats = () => {
    if (!familyData) return { paid: 0, due: 0, total: 0, paidMonths: 0, totalMonths: 0, members: 0 }

    const totalMembers = familyData.members.length
    const currentDate = new Date()
    const registrationDate = new Date(familyData.registrationDate)
    
    // Calculate months since registration
    const monthsSinceRegistration = 
      (currentDate.getFullYear() - registrationDate.getFullYear()) * 12 + 
      (currentDate.getMonth() - registrationDate.getMonth())
    
    const totalExpectedMonths = Math.max(0, monthsSinceRegistration) + 1 // Include current month
    const totalExpectedPayments = totalMembers * totalExpectedMonths * 10

    // Calculate paid amount
    let paidAmount = 0
    let paidMonthsCount = 0
    payments.forEach(payment => {
      paidAmount += (payment.amount || 10) * (payment.months?.length || 1)
      paidMonthsCount += payment.months?.length || 1
    })

    const dueAmount = Math.max(0, totalExpectedPayments - paidAmount)

    return {
      paid: paidAmount,
      due: dueAmount,
      total: totalExpectedPayments,
      paidMonths: paidMonthsCount,
      totalMonths: totalExpectedMonths,
      members: totalMembers
    }
  }

  const stats = calculateStats()

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchFamilyDetails()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <UserNavbar />
      
      <div className="flex-grow pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Animated Header */}
          <div className="text-center mb-10 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Installment Tracker
            </h1>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
              Enter your family ID to view your payment history and track your installments
            </p>
          </div>

          {/* Search Section with Animation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-slideUp border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 animate-bounce-subtle">
                  🔍
                </div>
                <input
                  type="text"
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your Family ID (e.g., FAM001)"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all text-gray-700"
                  disabled={loading}
                />
              </div>
              <button
                onClick={fetchFamilyDetails}
                disabled={loading || !familyId.trim()}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  'Track Installments'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <span>⚠️</span>
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Results Section with Animations */}
          {searchPerformed && !loading && (
            <div className="space-y-6 animate-fadeIn">
              {familyData ? (
                <>
                  {/* Family Info Card */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl p-4 animate-float">
                        <span className="text-3xl text-white">👥</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">{familyData.registrationId}</h2>
                        <p className="text-gray-500 text-sm">
                          Registered on {new Date(familyData.registrationDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Payments Done Card */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-slideLeft">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-xl p-3 animate-pulse-subtle">
                          <span className="text-3xl text-white">✅</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-green-100 text-sm font-medium mb-1">Payments Done</p>
                          <p className="text-3xl font-bold text-white">₹{stats.paid.toLocaleString('en-IN')}</p>
                          <p className="text-green-100 text-xs mt-2">
                            {stats.paidMonths} month{stats.paidMonths !== 1 ? 's' : ''} paid
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-1000 animate-growWidth"
                          style={{ width: `${stats.total > 0 ? (stats.paid / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Payments Due Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 animate-slideRight">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 rounded-xl p-3 animate-pulse-subtle">
                          <span className="text-3xl text-white">⏳</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-orange-100 text-sm font-medium mb-1">Payments Due</p>
                          <p className="text-3xl font-bold text-white">₹{stats.due.toLocaleString('en-IN')}</p>
                          <p className="text-orange-100 text-xs mt-2">
                            {stats.totalMonths - stats.paidMonths} month{stats.totalMonths - stats.paidMonths !== 1 ? 's' : ''} remaining
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-white rounded-full transition-all duration-1000 animate-growWidth"
                          style={{ width: `${stats.total > 0 ? (stats.due / stats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Member-wise Breakdown */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-fadeIn">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse"></span>
                      Member Details
                    </h3>
                    <div className="space-y-3">
                      {familyData.members.map((member, index) => {
                        const memberPayments = payments.filter(p => p.memberId === member._id)
                        const memberPaid = memberPayments.reduce((sum, p) => sum + ((p.amount || 10) * (p.months?.length || 1)), 0)
                        
                        return (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div>
                              <p className="font-medium text-gray-800">{member.name}</p>
                              <p className="text-xs text-gray-500">{member.phone || 'No phone'}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">₹{memberPaid}</p>
                              <p className="text-xs text-gray-400">paid</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Recent Payments Timeline */}
                  {payments.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 animate-fadeIn">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-indigo-500 rounded-full animate-pulse"></span>
                        Recent Payments
                      </h3>
                      <div className="space-y-3">
                        {payments.slice(0, 5).map((payment, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all duration-300 hover:pl-4"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl animate-bounce-subtle">💰</span>
                              <div>
                                <p className="font-medium text-gray-800">{payment.memberName}</p>
                                <p className="text-xs text-gray-500">
                                  {payment.months?.join(', ') || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-600">₹{(payment.amount || 10) * (payment.months?.length || 1)}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(payment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100 animate-fadeIn">
                  <div className="text-6xl mb-4 opacity-30 animate-float">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Found</h3>
                  <p className="text-gray-500">Enter a valid Family ID to view installment details</p>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!searchPerformed && !loading && (
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-dashed border-gray-300 animate-pulse">
              <div className="text-7xl mb-4 opacity-30 animate-float">📊</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Installment Tracker</h3>
              <p className="text-gray-500">Enter your Family ID above to view your payment status</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Built directly in this component */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About Section */}
            <div className="space-y-3 animate-fadeIn">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-400 rounded-full"></span>
                About Us
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Suraksha360 helps families track and manage their installment payments efficiently and securely.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-400 rounded-full"></span>
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:pl-1">Home</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:pl-1">About Us</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:pl-1">Contact</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors hover:pl-1">FAQs</a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-400 rounded-full"></span>
                Contact Info
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span>📍</span>
                  <span>123 Business Street, City</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span>📞</span>
                  <span>+91 98765 43210</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span>✉️</span>
                  <span>support@suraksha360.com</span>
                </li>
              </ul>
            </div>

            {/* Working Hours */}
            <div className="space-y-3 animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-400 rounded-full"></span>
                Working Hours
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
                <li>Saturday: 10:00 AM - 4:00 PM</li>
                <li>Sunday: Closed</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © 2024 Suraksha360. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Add custom animations with style tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideLeft {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideRight {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes pulse-subtle {
          0% { opacity: 1; }
          50% { opacity: 0.8; }
          100% { opacity: 1; }
        }
        
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        
        @keyframes growWidth {
          from { width: 0; }
          to { width: 100%; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideLeft {
          animation: slideLeft 0.5s ease-out;
        }
        
        .animate-slideRight {
          animation: slideRight 0.5s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        
        .animate-growWidth {
          animation: growWidth 1s ease-out;
        }
      `}</style>
    </div>
  )
}

export default Installments
