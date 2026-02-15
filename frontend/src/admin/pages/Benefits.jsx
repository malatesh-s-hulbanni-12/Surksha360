import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Benefits() {
  const [filter, setFilter] = useState('all')
  const [benefits, setBenefits] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: '₹0',
    approved: '₹0',
    pending: '₹0',
    count: 0
  })
  const [selectedBenefit, setSelectedBenefit] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showAcknowledgmentModal, setShowAcknowledgmentModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  const API_URL = 'https://surksha360-backend.onrender.com/api'

  // Toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  // Fetch all benefits
  useEffect(() => {
    fetchBenefits()
  }, [])

  const fetchBenefits = async () => {
    try {
      setLoading(true)
      // Updated endpoint to use benefits1
      const response = await axios.get(`${API_URL}/benefits/all`)
      const benefitsData = response.data.data || []
      
      // Format benefits for display
      const formattedBenefits = benefitsData.map(benefit => ({
        id: benefit._id,
        applicationId: benefit.applicationId,
        user: benefit.memberName,
        type: benefit.benefitType,
        amount: benefit.totalAmount,
        formattedAmount: `₹${benefit.totalAmount.toLocaleString('en-IN')}`,
        approvedAmount: benefit.approvedAmount || Math.round(benefit.totalAmount * 0.5),
        formattedApprovedAmount: `₹${(benefit.approvedAmount || Math.round(benefit.totalAmount * 0.5)).toLocaleString('en-IN')}`,
        status: benefit.status,
        date: new Date(benefit.createdAt).toLocaleDateString('en-IN'),
        familyId: benefit.familyId,
        reason: benefit.reason,
        description: benefit.description,
        place: benefit.place,
        address: benefit.address,
        documents: benefit.documents || [],
        memberAadhar: benefit.memberAadhar,
        memberPhone: benefit.memberPhone,
        memberName: benefit.memberName
      }))

      setBenefits(formattedBenefits)
      calculateStats(formattedBenefits)
    } catch (error) {
      console.error('Error fetching benefits:', error)
      showToast('Error fetching benefits data', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = (benefitsData) => {
    let total = 0
    let approved = 0
    let pending = 0

    benefitsData.forEach(benefit => {
      const amount = benefit.amount || 0
      total += amount
      
      if (benefit.status === 'Approved') {
        approved += benefit.approvedAmount || 0
      } else if (benefit.status === 'Pending' || benefit.status === 'Under Review') {
        pending += amount
      }
    })

    setStats({
      total: `₹${total.toLocaleString('en-IN')}`,
      approved: `₹${approved.toLocaleString('en-IN')}`,
      pending: `₹${pending.toLocaleString('en-IN')}`,
      count: benefitsData.length
    })
  }

  // Update benefit status
  const updateStatus = async (id, newStatus) => {
    try {
      setActionLoading(true)
      // Updated endpoint to use benefits1
      await axios.patch(`${API_URL}/benefits/${id}/status`, {
        status: newStatus,
        reviewedBy: 'Admin',
        reviewNotes: `Status updated to ${newStatus}`
      })
      
      showToast(`Application ${newStatus.toLowerCase()} successfully`, 'success')
      fetchBenefits() // Refresh data
      
      if (newStatus === 'Approved') {
        // Find the benefit to show acknowledgment
        const benefit = benefits.find(b => b.id === id)
        if (benefit) {
          setSelectedBenefit(benefit)
          setShowAcknowledgmentModal(true)
        }
      }
    } catch (error) {
      console.error('Error updating status:', error)
      showToast('Error updating status', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // View benefit details
  const viewDetails = (benefit) => {
    setSelectedBenefit(benefit)
    setShowDetailsModal(true)
  }

  // Generate and print acknowledgment
  const printAcknowledgment = (benefit) => {
    const appData = benefit || selectedBenefit
    if (!appData) return

    const appNumber = appData.applicationId
    const today = new Date()
    const eligibleAmount = appData.approvedAmount

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Benefit Approval Acknowledgement</title>
        <style>
          @page {
              size: A4;
              margin: 20mm;
          }
          
          body {
              font-family: Arial, sans-serif;
              background: #f4f4f4;
              margin: 0;
              padding: 20px;
          }
          
          .a4-container {
              width: 210mm;
              min-height: 297mm;
              background: #fff;
              margin: auto;
              padding: 20px;
              border: 1px solid #000;
              box-sizing: border-box;
          }
          
          .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
          }
          
          .logo {
              width: 80px;
              height: auto;
          }
          
          h1 {
              margin: 5px 0;
              font-size: 24px;
          }
          
          .approved-badge {
              background: #10b981;
              color: white;
              padding: 5px 15px;
              border-radius: 30px;
              display: inline-block;
              margin: 10px 0;
              font-weight: bold;
          }
          
          .details {
              margin-top: 20px;
              line-height: 1.8;
              font-size: 16px;
          }
          
          .label {
              font-weight: bold;
          }
          
          .section {
              margin-bottom: 15px;
          }
          
          .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
          }
          
          .signature {
              margin-top: 60px;
              text-align: center;
          }
          
          .note {
              margin-top: 30px;
              font-size: 14px;
              color: #555;
              font-style: italic;
          }
          
          .amount-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
          }
          
          .value-line {
            border-bottom: 1px dotted #999;
            padding: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="a4-container">
          <div class="header">
            <img src="/logo.png" class="logo" alt="Logo" onerror="this.src='https://via.placeholder.com/80?text=Logo'">
            <h1>Suraksha 360</h1>
            <p>Benefit Approval Acknowledgement</p>
            <div class="approved-badge">✓ APPROVED</div>
          </div>

          <div class="details">
            <div class="section">
              <span class="label">Application Number:</span>
              <span class="value-line"><strong>${appNumber}</strong></span>
            </div>

            <div class="section">
              <span class="label">Approval Date:</span>
              <span class="value-line">${today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>

            <div class="section">
              <span class="label">Family ID:</span>
              <span class="value-line">${appData.familyId || '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Applicant Name:</span>
              <span class="value-line">${appData.memberName || '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Aadhaar Number:</span>
              <span class="value-line">${appData.memberAadhar ? 'XXXX-XXXX-' + appData.memberAadhar.toString().slice(-4) : '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Phone Number:</span>
              <span class="value-line">${appData.memberPhone || '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Benefit Type:</span>
              <span class="value-line">${appData.type || '_____________'}</span>
            </div>

            <div class="amount-box">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span class="label">Total Claimed Amount:</span>
                <span>₹ ${appData.amount ? appData.amount.toLocaleString('en-IN') : '0'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; border-top: 2px solid #10b981; padding-top: 10px;">
                <span class="label">Approved Amount (50%):</span>
                <span style="color: #10b981; font-weight: bold; font-size: 20px;">₹ ${eligibleAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="note">
              This is to certify that the above benefit claim has been reviewed and approved by Suraksha 360. 
              The approved amount of 50% of the claimed total will be processed and disbursed within 7-10 working days.
            </div>

            <div class="footer">
              <div class="signature">
                _______________________<br>
                Applicant Signature
              </div>

              <div class="signature">
                _______________________<br>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  // Download acknowledgment
  const downloadAcknowledgment = (benefit) => {
    const appData = benefit || selectedBenefit
    if (!appData) return

    const appNumber = appData.applicationId
    const today = new Date()
    const eligibleAmount = appData.approvedAmount

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Benefit Approval Acknowledgement</title>
        <style>
          @page {
              size: A4;
              margin: 20mm;
          }
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
          }
          .a4-container {
              width: 210mm;
              min-height: 297mm;
              background: #fff;
              margin: auto;
              padding: 20px;
              border: 1px solid #000;
              box-sizing: border-box;
          }
          .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
          }
          .logo {
              width: 80px;
              height: auto;
          }
          h1 {
              margin: 5px 0;
              font-size: 24px;
          }
          .approved-badge {
              background: #10b981;
              color: white;
              padding: 5px 15px;
              border-radius: 30px;
              display: inline-block;
              margin: 10px 0;
              font-weight: bold;
          }
          .details {
              margin-top: 20px;
              line-height: 1.8;
              font-size: 16px;
          }
          .label {
              font-weight: bold;
          }
          .section {
              margin-bottom: 15px;
          }
          .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
          }
          .signature {
              margin-top: 60px;
              text-align: center;
          }
          .note {
              margin-top: 30px;
              font-size: 14px;
              color: #555;
              font-style: italic;
          }
          .amount-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
          }
          .value-line {
            border-bottom: 1px dotted #999;
            padding: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="a4-container">
          <div class="header">
            <img src="/logo.png" class="logo" alt="Logo">
            <h1>Suraksha 360</h1>
            <p>Benefit Approval Acknowledgement</p>
            <div class="approved-badge">✓ APPROVED</div>
          </div>

          <div class="details">
            <div class="section">
              <span class="label">Application Number:</span>
              <span class="value-line"><strong>${appNumber}</strong></span>
            </div>

            <div class="section">
              <span class="label">Approval Date:</span>
              <span class="value-line">${today.toLocaleDateString('en-IN')}</span>
            </div>

            <div class="section">
              <span class="label">Family ID:</span>
              <span class="value-line">${appData.familyId || '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Applicant Name:</span>
              <span class="value-line">${appData.memberName || '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Aadhaar Number:</span>
              <span class="value-line">${appData.memberAadhar ? 'XXXX-XXXX-' + appData.memberAadhar.toString().slice(-4) : '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Phone Number:</span>
              <span class="value-line">${appData.memberPhone || '_____________'}</span>
            </div>

            <div class="section">
              <span class="label">Benefit Type:</span>
              <span class="value-line">${appData.type || '_____________'}</span>
            </div>

            <div class="amount-box">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span class="label">Total Claimed Amount:</span>
                <span>₹ ${appData.amount ? appData.amount.toLocaleString('en-IN') : '0'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 18px; border-top: 2px solid #10b981; padding-top: 10px;">
                <span class="label">Approved Amount (50%):</span>
                <span style="color: #10b981; font-weight: bold; font-size: 20px;">₹ ${eligibleAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div class="note">
              This is to certify that the above benefit claim has been reviewed and approved by Suraksha 360. 
              The approved amount of 50% of the claimed total will be processed and disbursed within 7-10 working days.
            </div>

            <div class="footer">
              <div class="signature">
                _______________________<br>
                Applicant Signature
              </div>

              <div class="signature">
                _______________________<br>
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `approval-acknowledgment-${appNumber}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Filter benefits based on selected filter
  const filteredBenefits = benefits.filter(benefit => {
    if (filter === 'all') return true
    return benefit.status.toLowerCase() === filter.toLowerCase()
  })

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Approved':
        return 'bg-green-100 text-green-600'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600'
      case 'Under Review':
        return 'bg-blue-100 text-blue-600'
      case 'Rejected':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved':
        return '✓'
      case 'Pending':
        return '⋯'
      case 'Under Review':
        return '◎'
      case 'Rejected':
        return '✕'
      default:
        return '○'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-4 text-gray-600 animate-pulse">Loading benefits data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-24 right-4 z-50 p-4 rounded-lg shadow-xl animate-slideInRight max-w-md ${
          toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center gap-3">
            <span className={toast.type === 'success' ? 'text-green-600 text-xl' : 'text-red-600 text-xl'}>
              {toast.type === 'success' ? '✓' : '⚠'}
            </span>
            <p className={toast.type === 'success' ? 'text-green-700' : 'text-red-700'}>{toast.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Animation */}
        <div className="animate-fadeIn">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Benefits Management
          </h1>
          <p className="text-gray-600">Manage and track all benefit applications (50% approval amount)</p>
        </div>

        {/* Stats Cards with Hover Animations */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp">
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            <p className="text-xs text-gray-500 mb-1">Total Claimed</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-400 mt-1">All applications</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            <p className="text-xs text-gray-500 mb-1">Approved (50%)</p>
            <p className="text-xl font-bold text-green-600">{stats.approved}</p>
            <p className="text-xs text-gray-400 mt-1">Half of claimed amount</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            <p className="text-xs text-gray-500 mb-1">Pending</p>
            <p className="text-xl font-bold text-orange-600">{stats.pending}</p>
            <p className="text-xs text-gray-400 mt-1">Awaiting review</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            <p className="text-xs text-gray-500 mb-1">Total Claims</p>
            <p className="text-xl font-bold text-indigo-600">{stats.count}</p>
            <p className="text-xs text-gray-400 mt-1">Applications</p>
          </div>
        </div>

        {/* Filter Tabs with Animation */}
        <div className="flex flex-wrap gap-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
          {['all', 'pending', 'under review', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-all transform hover:scale-105 ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f}
              {f !== 'all' && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
                  {benefits.filter(b => b.status.toLowerCase() === f.toLowerCase()).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Benefits Table with Animation */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefit Type</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claimed Amount</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Approved (50%)</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBenefits.length > 0 ? (
                  filteredBenefits.map((benefit, index) => (
                    <tr 
                      key={benefit.id} 
                      className="hover:bg-gray-50 transition-colors animate-fadeIn"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-4 md:px-6 py-4">
                        <div className="font-medium text-gray-800">{benefit.user}</div>
                        <div className="text-xs text-gray-500">Family: {benefit.familyId}</div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-sm font-mono text-indigo-600">{benefit.applicationId}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-sm text-gray-600">{benefit.type}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="font-medium text-gray-800">{benefit.formattedAmount}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        {benefit.status === 'Approved' ? (
                          <span className="font-medium text-green-600">{benefit.formattedApprovedAmount}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${getStatusColor(benefit.status)}`}>
                          <span>{getStatusIcon(benefit.status)}</span>
                          {benefit.status}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-gray-600">
                        {benefit.date}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => viewDetails(benefit)}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                            disabled={actionLoading}
                          >
                            View
                          </button>
                          
                          {benefit.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(benefit.id, 'Approved')}
                                className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                                disabled={actionLoading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(benefit.id, 'Under Review')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                disabled={actionLoading}
                              >
                                Review
                              </button>
                            </>
                          )}
                          
                          {benefit.status === 'Under Review' && (
                            <>
                              <button
                                onClick={() => updateStatus(benefit.id, 'Approved')}
                                className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                                disabled={actionLoading}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(benefit.id, 'Pending')}
                                className="text-yellow-600 hover:text-yellow-800 text-sm font-medium transition-colors"
                                disabled={actionLoading}
                              >
                                Send to Pending
                              </button>
                            </>
                          )}
                          
                          {benefit.status === 'Approved' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedBenefit(benefit)
                                  setShowAcknowledgmentModal(true)
                                }}
                                className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors"
                              >
                                Acknowledgment
                              </button>
                              <button
                                onClick={() => updateStatus(benefit.id, 'Under Review')}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                disabled={actionLoading}
                              >
                                Move to Review
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">📋</div>
                      <p>No {filter === 'all' ? '' : filter} applications found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBenefit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Application Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Application ID</span>
                <span className="font-mono text-indigo-600 font-medium">{selectedBenefit.applicationId}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedBenefit.status)}`}>
                  <span>{getStatusIcon(selectedBenefit.status)}</span>
                  {selectedBenefit.status}
                </span>
              </div>

              {/* Amount Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Claimed Amount:</span>
                  <span className="font-bold text-gray-800">{selectedBenefit.formattedAmount}</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Approved Amount (50%):</span>
                  <span className="font-bold text-green-600">{selectedBenefit.formattedApprovedAmount}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium">{selectedBenefit.user}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Family ID</p>
                    <p className="font-medium">{selectedBenefit.familyId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-medium">{selectedBenefit.memberPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Aadhar</p>
                    <p className="font-medium">{selectedBenefit.memberAadhar ? 'XXXX-XXXX-' + selectedBenefit.memberAadhar.toString().slice(-4) : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-800 mb-3">Application Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Benefit Type</p>
                    <p className="font-medium">{selectedBenefit.type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Place</p>
                    <p className="font-medium">{selectedBenefit.place || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reason</p>
                    <p className="font-medium">{selectedBenefit.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Description</p>
                    <p className="text-sm text-gray-600">{selectedBenefit.description || 'No description provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-600">
                      {selectedBenefit.address ? 
                        `${selectedBenefit.address.street}, ${selectedBenefit.address.city}, ${selectedBenefit.address.district || ''}, ${selectedBenefit.address.state || ''} - ${selectedBenefit.address.pincode}` 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              {selectedBenefit.documents && selectedBenefit.documents.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Uploaded Documents</h3>
                  <div className="space-y-2">
                    {selectedBenefit.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <div>
                            <p className="text-sm font-medium text-gray-700 capitalize">{doc.documentType.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <a 
                          href={`${API_URL}/uploads/benefits/${doc.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-4 flex gap-3">
                {selectedBenefit.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(selectedBenefit.id, 'Approved')
                        setShowDetailsModal(false)
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {actionLoading ? 'Processing...' : 'Approve (50%)'}
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedBenefit.id, 'Under Review')
                        setShowDetailsModal(false)
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Mark for Review
                    </button>
                  </>
                )}
                {selectedBenefit.status === 'Under Review' && (
                  <>
                    <button
                      onClick={() => {
                        updateStatus(selectedBenefit.id, 'Approved')
                        setShowDetailsModal(false)
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {actionLoading ? 'Processing...' : 'Approve (50%)'}
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedBenefit.id, 'Pending')
                        setShowDetailsModal(false)
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Send to Pending
                    </button>
                  </>
                )}
                {selectedBenefit.status === 'Approved' && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false)
                        setShowAcknowledgmentModal(true)
                      }}
                      className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Acknowledgment
                    </button>
                    <button
                      onClick={() => {
                        updateStatus(selectedBenefit.id, 'Under Review')
                        setShowDetailsModal(false)
                      }}
                      disabled={actionLoading}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Move to Review
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledgment Modal */}
      {showAcknowledgmentModal && selectedBenefit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Approval Acknowledgment</h2>
              <button
                onClick={() => setShowAcknowledgmentModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {/* Acknowledgment Preview */}
              <div className="border-2 border-gray-200 p-6 rounded-lg mb-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-3xl">✓</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Suraksha 360</h3>
                  <p className="text-sm text-gray-500">Benefit Approval Acknowledgment</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Application ID:</span>
                    <span className="text-sm font-mono font-medium">{selectedBenefit.applicationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Applicant Name:</span>
                    <span className="text-sm font-medium">{selectedBenefit.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Family ID:</span>
                    <span className="text-sm font-medium">{selectedBenefit.familyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Benefit Type:</span>
                    <span className="text-sm font-medium">{selectedBenefit.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Claimed Amount:</span>
                    <span className="text-sm font-medium">{selectedBenefit.formattedAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                    <span className="text-base font-bold text-gray-700">Approved Amount (50%):</span>
                    <span className="text-lg font-bold text-green-600">{selectedBenefit.formattedApprovedAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    printAcknowledgment(selectedBenefit)
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  Print
                </button>
                <button
                  onClick={() => {
                    downloadAcknowledgment(selectedBenefit)
                  }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <span>📥</span>
                  Download
                </button>
                <button
                  onClick={() => setShowAcknowledgmentModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
