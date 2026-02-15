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
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header with Greeting and Refresh Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fadeIn">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Welcome back, {user?.name || 'Admin'}! Here's what's happening.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-xs bg-white px-3 py-2 rounded-lg shadow-sm">
              <span className="text-gray-500">📅</span>
              <span className="text-gray-700">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className={`text-sm ${refreshing ? 'animate-spin' : ''}`}>⟳</span>
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Total Remaining Amount Box - Prominent */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-5 md:p-6 animate-slideUp">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 rounded-xl p-3">
                <span className="text-white text-2xl md:text-3xl">⏳</span>
              </div>
              <div>
                <p className="text-indigo-100 text-xs md:text-sm font-medium">Total Remaining Balance</p>
                <p className="text-white text-2xl md:text-3xl font-bold">{stats.totalRemaining}</p>
                <p className="text-indigo-200 text-xs mt-1">Available after approved benefits</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2 text-xs text-white">
              <span className="opacity-80">💰 Collections - 📋 Approved = ⏳ Remaining</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          
          <div className="bg-white rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all border-l-4 border-orange-500 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Users</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
              </div>
              <span className="text-2xl md:text-3xl opacity-80">👥</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600 font-medium">↑ 12%</span>
              <span className="text-gray-400">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all border-l-4 border-green-500 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 mb-1">Active Benefits</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.activeBenefits}</p>
              </div>
              <span className="text-2xl md:text-3xl opacity-80">📋</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600 font-medium">↑ 8%</span>
              <span className="text-gray-400">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all border-l-4 border-purple-500 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Payments</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalPayments}</p>
              </div>
              <span className="text-2xl md:text-3xl opacity-80">💰</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-green-600 font-medium">↑ 15%</span>
              <span className="text-gray-400">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-5 shadow-md hover:shadow-lg transition-all border-l-4 border-amber-500 transform hover:-translate-y-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Approvals</p>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.pendingApprovals}</p>
              </div>
              <span className="text-2xl md:text-3xl opacity-80">⏳</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs">
              <span className="text-red-600 font-medium">↓ {stats.pendingApprovals}</span>
              <span className="text-gray-400">need attention</span>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-slideUp" style={{ animationDelay: '0.2s' }}>
          
          {/* Simple Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">Monthly Overview</h2>
              <div className="flex items-center gap-3 text-xs">
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
            
            <div className="h-48 md:h-64 flex items-end justify-center gap-2 md:gap-4">
              {getMonthLabels().map((label, index) => (
                <div key={index} className="flex flex-col items-center gap-1 w-full max-w-[40px]">
                  <div className="w-full flex flex-col items-center gap-1">
                    {/* Payment Bar */}
                    <div 
                      className="w-4 md:w-6 bg-indigo-600 rounded-t transition-all duration-500 hover:opacity-80"
                      style={{ 
                        height: `${(chartData.payments[index] / maxChartValue) * 120}px`,
                        minHeight: '4px'
                      }}
                    ></div>
                    {/* Benefit Bar */}
                    <div 
                      className="w-4 md:w-6 bg-green-500 rounded-t transition-all duration-500 hover:opacity-80"
                      style={{ 
                        height: `${(chartData.benefits[index] / maxChartValue) * 120}px`,
                        minHeight: '4px'
                      }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{label}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <span className="text-indigo-600 font-medium">₹{(chartData.payments.reduce((a, b) => a + b, 0)).toLocaleString('en-IN')}</span>
                <span>total payments</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-green-600 font-medium">₹{(chartData.benefits.reduce((a, b) => a + b, 0)).toLocaleString('en-IN')}</span>
                <span>total benefits</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-5">
            <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-2 md:space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <span className="text-lg md:text-xl shrink-0">
                        {activity.type === 'payment' ? '💰' : '📋'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 text-xs md:text-sm truncate">{activity.title}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
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
                <div className="text-center py-6 text-gray-400 text-sm">
                  No recent activities
                </div>
              )}
            </div>
            <button className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              View all activity →
            </button>
          </div>
        </div>

        {/* Approved Benefits History */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-5 animate-slideUp" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">Approved Benefits History</h2>
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
              {approvedHistory.length} approved
            </span>
          </div>

          {approvedHistory.length > 0 ? (
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="min-w-[600px] md:min-w-full">
                {/* Table Header */}
                <div className="grid grid-cols-4 gap-2 bg-gray-100 p-3 rounded-lg text-xs font-medium text-gray-600 mb-2">
                  <div>Application ID</div>
                  <div>Applicant</div>
                  <div>Benefit Type</div>
                  <div className="text-right">Amount</div>
                </div>

                {/* Table Rows */}
                <div className="space-y-2">
                  {approvedHistory.map((item, index) => (
                    <div 
                      key={index} 
                      className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg text-xs md:text-sm hover:bg-gray-100 transition-colors items-center"
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
          ) : (
            <div className="text-center py-8 text-gray-400">
              <span className="text-4xl mb-2 block opacity-30">📋</span>
              <p className="text-sm">No approved benefits yet</p>
            </div>
          )}

          <div className="mt-3 text-right">
            <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              View all approved benefits →
            </button>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString('en-IN')}
          </p>
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
