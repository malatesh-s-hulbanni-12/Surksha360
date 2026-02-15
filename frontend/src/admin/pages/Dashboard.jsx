import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeBenefits: 0,
    totalPayments: '₹0',
    pendingApprovals: 0,
    totalRemaining: '₹0'
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [approvedHistory, setApprovedHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [chartData, setChartData] = useState({
    payments: [0, 0, 0, 0, 0, 0],
    benefits: [0, 0, 0, 0, 0, 0]
  })

  const API_URL = "https://surksha360-backend.onrender.com/api"

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch registrations for total users
      const registrationsResponse = await axios.get(`${API_URL}/registrations`)
      const registrations = registrationsResponse.data || []
      
      // Calculate total members (users)
      let totalMembers = 0
      registrations.forEach(reg => {
        totalMembers += reg.members?.length || 0
      })

      // Fetch payments for total payments and chart
      const paymentsResponse = await axios.get(`${API_URL}/payments`)
      let payments = []
      if (Array.isArray(paymentsResponse.data)) {
        payments = paymentsResponse.data
      } else if (paymentsResponse.data.data && Array.isArray(paymentsResponse.data.data)) {
        payments = paymentsResponse.data.data
      }

      // Calculate total amount from completed payments
      let totalPaymentsAmount = 0
      const monthlyPayments = [0, 0, 0, 0, 0, 0] // Last 6 months
      
      payments.forEach(payment => {
        if (payment.status === 'Completed') {
          const amount = (payment.amount || 10) * (payment.months?.length || 1)
          totalPaymentsAmount += amount
          
          // Group by month for chart
          const date = new Date(payment.createdAt)
          const month = date.getMonth()
          const year = date.getFullYear()
          const currentYear = new Date().getFullYear()
          const currentMonth = new Date().getMonth()
          
          // Only consider last 6 months
          for (let i = 0; i < 6; i++) {
            const targetDate = new Date(currentYear, currentMonth - i, 1)
            if (date >= targetDate) {
              monthlyPayments[5 - i] += amount
              break
            }
          }
        }
      })

      // Fetch benefits for active benefits and approved history
      const benefitsResponse = await axios.get(`${API_URL}/benefits/all`)
      const benefitsData = benefitsResponse.data.data || []
      
      // Calculate active benefits (Pending + Under Review)
      const activeBenefitsCount = benefitsData.filter(b => 
        b.status === 'Pending' || b.status === 'Under Review'
      ).length

      // Calculate pending approvals
      const pendingApprovalsCount = benefitsData.filter(b => 
        b.status === 'Pending'
      ).length

      // Calculate approved amount and chart data
      let approvedAmount = 0
      const approved = []
      const monthlyBenefits = [0, 0, 0, 0, 0, 0] // Last 6 months
      
      benefitsData.forEach(benefit => {
        if (benefit.status === 'Approved') {
          const approvedValue = benefit.approvedAmount || Math.round(benefit.totalAmount * 0.5)
          approvedAmount += approvedValue
          
          approved.push({
            id: benefit.applicationId,
            name: benefit.memberName,
            type: benefit.benefitType,
            amount: approvedValue,
            date: new Date(benefit.updatedAt || benefit.createdAt).toLocaleDateString('en-IN')
          })
          
          // Group by month for chart
          const date = new Date(benefit.updatedAt || benefit.createdAt)
          const currentYear = new Date().getFullYear()
          const currentMonth = new Date().getMonth()
          
          for (let i = 0; i < 6; i++) {
            const targetDate = new Date(currentYear, currentMonth - i, 1)
            if (date >= targetDate) {
              monthlyBenefits[5 - i] += approvedValue
              break
            }
          }
        }
      })

      // Calculate total remaining (total payments - approved amount)
      const totalRemainingAmount = totalPaymentsAmount - approvedAmount

      setStats({
        totalUsers: totalMembers,
        activeBenefits: activeBenefitsCount,
        totalPayments: `₹${totalPaymentsAmount.toLocaleString('en-IN')}`,
        pendingApprovals: pendingApprovalsCount,
        totalRemaining: `₹${totalRemainingAmount.toLocaleString('en-IN')}`
      })

      setChartData({
        payments: monthlyPayments,
        benefits: monthlyBenefits
      })

      // Set approved history (last 5)
      setApprovedHistory(approved.slice(0, 5))

      // Generate recent activities
      const activities = [
        ...payments.slice(0, 2).map(p => ({
          id: p._id,
          type: 'payment',
          title: `Payment received from ${p.memberName || 'member'}`,
          time: new Date(p.createdAt).toLocaleDateString('en-IN'),
          status: 'Completed'
        })),
        ...benefitsData.slice(0, 3).map(b => ({
          id: b._id,
          type: 'benefit',
          title: `${b.memberName} applied for ${b.benefitType}`,
          time: new Date(b.createdAt).toLocaleDateString('en-IN'),
          status: b.status
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4)

      setRecentActivities(activities)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchDashboardData()
  }

  // Get month labels for chart
  const getMonthLabels = () => {
    const labels = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      labels.push(date.toLocaleString('default', { month: 'short' }))
    }
    return labels
  }

  // Calculate max value for chart scaling
  const maxChartValue = Math.max(
    ...chartData.payments,
    ...chartData.benefits,
    1
  )

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-3 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
        <div className="space-y-4 md:space-y-6">
        
          {/* Header with Greeting and Refresh Button */}
          <div className="flex flex-col gap-3 animate-fadeIn">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Dashboard Overview
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1">
                Welcome back, {user?.name || 'Admin'}!
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs bg-white px-3 py-2 rounded-lg shadow-sm">
                <span className="text-gray-500">📅</span>
                <span className="text-gray-700">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <span className={`text-sm ${refreshing ? 'animate-spin' : ''}`}>⟳</span>
                <span>{refreshing ? '...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Total Remaining Amount Box - Prominent */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-4 md:p-6 animate-slideUp">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <span className="text-white text-xl md:text-3xl">⏳</span>
              </div>
              <div className="flex-1">
                <p className="text-indigo-100 text-xs font-medium">Total Remaining Balance</p>
                <p className="text-white text-xl md:text-3xl font-bold">{stats.totalRemaining}</p>
                <p className="text-indigo-200 text-[10px] md:text-xs mt-1">Available after approved benefits</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 md:gap-4 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            
            <div className="bg-white rounded-lg p-3 md:p-5 shadow-md border-l-4 border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1">Total Users</p>
                  <p className="text-base md:text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <span className="text-xl md:text-3xl opacity-80">👥</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-5 shadow-md border-l-4 border-green-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1">Active Benefits</p>
                  <p className="text-base md:text-2xl font-bold text-gray-800">{stats.activeBenefits}</p>
                </div>
                <span className="text-xl md:text-3xl opacity-80">📋</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-5 shadow-md border-l-4 border-purple-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1">Total Payments</p>
                  <p className="text-base md:text-2xl font-bold text-gray-800">{stats.totalPayments}</p>
                </div>
                <span className="text-xl md:text-3xl opacity-80">💰</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 md:p-5 shadow-md border-l-4 border-amber-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] md:text-xs text-gray-500 mb-1">Pending Approvals</p>
                  <p className="text-base md:text-2xl font-bold text-gray-800">{stats.pendingApprovals}</p>
                </div>
                <span className="text-xl md:text-3xl opacity-80">⏳</span>
              </div>
            </div>
          </div>

          {/* Simple Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-3 md:p-5 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-lg font-semibold text-gray-800">Monthly Overview</h2>
              <div className="flex items-center gap-2 text-[10px] md:text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  <span className="text-gray-600">Payments</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-gray-600">Benefits</span>
                </div>
              </div>
            </div>
            
            <div className="h-40 md:h-64 flex items-end justify-center gap-1 md:gap-4">
              {getMonthLabels().map((label, index) => (
                <div key={index} className="flex flex-col items-center gap-1 w-full max-w-[25px] md:max-w-[40px]">
                  <div className="w-full flex flex-col items-center gap-1">
                    {/* Payment Bar */}
                    <div 
                      className="w-3 md:w-6 bg-indigo-600 rounded-t"
                      style={{ 
                        height: `${(chartData.payments[index] / maxChartValue) * 80}px`,
                        minHeight: '2px'
                      }}
                    ></div>
                    {/* Benefit Bar */}
                    <div 
                      className="w-3 md:w-6 bg-green-500 rounded-t"
                      style={{ 
                        height: `${(chartData.benefits[index] / maxChartValue) * 80}px`,
                        minHeight: '2px'
                      }}
                    ></div>
                  </div>
                  <span className="text-[8px] md:text-xs text-gray-500 mt-1">{label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 flex flex-wrap justify-center gap-3 text-[8px] md:text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span className="text-indigo-600 font-medium">₹{(chartData.payments.reduce((a, b) => a + b, 0)).toLocaleString('en-IN')}</span>
                <span>payments</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-medium">₹{(chartData.benefits.reduce((a, b) => a + b, 0)).toLocaleString('en-IN')}</span>
                <span>benefits</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-3 md:p-5 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-sm md:text-lg font-semibold text-gray-800 mb-3">Recent Activity</h2>
            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-base md:text-xl shrink-0">
                        {activity.type === 'payment' ? '💰' : '📋'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-xs md:text-sm truncate">{activity.title}</p>
                        <p className="text-[8px] md:text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    <span className={`text-[8px] md:text-xs px-1.5 py-0.5 rounded-full shrink-0 ${
                      activity.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-600' :
                      activity.status === 'Approved' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-400 text-xs">
                  No recent activities
                </div>
              )}
            </div>
          </div>

          {/* Approved Benefits History */}
          <div className="bg-white rounded-xl shadow-md p-3 md:p-5 animate-slideUp" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm md:text-lg font-semibold text-gray-800">Approved Benefits</h2>
              <span className="text-[8px] md:text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {approvedHistory.length} approved
              </span>
            </div>

            {approvedHistory.length > 0 ? (
              <div className="space-y-2">
                {/* Mobile View - Card Layout */}
                <div className="block md:hidden space-y-2">
                  {approvedHistory.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-indigo-600 text-xs">{item.id}</span>
                        <span className="font-bold text-green-600 text-xs">₹{item.amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800 text-xs">{item.name}</span>
                        <span className="text-gray-500 text-[8px]">{item.type}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View - Table Layout */}
                <div className="hidden md:block overflow-x-auto">
                  <div className="min-w-full">
                    <div className="grid grid-cols-4 gap-2 bg-gray-100 p-3 rounded-lg text-xs font-medium text-gray-600 mb-2">
                      <div>Application ID</div>
                      <div>Applicant</div>
                      <div>Benefit Type</div>
                      <div className="text-right">Amount</div>
                    </div>
                    <div className="space-y-2">
                      {approvedHistory.map((item, index) => (
                        <div 
                          key={index} 
                          className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg text-xs hover:bg-gray-100 items-center"
                        >
                          <div className="font-mono text-indigo-600 truncate">{item.id}</div>
                          <div className="font-medium text-gray-800 truncate">{item.name}</div>
                          <div className="text-gray-600 truncate">{item.type}</div>
                          <div className="text-right font-bold text-green-600">₹{item.amount.toLocaleString('en-IN')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400">
                <span className="text-3xl mb-2 block opacity-30">📋</span>
                <p className="text-xs">No approved benefits yet</p>
              </div>
            )}
          </div>

          {/* Last Updated */}
          <div className="text-center">
            <p className="text-[8px] md:text-xs text-gray-400">
              Last updated: {new Date().toLocaleTimeString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
