import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function UserRegistration() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [registrationType, setRegistrationType] = useState('')
  const [numberOfMembers, setNumberOfMembers] = useState(1)
  const [currentMember, setCurrentMember] = useState(1)
  const [showAcknowledgement, setShowAcknowledgement] = useState(false)
  const [generatedId, setGeneratedId] = useState('')
  const [registrationDate, setRegistrationDate] = useState('')
  
  const [members, setMembers] = useState([
    { name: '', phone: '', aadhar: '', payingAmount: '' }
  ])

  console.log('🔄 Component State:', { 
    step, 
    registrationType, 
    numberOfMembers, 
    currentMember,
    showAcknowledgement,
    members 
  });

  const handleTypeSelect = (type) => {
    console.log('📝 Registration type selected:', type);
    setRegistrationType(type)
    setStep(2)
  }

  const handleMemberCount = (count) => {
    console.log('🔢 Number of members selected:', count);
    setNumberOfMembers(parseInt(count))
    const newMembers = Array(parseInt(count)).fill().map(() => ({
      name: '', phone: '', aadhar: '', payingAmount: ''
    }))
    console.log('👥 New members array created:', newMembers);
    setMembers(newMembers)
    setStep(3)
  }

  const handleMemberInput = (index, field, value) => {
    console.log(`✏️ Member ${index + 1} - ${field} updated:`, value);
    const updatedMembers = [...members]
    updatedMembers[index][field] = value
    setMembers(updatedMembers)
  }

  const handleNext = () => {
    console.log('➡️ Next button clicked. Current member:', currentMember, 'Total members:', numberOfMembers);
    
    // Validate current member data
    const currentMemberData = members[currentMember - 1];
    console.log('Current member data:', currentMemberData);
    
    if (!currentMemberData.name || !currentMemberData.phone || !currentMemberData.aadhar || !currentMemberData.payingAmount) {
      console.warn('⚠️ Current member data is incomplete!');
      alert('Please fill all fields for this member before proceeding.');
      return;
    }

    if (currentMember < numberOfMembers) {
      console.log('Moving to next member:', currentMember + 1);
      setCurrentMember(currentMember + 1)
    } else {
      console.log('All members filled. Moving to review step.');
      setStep(4)
    }
  }

  const handleSubmit = async () => {
  console.log('🚀 Submit button clicked!');
  console.log('📦 Current state before submission:', {
    registrationType,
    numberOfMembers,
    members,
    step
  });

  try {
    // Validate all members data
    console.log('🔍 Validating all members data...');
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      console.log(`Checking member ${i + 1}:`, member);
      
      if (!member.name || !member.phone || !member.aadhar || !member.payingAmount) {
        console.error(`❌ Member ${i + 1} has incomplete data:`, member);
        alert(`Please ensure all fields are filled for Member ${i + 1}`);
        return;
      }
      
      if (member.phone.length < 10) {
        console.error(`❌ Member ${i + 1} phone number is invalid:`, member.phone);
        alert(`Please enter a valid 10-digit phone number for Member ${i + 1}`);
        return;
      }
      
      if (member.aadhar.length !== 12) {
        console.error(`❌ Member ${i + 1} Aadhar number is invalid:`, member.aadhar);
        alert(`Please enter a valid 12-digit Aadhar number for Member ${i + 1}`);
        return;
      }
    }
    console.log('✅ All members data validated successfully');

    // Generate unique ID (Surksha001 format)
    const uniqueId = 'Surksha' + String(Math.floor(Math.random() * 1000)).padStart(3, '0')
    const currentDate = new Date().toISOString()
    
    console.log('🆔 Generated unique ID:', uniqueId);
    console.log('📅 Current date:', currentDate);
    
    setGeneratedId(uniqueId)
    setRegistrationDate(currentDate)

    // Prepare data for API
    const registrationData = {
      registrationId: uniqueId,
      registrationType,
      numberOfMembers,
      members,
      registrationDate: currentDate,
      status: 'Active'
    };

    console.log('📤 Sending data to API:', registrationData);
    
    // Use full URL instead of relative path
    const API_URL = 'http://localhost:5000/api'; // or use environment variable
    console.log('🌐 API URL:', `${API_URL}/registrations`);

    // Save to database with full URL
    const response = await axios.post(`${API_URL}/registrations`, registrationData)
    
    console.log('📥 API Response received:', response);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);

    if (response.data && response.data.success) {
      console.log('✅ Registration successful! Showing acknowledgement...');
      setShowAcknowledgement(true)
    } else {
      console.warn('⚠️ API response did not indicate success:', response.data);
      alert('Registration completed but server response was unexpected. Please check the console.');
    }
  } catch (error) {
    console.error('❌ Error in handleSubmit:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    
    if (error.response) {
      console.error('⚠️ Server responded with error:');
      console.error('Status:', error.response.status);
      console.error('Status text:', error.response.statusText);
      console.error('Response data:', error.response.data);
      
      alert(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error('⚠️ No response received from server:');
      console.error('Request:', error.request);
      
      alert('No response from server. Please check if the backend server is running on port 5000.');
    } else {
      console.error('⚠️ Error setting up request:', error.message);
      alert(`Error: ${error.message}`);
    }
  }
}

  const handlePrint = () => {
    console.log('🖨️ Print button clicked');
    window.print()
  }

  if (showAcknowledgement) {
    console.log('📄 Rendering acknowledgement page');
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Acknowledgement Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            {/* Header with Logo and Date */}
            <div className="flex flex-col md:flex-row justify-between items-center border-b pb-6 mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">🛡️</span>
                <h1 className="text-2xl font-bold text-gray-800">Surksha Security</h1>
              </div>
              <div className="text-gray-600 mt-4 md:mt-0">
                <p className="font-semibold">Registration Date:</p>
                <p>{new Date(registrationDate).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Registration ID */}
            <div className="bg-orange-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-orange-600">Registration ID</p>
              <p className="text-2xl font-bold text-orange-700">{generatedId}</p>
            </div>

            {/* Members List */}
            <h2 className="text-xl font-semibold mb-4">Registered Members</h2>
            <div className="space-y-4">
              {members.map((member, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-orange-600 mb-2">Member {index + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{member.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Aadhar Number</p>
                      <p className="font-medium">{member.aadhar}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paying Amount</p>
                      <p className="font-medium">₹{member.payingAmount}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={handlePrint}
                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🖨️</span>
                <span>Print Acknowledgement</span>
              </button>
              <button
                onClick={() => {
                  console.log('👈 Navigating back to users page');
                  navigate('/admin/users');
                }}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              console.log('👈 Navigating back to users page from step', step);
              navigate('/admin/users');
            }}
            className="text-gray-600 hover:text-gray-800 mb-4 flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to Users</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">User Registration</h1>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`w-12 md:w-24 h-1 mx-2 ${
                    step > s ? 'bg-orange-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Select Registration Type</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => handleTypeSelect('family')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <span className="text-4xl mb-3 block">👪</span>
                  <h3 className="text-lg font-semibold">Family</h3>
                  <p className="text-gray-500 text-sm">Register multiple family members</p>
                </button>
                <button
                  onClick={() => handleTypeSelect('individual')}
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <span className="text-4xl mb-3 block">👤</span>
                  <h3 className="text-lg font-semibold">Individual</h3>
                  <p className="text-gray-500 text-sm">Register single person</p>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Number of Members</h2>
              <select
                onChange={(e) => handleMemberCount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                defaultValue=""
              >
                <option value="" disabled>Select number of members</option>
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num} Member{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Member {currentMember} Details</h2>
              
              <div className="bg-orange-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-600">Progress: {currentMember} of {numberOfMembers} members</p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={members[currentMember - 1]?.name || ''}
                  onChange={(e) => handleMemberInput(currentMember - 1, 'name', e.target.value)}
                />
                
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={members[currentMember - 1]?.phone || ''}
                  onChange={(e) => handleMemberInput(currentMember - 1, 'phone', e.target.value)}
                />
                
                <input
                  type="text"
                  placeholder="Aadhar Number"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={members[currentMember - 1]?.aadhar || ''}
                  onChange={(e) => handleMemberInput(currentMember - 1, 'aadhar', e.target.value)}
                />
                
                <input
                  type="number"
                  placeholder="Paying Amount (₹)"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={members[currentMember - 1]?.payingAmount || ''}
                  onChange={(e) => handleMemberInput(currentMember - 1, 'payingAmount', e.target.value)}
                />
              </div>

              {currentMember < numberOfMembers ? (
                <button
                  onClick={handleNext}
                  className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Next Member →
                </button>
              ) : (
                <button
                  onClick={() => setStep(4)}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Review & Submit
                </button>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Review Registration</h2>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-semibold">Registration Type: <span className="capitalize">{registrationType}</span></p>
                <p className="font-semibold">Total Members: {numberOfMembers}</p>
              </div>

              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-orange-600 mb-2">Member {index + 1}</h3>
                    <p>Name: {member.name}</p>
                    <p>Phone: {member.phone}</p>
                    <p>Aadhar: {member.aadhar}</p>
                    <p>Amount: ₹{member.payingAmount}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Submit Registration
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}