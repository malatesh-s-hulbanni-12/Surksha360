import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Settings() {
  const [totalAmount, setTotalAmount] = useState('₹0')
  const [approvedAmount, setApprovedAmount] = useState('₹0')
  const [remainingAmount, setRemainingAmount] = useState('₹0')
  const [loading, setLoading] = useState(true)

  const API_URL = "https://surksha360-backend.onrender.com/api"

  // Fetch amounts from database
  useEffect(() => {
    fetchAmounts()
  }, [])

  const fetchAmounts = async () => {
    try {
      setLoading(true)
      
      // Fetch all payments to calculate total completed payments
      const paymentsResponse = await axios.get(`${API_URL}/payments`)
      let payments = []
      
      if (Array.isArray(paymentsResponse.data)) {
        payments = paymentsResponse.data
      } else if (paymentsResponse.data.data && Array.isArray(paymentsResponse.data.data)) {
        payments = paymentsResponse.data.data
      }

      // Calculate total amount from completed payments
      let total = 0
      payments.forEach(payment => {
        if (payment.status === 'Completed') {
          total += (payment.amount || 10) * (payment.months?.length || 1)
        }
      })

      // Fetch all benefits to calculate approved amount
      const benefitsResponse = await axios.get(`${API_URL}/benefits/all`)
      const benefitsData = benefitsResponse.data.data || []
      
      // Calculate total approved amount from benefits
      let approved = 0
      benefitsData.forEach(benefit => {
        if (benefit.status === 'Approved') {
          const approvedValue = benefit.approvedAmount || Math.round(benefit.totalAmount * 0.5)
          approved += approvedValue
        }
      })

      // Calculate remaining amount (total - approved)
      const remaining = total - approved

      setTotalAmount(`₹${total.toLocaleString('en-IN')}`)
      setApprovedAmount(`₹${approved.toLocaleString('en-IN')}`)
      setRemainingAmount(`₹${remaining.toLocaleString('en-IN')}`)

    } catch (error) {
      console.error('Error fetching amounts:', error)
      setTotalAmount('₹0')
      setApprovedAmount('₹0')
      setRemainingAmount('₹0')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading financial data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-5 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">
            Financial Overview
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Track collections and approved benefits
          </p>
        </div>
        
        {/* Three Boxes Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          
          {/* Box 1: Total Amount Collection */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 rounded-lg p-2 md:p-3">
                <span className="text-orange-600 text-xl md:text-2xl">💰</span>
              </div>
              <h2 className="text-sm md:text-base font-medium text-gray-600">Total Collections</h2>
            </div>
            
            <div className="mt-2">
              <p className="text-2xl md:text-4xl font-bold text-gray-800 tracking-tight">
                {totalAmount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                All completed payments
              </p>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 bg-orange-400 rounded-full mr-1"></span>
                Installments & fees
              </p>
            </div>
          </div>

          {/* Box 2: Approved Benefits */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 rounded-lg p-2 md:p-3">
                <span className="text-green-600 text-xl md:text-2xl">📋</span>
              </div>
              <h2 className="text-sm md:text-base font-medium text-gray-600">Approved Benefits</h2>
            </div>
            
            <div className="mt-2">
              <p className="text-2xl md:text-4xl font-bold text-green-600 tracking-tight">
                {approvedAmount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                50% of approved claims
              </p>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Benefit payouts
              </p>
            </div>
          </div>

          {/* Box 3: Total Remaining */}
          <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-purple-100 rounded-lg p-2 md:p-3">
                <span className="text-purple-600 text-xl md:text-2xl">⏳</span>
              </div>
              <h2 className="text-sm md:text-base font-medium text-gray-600">Remaining Balance</h2>
            </div>
            
            <div className="mt-2">
              <p className="text-2xl md:text-4xl font-bold text-purple-600 tracking-tight">
                {remainingAmount}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Total - Approved
              </p>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                Available funds
              </p>
            </div>
          </div>
        </div>

        {/* Formula Card - Mobile Optimized */}
        <div className="mt-5 md:mt-8 bg-indigo-50 rounded-xl p-3 md:p-4 border border-indigo-100">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm">
            <span className="flex items-center gap-1">
              <span className="text-orange-600">💰</span>
              <span className="text-gray-700">Collections</span>
            </span>
            <span className="text-gray-400">−</span>
            <span className="flex items-center gap-1">
              <span className="text-green-600">📋</span>
              <span className="text-gray-700">Benefits</span>
            </span>
            <span className="text-gray-400">=</span>
            <span className="flex items-center gap-1">
              <span className="text-purple-600">⏳</span>
              <span className="text-gray-700 font-medium">Remaining</span>
            </span>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2">
            Updated in real-time from database
          </p>
        </div>

        {/* Last Updated Timestamp */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Last updated: {new Date().toLocaleTimeString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  )
}
