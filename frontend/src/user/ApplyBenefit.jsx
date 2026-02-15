import React, { useState } from 'react'
import axios from 'axios'
import UserNavbar from '../user/UserNavbar'

const ApplyBenefit = () => {
  const [activeTab, setActiveTab] = useState('apply')
  const [step, setStep] = useState(1)
  const [familyId, setFamilyId] = useState('')
  const [verificationData, setVerificationData] = useState({ name: '', aadhar: '' })
  const [verified, setVerified] = useState(false)
  const [verifiedMember, setVerifiedMember] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [showAppIdNotification, setShowAppIdNotification] = useState(false)
  const [lastAppId, setLastAppId] = useState('')
  
  // New state for dates
  const [registrationDate, setRegistrationDate] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0])
  const [daysDifference, setDaysDifference] = useState(0)
  const [eligibilityMessage, setEligibilityMessage] = useState('')
  
  // Application form state with address fields
  const [application, setApplication] = useState({
    benefitType: '',
    reason: '',
    description: '',
    totalAmount: '',
    address: {
      street: '',
      city: '',
      district: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    place: '',
    documents: {
      aadharCard: null,
      hospitalLetter: null,
      paymentSlip: null,
      registrationCopy: null,
      otherDocuments: []
    }
  })

  // Track application state
  const [applicationId, setApplicationId] = useState('')
  const [trackedApplication, setTrackedApplication] = useState(null)
  const [trackLoading, setTrackLoading] = useState(false)
  const [lastSubmittedApp, setLastSubmittedApp] = useState(null)

  const API_URL = 'http://localhost:5000/api'

  const benefitTypes = [
    'Medical Emergency',
    'Education Support',
    'Housing Assistance',
    'Disability Support',
    'Senior Citizen Benefit',
    'Maternity Benefit',
    'Other'
  ]

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 5000)
  }

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setApplication({
      ...application,
      address: {
        ...application.address,
        [name]: value
      }
    })
  }

  // Handle document upload
  const handleDocumentUpload = (e, docType) => {
    const file = e.target.files[0]
    if (file) {
      setApplication({
        ...application,
        documents: {
          ...application.documents,
          [docType]: file
        }
      })
    }
  }

  const handleOtherDocuments = (e) => {
    const files = Array.from(e.target.files)
    setApplication({
      ...application,
      documents: {
        ...application.documents,
        otherDocuments: [...application.documents.otherDocuments, ...files]
      }
    })
  }

  const removeDocument = (docType) => {
    setApplication({
      ...application,
      documents: {
        ...application.documents,
        [docType]: null
      }
    })
  }

  const removeOtherDocument = (index) => {
    const newOtherDocs = [...application.documents.otherDocuments]
    newOtherDocs.splice(index, 1)
    setApplication({
      ...application,
      documents: {
        ...application.documents,
        otherDocuments: newOtherDocs
      }
    })
  }

  // Calculate days between two dates
  const calculateDaysBetween = (date1, date2) => {
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const firstDate = new Date(date1);
    const secondDate = new Date(date2);
    return Math.round(Math.abs((firstDate - secondDate) / oneDay));
  }

  // Handle current date change
  const handleCurrentDateChange = (e) => {
    const newDate = e.target.value;
    setCurrentDate(newDate);
    
    if (registrationDate) {
      const days = calculateDaysBetween(registrationDate, newDate);
      setDaysDifference(days);
      
      if (days < 365) {
        const remainingDays = 365 - days;
        setEligibilityMessage(`⚠️ ${remainingDays} days remaining to complete 1 year`);
      } else {
        setEligibilityMessage('✓ Eligible for benefit claim');
      }
    }
  }

  // Verify family ID and member with registration date check
  const verifyMember = async () => {
    if (!familyId.trim()) {
      setError('Please enter Family ID')
      showToast('Please enter Family ID', 'error')
      return
    }
    if (!verificationData.name.trim() && !verificationData.aadhar.trim()) {
      setError('Please enter either Name or Aadhar number')
      showToast('Please enter either Name or Aadhar number', 'error')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_URL}/registrations`)
      const registrations = response.data

      const family = registrations.find(reg => 
        reg.registrationId && reg.registrationId.toString() === familyId.toString()
      )

      if (!family) {
        setError('Family ID not found')
        showToast('Family ID not found', 'error')
        setLoading(false)
        return
      }

      let foundMember = null
      if (verificationData.name) {
        foundMember = family.members.find(m => 
          m.name.toLowerCase() === verificationData.name.toLowerCase()
        )
      } else if (verificationData.aadhar) {
        foundMember = family.members.find(m => 
          m.aadhar && m.aadhar.toString() === verificationData.aadhar.toString()
        )
      }

      if (!foundMember) {
        setError('Member not found in this family')
        showToast('Member not found in this family', 'error')
        setLoading(false)
        return
      }

      // Set registration date from database
      const regDate = new Date(family.registrationDate).toISOString().split('T')[0];
      setRegistrationDate(regDate);
      
      // Calculate initial days difference
      const days = calculateDaysBetween(regDate, currentDate);
      setDaysDifference(days);
      
      if (days < 365) {
        const remainingDays = 365 - days;
        setEligibilityMessage(`⚠️ ${remainingDays} days remaining to complete 1 year`);
        setError(`Benefit not eligible yet. ${remainingDays} days remaining to complete 1 year.`)
        showToast(`${remainingDays} days remaining for benefit eligibility`, 'error')
        setLoading(false)
        return
      } else {
        setEligibilityMessage('✓ Eligible for benefit claim');
      }

      setVerified(true)
      setVerifiedMember({ 
        ...foundMember, 
        familyId: family.registrationId,
        registrationDate: family.registrationDate 
      })
      setStep(2)
      showToast('Identity verified successfully!', 'success')
    } catch (err) {
      console.error('Verification error:', err)
      setError('Error verifying details. Please try again.')
      showToast('Error verifying details. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Submit application
  const submitApplication = async () => {
    if (!application.benefitType) {
      setError('Please select benefit type')
      showToast('Please select benefit type', 'error')
      return
    }
    if (!application.reason) {
      setError('Please enter reason')
      showToast('Please enter reason', 'error')
      return
    }
    if (!application.totalAmount) {
      setError('Please enter total amount')
      showToast('Please enter total amount', 'error')
      return
    }
    if (!application.address.street || !application.address.city || !application.address.pincode) {
      setError('Please fill in complete address')
      showToast('Please fill in complete address', 'error')
      return
    }
    if (!application.place) {
      setError('Please enter place of incident')
      showToast('Please enter place of incident', 'error')
      return
    }
    if (!application.documents.aadharCard) {
      setError('Please upload Aadhar Card')
      showToast('Please upload Aadhar Card', 'error')
      return
    }
    if (!application.documents.hospitalLetter) {
      setError('Please upload Hospital Letter')
      showToast('Please upload Hospital Letter', 'error')
      return
    }
    if (!application.documents.paymentSlip) {
      setError('Please upload Payment Slip')
      showToast('Please upload Payment Slip', 'error')
      return
    }
    if (!application.documents.registrationCopy) {
      setError('Please upload Hospital Registration Copy')
      showToast('Please upload Hospital Registration Copy', 'error')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      
      // Basic info
      formData.append('familyId', verifiedMember.familyId)
      formData.append('memberId', verifiedMember._id)
      formData.append('memberName', verifiedMember.name)
      formData.append('memberAadhar', verifiedMember.aadhar || '')
      formData.append('memberPhone', verifiedMember.phone || '')
      formData.append('benefitType', application.benefitType)
      formData.append('reason', application.reason)
      formData.append('description', application.description)
      formData.append('totalAmount', application.totalAmount)
      formData.append('place', application.place)
      
      // Address
      formData.append('address[street]', application.address.street)
      formData.append('address[city]', application.address.city)
      formData.append('address[district]', application.address.district)
      formData.append('address[state]', application.address.state)
      formData.append('address[pincode]', application.address.pincode)
      formData.append('address[country]', application.address.country)

      // Documents
      if (application.documents.aadharCard) {
        formData.append('aadharCard', application.documents.aadharCard)
      }
      if (application.documents.hospitalLetter) {
        formData.append('hospitalLetter', application.documents.hospitalLetter)
      }
      if (application.documents.paymentSlip) {
        formData.append('paymentSlip', application.documents.paymentSlip)
      }
      if (application.documents.registrationCopy) {
        formData.append('registrationCopy', application.documents.registrationCopy)
      }
      
      application.documents.otherDocuments.forEach((file) => {
        formData.append('otherDocuments', file)
      })

      const response = await axios.post(`${API_URL}/benefits/apply`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const appId = response.data.applicationId
      setLastAppId(appId)
      setShowAppIdNotification(true)
      
      // Hide notification after 2 minutes (120000 ms)
      setTimeout(() => {
        setShowAppIdNotification(false)
      }, 120000)

      setLastSubmittedApp({
        ...response.data.data,
        applicationId: appId,
        memberName: verifiedMember.name,
        familyId: verifiedMember.familyId,
        benefitType: application.benefitType,
        totalAmount: application.totalAmount,
        place: application.place,
        address: application.address
      })

      setSuccess(`Application submitted successfully!`)
      showToast(`Application submitted successfully!`, 'success')
      
      // Reset form
      setStep(1)
      setVerified(false)
      setVerifiedMember(null)
      setFamilyId('')
      setVerificationData({ name: '', aadhar: '' })
      setRegistrationDate('')
      setCurrentDate(new Date().toISOString().split('T')[0])
      setDaysDifference(0)
      setEligibilityMessage('')
      setApplication({
        benefitType: '',
        reason: '',
        description: '',
        totalAmount: '',
        address: {
          street: '',
          city: '',
          district: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        place: '',
        documents: {
          aadharCard: null,
          hospitalLetter: null,
          paymentSlip: null,
          registrationCopy: null,
          otherDocuments: []
        }
      })

      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Submission error:', err)
      setError(err.response?.data?.message || 'Error submitting application')
      showToast(err.response?.data?.message || 'Error submitting application', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Track application
  const trackApplication = async () => {
    if (!applicationId.trim()) {
      setError('Please enter Application ID')
      showToast('Please enter Application ID', 'error')
      return
    }

    setTrackLoading(true)
    setError('')
    setTrackedApplication(null)

    try {
      const response = await axios.get(`${API_URL}/benefits/track/${applicationId}`)
      
      if (response.data.success && response.data.data) {
        const appData = response.data.data
        setTrackedApplication(appData)
        showToast('Application found!', 'success')
      } else {
        setError('Application not found')
        showToast('Application not found', 'error')
      }
    } catch (err) {
      console.error('Track error:', err)
      
      if (err.response?.status === 404) {
        setError('Application not found. Please check the Application ID.')
        showToast('Application not found', 'error')
      } else {
        setError(err.response?.data?.message || 'Error tracking application')
        showToast(err.response?.data?.message || 'Error tracking application', 'error')
      }
    } finally {
      setTrackLoading(false)
    }
  }

  // Generate and print acknowledgment
  const printAcknowledgment = (app) => {
    const appData = app || lastSubmittedApp
    if (!appData) return

    const appNumber = appData.applicationId
    const today = new Date()
    const eligibleAmount = Math.round(parseFloat(appData.totalAmount) * 0.5)

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Benefit Claim Acknowledgement</title>
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
          }
        </style>
      </head>
      <body>
        <div class="a4-container">
          <div class="header">
            <img src="/logo.png" class="logo" alt="Logo" onerror="this.src='https://via.placeholder.com/80?text=Logo'">
            <h1>Suraksha 360</h1>
            <p>Benefit Claim Acknowledgement</p>
          </div>

          <div class="details">
            <div class="section">
              <span class="label">Application Number:</span>
              <span><strong>${appNumber}</strong></span>
            </div>

            <div class="section">
              <span class="label">Date:</span>
              <span>${today.toLocaleDateString('en-IN')}</span>
            </div>

            <div class="section">
              <span class="label">Family ID:</span>
              <span>${appData.familyId || 'N/A'}</span>
            </div>

            <div class="section">
              <span class="label">Applicant Name:</span>
              <span>${appData.memberName || 'N/A'}</span>
            </div>

            <div class="section">
              <span class="label">Benefit Type:</span>
              <span>${appData.benefitType || 'N/A'}</span>
            </div>

            <div class="section">
              <span class="label">Total Amount:</span>
              <span>₹ ${parseFloat(appData.totalAmount).toLocaleString('en-IN')}</span>
            </div>

            <div class="section">
              <span class="label">Eligible Support (50%):</span>
              <span>₹ ${eligibleAmount.toLocaleString('en-IN')}</span>
            </div>

            <div class="note">
              This is to acknowledge that the above benefit claim application has been received by Suraksha 360. 
              The documents submitted will be verified, and the eligible amount will be processed accordingly.
            </div>

            <div class="footer">
              <div class="signature">
                _______________________<br>
                Applicant Signature
              </div>
              <div class="signature">
                _______________________<br>
                Authorized Signature
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
  const downloadAcknowledgment = (app) => {
    const appData = app || lastSubmittedApp
    if (!appData) return

    const appNumber = appData.applicationId
    const today = new Date()
    const eligibleAmount = Math.round(parseFloat(appData.totalAmount) * 0.5)

    const content = `
      BENEFIT APPLICATION ACKNOWLEDGMENT
      =================================
      
      Application Number: ${appNumber}
      Date: ${today.toLocaleDateString('en-IN')}
      
      FAMILY DETAILS:
      ---------------
      Family ID: ${appData.familyId || 'N/A'}
      Applicant Name: ${appData.memberName || 'N/A'}
      Benefit Type: ${appData.benefitType || 'N/A'}
      
      FINANCIAL DETAILS:
      ------------------
      Total Amount Claimed: ₹ ${parseFloat(appData.totalAmount).toLocaleString('en-IN')}
      Eligible Support (50%): ₹ ${eligibleAmount.toLocaleString('en-IN')}
      
      APPLICATION DATE: ${new Date(appData.createdAt || today).toLocaleDateString('en-IN')}
      
      -------------------
      This is to acknowledge that the above benefit claim application has been received by Suraksha 360.
      The documents submitted will be verified, and the eligible amount will be processed accordingly.
      
      
      Applicant Signature                    Authorized Signature
    `

    const blob = new Blob([content], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `acknowledgment-${appNumber}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-600'
      case 'Approved': return 'bg-green-100 text-green-600'
      case 'Rejected': return 'bg-red-100 text-red-600'
      case 'Under Review': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Approved': return '✓'
      case 'Pending': return '⋯'
      case 'Under Review': return '◎'
      case 'Rejected': return '✕'
      default: return '○'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <UserNavbar />
      
      {/* Application ID Notification - Shows for 2 minutes after submission */}
      {showAppIdNotification && lastAppId && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 animate-slideDown">
          <div className="bg-blue-600 text-white rounded-xl shadow-2xl p-6 border-2 border-blue-300">
            <div className="flex items-start gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <span className="text-2xl">📋</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Application Submitted!</h3>
                <p className="text-blue-100 text-sm mb-3">Please note your Application ID for future reference:</p>
                <div className="bg-white/10 rounded-lg p-3 mb-2">
                  <p className="text-2xl font-mono font-bold tracking-wider text-center">{lastAppId}</p>
                </div>
                <p className="text-xs text-blue-200">This notification will disappear in 2 minutes after download your acknoewdgement in the track application sectin application id</p>
              </div>
              <button 
                onClick={() => setShowAppIdNotification(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

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
      
      <div className="pt-24 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 animate-fadeIn">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Benefit Application
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Apply for benefits or track your existing applications
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideDown">
              <p className="text-green-600 text-sm flex items-center gap-2">
                <span className="text-lg">✓</span>
                {success}
              </p>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="bg-white rounded-xl shadow-lg p-2 mb-8 inline-flex w-full md:w-auto">
            <button
              onClick={() => {
                setActiveTab('apply')
                setStep(1)
                setError('')
                setSuccess('')
                setTrackedApplication(null)
              }}
              className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'apply'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">📝</span>
              Apply for Benefit
            </button>
            <button
              onClick={() => {
                setActiveTab('track')
                setError('')
                setSuccess('')
                setApplicationId('')
                setTrackedApplication(null)
              }}
              className={`flex-1 md:flex-none px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'track'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="mr-2">🔍</span>
              Track Application
            </button>
          </div>

          {/* Apply Benefit Section */}
          {activeTab === 'apply' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-slideUp">
              {/* Step Indicator */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    1
                  </div>
                  <div className={`h-1 w-16 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    2
                  </div>
                </div>
              </div>

              {step === 1 ? (
                /* Step 1: Verification */
                <div className="p-4 md:p-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Verify Your Identity
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Family ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={familyId}
                        onChange={(e) => setFamilyId(e.target.value)}
                        placeholder="Enter your Family ID"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={verificationData.name}
                          onChange={(e) => setVerificationData({ ...verificationData, name: e.target.value })}
                          placeholder="Enter your full name"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhar Number
                        </label>
                        <input
                          type="text"
                          value={verificationData.aadhar}
                          onChange={(e) => setVerificationData({ ...verificationData, aadhar: e.target.value })}
                          placeholder="Enter Aadhar number"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-gray-500">
                      Enter either Name or Aadhar number to verify
                    </p>

                    {/* Date Selection Section */}
                    {registrationDate && (
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Eligibility Check</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Registration Date
                            </label>
                            <input
                              type="date"
                              value={registrationDate}
                              readOnly
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Current Date (Editable)
                            </label>
                            <input
                              type="date"
                              value={currentDate}
                              onChange={handleCurrentDateChange}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                        </div>
                        
                        {/* Days Difference and Eligibility Message */}
                        <div className="mt-3 p-3 bg-white rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-600">Days Since Registration:</span>
                            <span className="text-sm font-bold text-gray-800">{daysDifference} days</span>
                          </div>
                          <div className={`text-xs font-medium ${daysDifference >= 365 ? 'text-green-600' : 'text-red-600'}`}>
                            {eligibilityMessage || 'Select dates to check eligibility'}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={verifyMember}
                      disabled={loading || (daysDifference < 365 && daysDifference > 0)}
                      className={`w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg ${
                        daysDifference < 365 && daysDifference > 0 ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </span>
                      ) : 'Verify & Continue'}
                    </button>
                    
                    {daysDifference < 365 && daysDifference > 0 && (
                      <p className="text-xs text-red-500 text-center">
                        You need to wait until 365 days to be eligible
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* Step 2: Application Form */
                <div className="p-4 md:p-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Application Form
                  </h2>

                  {/* Verified Member Info */}
                  {verifiedMember && (
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                      <p className="text-sm text-green-700 mb-2 flex items-center gap-2">
                        <span className="text-lg">✓</span>
                        Verified as: {verifiedMember.name}
                      </p>
                      <p className="text-xs text-green-600">
                        Family ID: {verifiedMember.familyId} | Phone: {verifiedMember.phone || 'N/A'}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Registration Date: {new Date(verifiedMember.registrationDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Benefit Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefit Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={application.benefitType}
                        onChange={(e) => setApplication({ ...application, benefitType: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      >
                        <option value="">Select benefit type</option>
                        {benefitTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    {/* Place of Incident */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Place of Incident/Treatment <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={application.place}
                        onChange={(e) => setApplication({ ...application, place: e.target.value })}
                        placeholder="Enter hospital/clinic/place name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    {/* Address Section */}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="text-md font-semibold text-gray-700 mb-4">Complete Address</h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={application.address.street}
                            onChange={handleAddressChange}
                            placeholder="House no., Building, Street"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="city"
                              value={application.address.city}
                              onChange={handleAddressChange}
                              placeholder="City"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              District
                            </label>
                            <input
                              type="text"
                              name="district"
                              value={application.address.district}
                              onChange={handleAddressChange}
                              placeholder="District"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State
                            </label>
                            <input
                              type="text"
                              name="state"
                              value={application.address.state}
                              onChange={handleAddressChange}
                              placeholder="State"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pincode <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="pincode"
                              value={application.address.pincode}
                              onChange={handleAddressChange}
                              placeholder="Pincode"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Claim <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={application.reason}
                        onChange={(e) => setApplication({ ...application, reason: e.target.value })}
                        placeholder="Brief reason for claiming benefit"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Description
                      </label>
                      <textarea
                        value={application.description}
                        onChange={(e) => setApplication({ ...application, description: e.target.value })}
                        rows="4"
                        placeholder="Provide detailed description of your situation..."
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
                      ></textarea>
                    </div>

                    {/* Total Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Amount Spent (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={application.totalAmount}
                        onChange={(e) => setApplication({ ...application, totalAmount: e.target.value })}
                        placeholder="Enter total amount"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>

                    {/* Document Upload Sections */}
                    <div className="space-y-6">
                      <h3 className="text-md font-semibold text-gray-700">Required Documents</h3>
                      
                      {/* Aadhar Card */}
                      <div className="border rounded-xl p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Aadhar Card <span className="text-red-500">*</span>
                        </label>
                        {!application.documents.aadharCard ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'aadharCard')}
                              className="hidden"
                              id="aadhar-upload"
                            />
                            <label htmlFor="aadhar-upload" className="cursor-pointer">
                              <span className="text-2xl mb-2 block">📄</span>
                              <p className="text-gray-600 text-sm">Click to upload Aadhar Card</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span>📄</span>
                              <span className="text-sm text-gray-700">{application.documents.aadharCard.name}</span>
                            </div>
                            <button
                              onClick={() => removeDocument('aadharCard')}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Hospital Letter */}
                      <div className="border rounded-xl p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hospital Letter <span className="text-red-500">*</span>
                        </label>
                        {!application.documents.hospitalLetter ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'hospitalLetter')}
                              className="hidden"
                              id="hospital-upload"
                            />
                            <label htmlFor="hospital-upload" className="cursor-pointer">
                              <span className="text-2xl mb-2 block">📄</span>
                              <p className="text-gray-600 text-sm">Click to upload Hospital Letter</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span>📄</span>
                              <span className="text-sm text-gray-700">{application.documents.hospitalLetter.name}</span>
                            </div>
                            <button
                              onClick={() => removeDocument('hospitalLetter')}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Payment Slip */}
                      <div className="border rounded-xl p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Payment Slip <span className="text-red-500">*</span>
                        </label>
                        {!application.documents.paymentSlip ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'paymentSlip')}
                              className="hidden"
                              id="payment-upload"
                            />
                            <label htmlFor="payment-upload" className="cursor-pointer">
                              <span className="text-2xl mb-2 block">📄</span>
                              <p className="text-gray-600 text-sm">Click to upload Payment Slip</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span>📄</span>
                              <span className="text-sm text-gray-700">{application.documents.paymentSlip.name}</span>
                            </div>
                            <button
                              onClick={() => removeDocument('paymentSlip')}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Hospital Registration Copy */}
                      <div className="border rounded-xl p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hospital Registration Copy <span className="text-red-500">*</span>
                        </label>
                        {!application.documents.registrationCopy ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => handleDocumentUpload(e, 'registrationCopy')}
                              className="hidden"
                              id="registration-upload"
                            />
                            <label htmlFor="registration-upload" className="cursor-pointer">
                              <span className="text-2xl mb-2 block">📄</span>
                              <p className="text-gray-600 text-sm">Click to upload Registration Copy</p>
                            </label>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span>📄</span>
                              <span className="text-sm text-gray-700">{application.documents.registrationCopy.name}</span>
                            </div>
                            <button
                              onClick={() => removeDocument('registrationCopy')}
                              className="text-red-500 hover:text-red-700"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Other Documents */}
                      <div className="border rounded-xl p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Other Supporting Documents (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-indigo-500 transition-colors">
                          <input
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.pdf"
                            onChange={handleOtherDocuments}
                            className="hidden"
                            id="other-upload"
                          />
                          <label htmlFor="other-upload" className="cursor-pointer">
                            <span className="text-2xl mb-2 block">📎</span>
                            <p className="text-gray-600 text-sm">Click to upload additional documents</p>
                          </label>
                        </div>

                        {/* Other Documents List */}
                        {application.documents.otherDocuments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {application.documents.otherDocuments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span>📄</span>
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                </div>
                                <button
                                  onClick={() => removeOtherDocument(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={submitApplication}
                        disabled={loading}
                        className="flex-1 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                      >
                        {loading ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Track Application Section */}
          {activeTab === 'track' && (
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-8 animate-slideUp">
              <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                Track Your Application
              </h2>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    value={applicationId}
                    onChange={(e) => setApplicationId(e.target.value)}
                    placeholder="Enter Application ID (e.g., BEN-2024-001)"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                  />
                  <button
                    onClick={trackApplication}
                    disabled={trackLoading}
                    className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg"
                  >
                    {trackLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Searching...
                      </span>
                    ) : 'Track'}
                  </button>
                </div>

                {/* Application Details */}
                {trackedApplication && (
                  <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 animate-fadeIn">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-gray-800">Application Details</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(trackedApplication.status)}`}>
                        <span>{getStatusIcon(trackedApplication.status)}</span>
                        {trackedApplication.status}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Application ID</p>
                          <p className="font-medium text-gray-800">{trackedApplication.applicationId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Application Date</p>
                          <p className="font-medium text-gray-800">
                            {new Date(trackedApplication.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Applicant Name</p>
                          <p className="font-medium text-gray-800">{trackedApplication.memberName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Family ID</p>
                          <p className="font-medium text-gray-800">{trackedApplication.familyId}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Benefit Type</p>
                        <p className="font-medium text-gray-800">{trackedApplication.benefitType}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Place of Incident</p>
                        <p className="font-medium text-gray-800">{trackedApplication.place || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500">Reason</p>
                        <p className="text-sm text-gray-600">{trackedApplication.reason}</p>
                      </div>

                      {trackedApplication.description && (
                        <div>
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="text-sm text-gray-600">{trackedApplication.description}</p>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Total Amount Claimed:</span>
                          <span className="font-bold text-gray-800">₹{parseFloat(trackedApplication.totalAmount).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Eligible Support (50%):</span>
                          <span className="font-bold text-green-600">₹{Math.round(parseFloat(trackedApplication.totalAmount) * 0.5).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Documents Summary */}
                      {trackedApplication.documents && trackedApplication.documents.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Uploaded Documents</p>
                          <div className="flex flex-wrap gap-2">
                            {trackedApplication.documents.map((doc, idx) => (
                              <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                                📄 {doc.documentType}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-4 pt-4 border-t">
                        <button
                          onClick={() => downloadAcknowledgment(trackedApplication)}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <span>📥</span>
                          Download
                        </button>
                        <button
                          onClick={() => printAcknowledgment(trackedApplication)}
                          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-2"
                        >
                          <span>🖨️</span>
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* No results message */}
                {trackedApplication === null && !trackLoading && applicationId && (
                  <div className="mt-6 p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                    <div className="text-4xl mb-2">🔍</div>
                    <p>No application found with ID: {applicationId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              © 2024 Suraksha360. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
        
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ApplyBenefit


