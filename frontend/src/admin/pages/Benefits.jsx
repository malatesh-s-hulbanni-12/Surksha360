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

  const API_URL = "https://surksha360-backend.onrender.com/api"

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
      const response = await axios.get(`${API_URL}/benefits/all`)
      const benefitsData = response.data.data || []
      
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
      await axios.patch(`${API_URL}/benefits/${id}/status`, {
        status: newStatus,
        reviewedBy: 'Admin',
        reviewNotes: `Status updated to ${newStatus}`
      })
      
      showToast(`Application ${newStatus.toLowerCase()} successfully`, 'success')
      fetchBenefits()
      
      if (newStatus === 'Approved') {
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

  // Print acknowledgment
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
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-600"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading benefits data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-16 right-2 left-2 md:left-auto md:right-4 z-50 p-3 rounded-lg shadow-xl animate-slideInRight max-w-md mx-auto md:mx-0 ${
          toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
        }`}>
          <div className="flex items-center gap-2">
            <span className={toast.type === 'success' ? 'text-green-600 text-lg' : 'text-red-600 text-lg'}>
              {toast.type === 'success' ? '✓' : '⚠'}
            </span>
            <p className={toast.type === 'success' ? 'text-green-700 text-xs' : 'text-red-700 text-xs'}>{toast.message}</p>
          </div>
        </div>
      )}

      <div className="px-3 py-4 md:px-6 md:py-6 max-w-7xl mx-auto">
        <div className="space-y-4 md:space-y-6">
        
          {/* Header */}
          <div className="animate-fadeIn">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">
              Benefits Management
            </h1>
            <p className="text-xs md:text-sm text-gray-500 mt-1">Manage and track all benefit applications (50% approval amount)</p>
          </div>

          {/* Stats Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2 md:gap-4 animate-slideUp">
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-md">
              <p className="text-[10px] md:text-xs text-gray-500 mb-1">Total Claimed</p>
              <p className="text-base md:text-xl font-bold text-gray-800">{stats.total}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-md">
              <p className="text-[10px] md:text-xs text-gray-500 mb-1">Approved (50%)</p>
              <p className="text-base md:text-xl font-bold text-green-600">{stats.approved}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-md">
              <p className="text-[10px] md:text-xs text-gray-500 mb-1">Pending</p>
              <p className="text-base md:text-xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 md:p-4 shadow-md">
              <p className="text-[10px] md:text-xs text-gray-500 mb-1">Total Claims</p>
              <p className="text-base md:text-xl font-bold text-indigo-600">{stats.count}</p>
            </div>
          </div>

          {/* Filter Tabs - Scrollable on Mobile */}
          <div className="overflow-x-auto -mx-3 px-3 pb-2 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            <div className="flex gap-1 min-w-max">
              {['all', 'pending', 'under review', 'approved', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    filter === f 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  {f}
                  {f !== 'all' && (
                    <span className={`ml-1 px-1.5 py-0.5 text-[8px] rounded-full ${
                      filter === f ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {benefits.filter(b => b.status.toLowerCase() === f.toLowerCase()).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Card View - Shown only on mobile */}
          <div className="block md:hidden space-y-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            {filteredBenefits.length > 0 ? (
              filteredBenefits.map((benefit) => (
                <div key={benefit.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{benefit.user}</p>
                      <p className="text-[10px] text-gray-500">ID: {benefit.applicationId}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-medium ${getStatusColor(benefit.status)}`}>
                      {getStatusIcon(benefit.status)} {benefit.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <p className="text-[8px] text-gray-500">Type</p>
                      <p className="font-medium text-xs truncate">{benefit.type}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-gray-500">Claimed</p>
                      <p className="font-medium text-xs">{benefit.formattedAmount}</p>
                    </div>
                    {benefit.status === 'Approved' && (
                      <div className="col-span-2">
                        <p className="text-[8px] text-gray-500">Approved (50%)</p>
                        <p className="font-medium text-xs text-green-600">{benefit.formattedApprovedAmount}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => viewDetails(benefit)}
                      className="flex-1 py-1.5 text-[10px] bg-indigo-50 text-indigo-600 rounded"
                    >
                      View
                    </button>
                    
                    {benefit.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(benefit.id, 'Approved')}
                          className="flex-1 py-1.5 text-[10px] bg-green-50 text-green-600 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(benefit.id, 'Under Review')}
                          className="flex-1 py-1.5 text-[10px] bg-blue-50 text-blue-600 rounded"
                        >
                          Review
                        </button>
                      </>
                    )}
                    
                    {benefit.status === 'Under Review' && (
                      <>
                        <button
                          onClick={() => updateStatus(benefit.id, 'Approved')}
                          className="flex-1 py-1.5 text-[10px] bg-green-50 text-green-600 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(benefit.id, 'Pending')}
                          className="flex-1 py-1.5 text-[10px] bg-yellow-50 text-yellow-600 rounded"
                        >
                          Pending
                        </button>
                      </>
                    )}
                    
                    {benefit.status === 'Approved' && (
                      <button
                        onClick={() => {
                          setSelectedBenefit(benefit)
                          setShowAcknowledgmentModal(true)
                        }}
                        className="flex-1 py-1.5 text-[10px] bg-purple-50 text-purple-600 rounded"
                      >
                        Acknowledgment
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg p-6 text-center text-gray-500 text-sm">
                <div className="text-3xl mb-2 opacity-30">📋</div>
                <p className="text-xs">No applications found</p>
              </div>
            )}
          </div>

          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-xs">
                  <tr>
                    <th className="px-4 py-3 text-left">Applicant</th>
                    <th className="px-4 py-3 text-left">App ID</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Claimed</th>
                    <th className="px-4 py-3 text-left">Approved</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredBenefits.map((benefit) => (
                    <tr key={benefit.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium">{benefit.user}</div>
                        <div className="text-xs text-gray-500">{benefit.familyId}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{benefit.applicationId}</td>
                      <td className="px-4 py-3">{benefit.type}</td>
                      <td className="px-4 py-3 font-medium">{benefit.formattedAmount}</td>
                      <td className="px-4 py-3">
                        {benefit.status === 'Approved' ? (
                          <span className="font-medium text-green-600">{benefit.formattedApprovedAmount}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(benefit.status)}`}>
                          {getStatusIcon(benefit.status)} {benefit.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{benefit.date}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => viewDetails(benefit)} className="text-indigo-600 hover:text-indigo-800 text-xs">
                            View
                          </button>
                          
                          {benefit.status === 'Pending' && (
                            <>
                              <button onClick={() => updateStatus(benefit.id, 'Approved')} className="text-green-600 hover:text-green-800 text-xs">
                                Approve
                              </button>
                              <button onClick={() => updateStatus(benefit.id, 'Under Review')} className="text-blue-600 hover:text-blue-800 text-xs">
                                Review
                              </button>
                            </>
                          )}
                          
                          {benefit.status === 'Under Review' && (
                            <>
                              <button onClick={() => updateStatus(benefit.id, 'Approved')} className="text-green-600 hover:text-green-800 text-xs">
                                Approve
                              </button>
                              <button onClick={() => updateStatus(benefit.id, 'Pending')} className="text-yellow-600 hover:text-yellow-800 text-xs">
                                Pending
                              </button>
                            </>
                          )}
                          
                          {benefit.status === 'Approved' && (
                            <button onClick={() => {
                              setSelectedBenefit(benefit)
                              setShowAcknowledgmentModal(true)
                            }} className="text-purple-600 hover:text-purple-800 text-xs">
                              Acknowledgment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal - Mobile Optimized */}
      {showDetailsModal && selectedBenefit && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full md:max-w-2xl md:rounded-lg max-h-[85vh] overflow-y-auto rounded-t-xl">
            <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
              <h2 className="font-bold text-sm">Application Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 text-lg">✕</button>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">ID: {selectedBenefit.applicationId}</span>
                <span className={`px-2 py-1 rounded-full text-[8px] ${getStatusColor(selectedBenefit.status)}`}>
                  {getStatusIcon(selectedBenefit.status)} {selectedBenefit.status}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">Claimed:</span>
                  <span className="font-medium text-xs">{selectedBenefit.formattedAmount}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-200">
                  <span className="text-xs text-gray-600">Approved (50%):</span>
                  <span className="font-medium text-xs text-green-600">{selectedBenefit.formattedApprovedAmount}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1 text-xs">Personal Info</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[8px] text-gray-500">Name</p>
                    <p className="text-xs">{selectedBenefit.user}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500">Family ID</p>
                    <p className="text-xs">{selectedBenefit.familyId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-1 text-xs">Application</h3>
                <div className="space-y-1 text-xs">
                  <div>
                    <p className="text-[8px] text-gray-500">Type</p>
                    <p className="text-xs">{selectedBenefit.type}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500">Reason</p>
                    <p className="text-xs">{selectedBenefit.reason}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {selectedBenefit.status === 'Pending' && (
                  <>
                    <button onClick={() => {
                      updateStatus(selectedBenefit.id, 'Approved')
                      setShowDetailsModal(false)
                    }} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs">
                      Approve
                    </button>
                    <button onClick={() => {
                      updateStatus(selectedBenefit.id, 'Under Review')
                      setShowDetailsModal(false)
                    }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs">
                      Review
                    </button>
                  </>
                )}
                {selectedBenefit.status === 'Under Review' && (
                  <>
                    <button onClick={() => {
                      updateStatus(selectedBenefit.id, 'Approved')
                      setShowDetailsModal(false)
                    }} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs">
                      Approve
                    </button>
                    <button onClick={() => {
                      updateStatus(selectedBenefit.id, 'Pending')
                      setShowDetailsModal(false)
                    }} className="flex-1 py-2 bg-yellow-600 text-white rounded-lg text-xs">
                      Pending
                    </button>
                  </>
                )}
                {selectedBenefit.status === 'Approved' && (
                  <button onClick={() => {
                    setShowDetailsModal(false)
                    setShowAcknowledgmentModal(true)
                  }} className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs">
                    Acknowledgment
                  </button>
                )}
                <button onClick={() => setShowDetailsModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledgment Modal - Mobile Optimized */}
      {showAcknowledgmentModal && selectedBenefit && (
        <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-full md:max-w-md md:rounded-lg max-h-[85vh] overflow-y-auto rounded-t-xl">
            <div className="sticky top-0 bg-white border-b p-3 flex justify-between items-center">
              <h2 className="font-bold text-sm">Approval Acknowledgment</h2>
              <button onClick={() => setShowAcknowledgmentModal(false)} className="text-gray-500 text-lg">✕</button>
            </div>
            
            <div className="p-4">
              <div className="border-2 border-gray-200 p-3 rounded-lg mb-3">
                <div className="text-center mb-2">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <span className="text-lg">✓</span>
                  </div>
                  <h3 className="font-bold text-sm">Suraksha 360</h3>
                  <p className="text-[8px] text-gray-500">Approval Acknowledgment</p>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[8px] text-gray-600">ID:</span>
                    <span className="font-medium text-xs">{selectedBenefit.applicationId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[8px] text-gray-600">Name:</span>
                    <span className="text-xs">{selectedBenefit.user}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[8px] text-gray-600">Claimed:</span>
                    <span className="text-xs">{selectedBenefit.formattedAmount}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                    <span className="text-[8px] font-medium">Approved:</span>
                    <span className="text-xs font-bold text-green-600">{selectedBenefit.formattedApprovedAmount}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => printAcknowledgment(selectedBenefit)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs">
                  🖨️ Print
                </button>
                <button onClick={() => downloadAcknowledgment(selectedBenefit)} className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs">
                  📥 Download
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

