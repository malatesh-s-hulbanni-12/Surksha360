// src/admin/pages/Payments.jsx
import { useState, useEffect } from "react";
import axios from "axios";

export default function Payments() {
  const [familyId, setFamilyId] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]); // Multiple members
  const [selectedMonths, setSelectedMonths] = useState([]); // Multiple months
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [showScanner, setShowScanner] = useState(false); // New state for scanner
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentPayments, setRecentPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: '₹0',
    completedAmount: '₹0',
    pendingAmount: '₹0'
  });

  const API_URL = "https://surksha360-backend.onrender.com/api";

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  // Generate months from registration date to current date (for pending)
  const getMonthsFromRegistration = (registrationDate) => {
    const months = [];
    const startDate = new Date(registrationDate);
    const currentDate = new Date();
    
    startDate.setDate(1);
    currentDate.setDate(1);
    
    let current = new Date(startDate);
    
    while (current <= currentDate) {
      months.push({
        value: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        label: current.toLocaleString('default', { month: 'long', year: 'numeric' }),
        type: 'pending'
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  // Generate future months (up to 12 months ahead)
  const getFutureMonths = () => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      months.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        type: 'future'
      });
    }
    return months;
  };

  // Get all available months (pending + future)
  const getAllMonths = (member) => {
    if (!member) return getFutureMonths();
    
    const pendingMonths = getMonthsFromRegistration(member.registrationDate);
    const futureMonths = getFutureMonths();
    
    // Combine and remove duplicates
    const allMonths = [...pendingMonths];
    futureMonths.forEach(futureMonth => {
      if (!allMonths.some(m => m.value === futureMonth.value)) {
        allMonths.push(futureMonth);
      }
    });
    
    return allMonths;
  };

  // Fetch all registrations
  const [allRegistrations, setAllRegistrations] = useState([]);

  useEffect(() => {
    fetchAllRegistrations();
    fetchAllPayments();
  }, []);

  const fetchAllRegistrations = async () => {
    try {
      const response = await axios.get(`${API_URL}/registrations`);
      setAllRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  // Fetch all payments
  const fetchAllPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments`);
      let payments = [];
      if (Array.isArray(response.data)) {
        payments = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        payments = response.data.data;
      }
      
      setAllPayments(payments);
      setRecentPayments(payments.slice(0, 5));
      
      // Calculate summary
      if (payments.length > 0) {
        let total = 0;
        let completed = 0;
        let pending = 0;
        
        payments.forEach(payment => {
          const paymentTotal = 10 * (payment.months?.length || 1);
          total += paymentTotal;
          
          if (payment.status === 'Completed') {
            completed += paymentTotal;
          } else if (payment.status === 'Pending') {
            pending += paymentTotal;
          }
        });
        
        setSummary({
          totalAmount: `₹${total.toLocaleString('en-IN')}`,
          completedAmount: `₹${completed.toLocaleString('en-IN')}`,
          pendingAmount: `₹${pending.toLocaleString('en-IN')}`
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  // Check if a member has paid for a specific month
  const hasMemberPaidForMonth = (memberId, month) => {
    return allPayments.some(payment => 
      payment.memberId === memberId && 
      payment.months && 
      payment.months.includes(month) &&
      payment.status === 'Completed'
    );
  };

  // Check if month is pending for a member
  const isMonthPending = (memberId, registrationDate, month) => {
    const pendingMonths = getMonthsFromRegistration(registrationDate);
    const isPending = pendingMonths.some(m => m.value === month);
    
    if (!isPending) return false;
    
    // Check if already paid
    const paid = hasMemberPaidForMonth(memberId, month);
    return !paid;
  };

  // Get all pending months for a member
  const getPendingMonthsForMember = (member) => {
    const pendingMonths = getMonthsFromRegistration(member.registrationDate);
    return pendingMonths.filter(month => !hasMemberPaidForMonth(member._id, month.value));
  };

  // Calculate total amount based on selected members and months
  const calculateTotal = () => {
    if (selectedMembers.length === 0 || selectedMonths.length === 0) return 0;
    
    let total = 0;
    
    selectedMembers.forEach(member => {
      selectedMonths.forEach(month => {
        // Only count if member hasn't paid for this month
        if (!hasMemberPaidForMonth(member._id, month)) {
          total += 10;
        }
      });
    });
    
    return total;
  };

  // Get summary of what will be paid
  const getPaymentSummary = () => {
    if (selectedMembers.length === 0 || selectedMonths.length === 0) return [];
    
    const summary = [];
    
    selectedMembers.forEach(member => {
      const memberMonths = [];
      selectedMonths.forEach(month => {
        if (!hasMemberPaidForMonth(member._id, month)) {
          memberMonths.push(month);
        }
      });
      
      if (memberMonths.length > 0) {
        summary.push({
          member: member.name,
          months: memberMonths,
          count: memberMonths.length,
          amount: memberMonths.length * 10
        });
      }
    });
    
    return summary;
  };

  // Fetch family members by family ID
  const fetchFamilyMembers = async () => {
    if (!familyId.trim()) {
      setError('Please enter a Family ID');
      return;
    }
    
    setLoading(true);
    setError('');
    setFamilyMembers([]);
    setSelectedMembers([]);
    setSelectedMonths([]);
    setShowScanner(false); // Reset scanner when searching new family
    
    try {
      const filtered = allRegistrations.filter(reg => 
        reg.registrationId && reg.registrationId.toString() === familyId.toString()
      );
      
      if (filtered.length > 0) {
        const members = [];
        filtered.forEach(reg => {
          reg.members.forEach(member => {
            members.push({
              ...member,
              registrationId: reg.registrationId,
              familyId: reg.registrationId,
              registrationDate: reg.registrationDate,
              pendingMonths: getPendingMonthsForMember({
                ...member,
                registrationDate: reg.registrationDate
              })
            });
          });
        });
        
        setFamilyMembers(members);
      } else {
        setError(`No members found with Family ID: "${familyId}"`);
      }
      
    } catch (err) {
      console.error('Error in fetchFamilyMembers:', err);
      setError('Error fetching family members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle member selection (multiple selection)
  const toggleMember = (member) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m._id === member._id);
      if (exists) {
        return prev.filter(m => m._id !== member._id);
      } else {
        return [...prev, member];
      }
    });
  };

  // Toggle month selection (multiple selection)
  const toggleMonth = (monthValue) => {
    setSelectedMonths(prev => {
      const exists = prev.includes(monthValue);
      if (exists) {
        return prev.filter(m => m !== monthValue);
      } else {
        return [...prev, monthValue];
      }
    });
  };

  // Select all pending months for a member
  const selectAllPendingForMember = (member) => {
    const pendingMonths = getPendingMonthsForMember(member);
    const pendingValues = pendingMonths.map(m => m.value);
    
    setSelectedMonths(prev => {
      const newSelection = [...prev];
      pendingValues.forEach(month => {
        if (!newSelection.includes(month)) {
          newSelection.push(month);
        }
      });
      return newSelection;
    });
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one member');
      return;
    }
    if (selectedMonths.length === 0) {
      setError('Please select at least one month');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const paymentPromises = [];
      
      selectedMembers.forEach(member => {
        const monthsToPay = selectedMonths.filter(month => 
          !hasMemberPaidForMonth(member._id, month)
        );
        
        if (monthsToPay.length > 0) {
          const paymentData = {
            familyId: familyId.trim(),
            memberId: member._id,
            memberName: member.name,
            amount: 10,
            months: monthsToPay,
            paymentMethod,
            status: 'Completed', // Always Completed for both cash and scanner
            notes: `Payment for ${monthsToPay.length} month(s) via ${paymentMethod}`
          };
          
          console.log('Sending payment to:', `${API_URL}/payments`);
          console.log('Payment data:', paymentData);
          
          paymentPromises.push(axios.post(`${API_URL}/payments`, paymentData));
        }
      });

      if (paymentPromises.length === 0) {
        setError('All selected members have already paid for selected months');
        setLoading(false);
        return;
      }

      const responses = await Promise.all(paymentPromises);
      console.log('Payment responses:', responses);

      const totalPaid = paymentPromises.length * 10 * selectedMonths.length;
      
      alert(`Successfully processed payment of ₹${totalPaid} for ${paymentPromises.length} member(s)`);

      // Reset form
      setSelectedMembers([]);
      setSelectedMonths([]);
      setPaymentMethod('cash');
      setShowScanner(false);
      
      // Refresh data
      await fetchAllPayments();
      await fetchFamilyMembers();
      
    } catch (err) {
      console.error('Error processing payment:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data?.message || `Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Cannot connect to server. Please check if backend is running.');
      } else {
        setError('Error processing payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchFamilyMembers();
    }
  };

  // Check if a month is pending for any selected member
  const isMonthPendingForAnySelected = (month) => {
    return selectedMembers.some(member => {
      const pendingMonths = getMonthsFromRegistration(member.registrationDate);
      const isPending = pendingMonths.some(m => m.value === month);
      return isPending && !hasMemberPaidForMonth(member._id, month);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">
          Payments Overview
        </h1>

        {/* Family ID Input */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base">
                🔍
              </span>
              <input
                type="text"
                placeholder="Enter Family ID (Registration ID)"
                value={familyId}
                onChange={(e) => setFamilyId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button 
              onClick={fetchFamilyMembers}
              disabled={loading || !familyId.trim()}
              className="px-4 md:px-6 py-2 md:py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && (
            <div className="mt-2 p-2 md:p-3 bg-red-50 text-red-600 rounded-lg text-xs md:text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg md:rounded-xl shadow-md p-3 md:p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm opacity-90">Total Amount</p>
                <p className="text-lg md:text-2xl font-bold">{summary.totalAmount}</p>
              </div>
              <span className="text-2xl md:text-3xl">💰</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Completed</p>
                <p className="text-lg md:text-2xl font-bold text-green-600">{summary.completedAmount}</p>
              </div>
              <span className="text-2xl md:text-3xl">✅</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-500">Pending</p>
                <p className="text-lg md:text-2xl font-bold text-orange-600">{summary.pendingAmount}</p>
              </div>
              <span className="text-2xl md:text-3xl">⏳</span>
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex justify-center py-6 md:py-10">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-orange-600"></div>
          </div>
        )}

        {/* Family Members Section */}
        {familyMembers.length > 0 && !loading && (
          <>
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  Select Members (Multiple)
                </h2>
                <div className="flex gap-2">
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs md:text-sm text-gray-600">
                    {familyMembers.length} total
                  </span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs md:text-sm">
                    {selectedMembers.length} selected
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:space-y-3">
                {familyMembers.map(member => {
                  const isSelected = selectedMembers.some(m => m._id === member._id);
                  const pendingCount = member.pendingMonths?.length || 0;
                  
                  return (
                    <div
                      key={member._id}
                      onClick={() => toggleMember(member)}
                      className={`p-2 md:p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 md:space-x-3">
                          <span className="text-xl md:text-2xl">👤</span>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm md:text-base">
                              {member.name}
                            </p>
                            <p className="text-xs md:text-sm text-gray-500">
                              {member.phone || 'No phone'} • ₹10/month
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pendingCount > 0 && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                              {pendingCount} pending
                            </span>
                          )}
                          {isSelected && (
                            <span className="w-5 h-5 md:w-6 md:h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs md:text-sm">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Month Selection - Multiple Months with Pending Highlight */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-4 mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  Select Months (Multiple)
                </h2>
                <div className="flex gap-2">
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs md:text-sm">
                    {selectedMonths.length} selected
                  </span>
                </div>
              </div>

              {/* Pending Months Section (if members selected) */}
              {selectedMembers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2 flex items-center justify-between">
                    <span>🔴 Pending Months (Due)</span>
                    <button
                      onClick={() => {
                        // Select all pending months for all selected members
                        const allPendingMonths = new Set();
                        selectedMembers.forEach(member => {
                          getPendingMonthsForMember(member).forEach(m => allPendingMonths.add(m.value));
                        });
                        setSelectedMonths(Array.from(allPendingMonths));
                      }}
                      className="text-xs text-orange-600 hover:text-orange-700"
                    >
                      Select All Pending
                    </button>
                  </p>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {Array.from(new Set(selectedMembers.flatMap(member => 
                      getPendingMonthsForMember(member).map(m => m.value)
                    ))).sort().map(monthValue => {
                      const month = {
                        value: monthValue,
                        label: new Date(monthValue + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
                      };
                      const isSelected = selectedMonths.includes(month.value);
                      
                      return (
                        <button
                          key={month.value}
                          onClick={() => toggleMonth(month.value)}
                          className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                            isSelected
                              ? 'bg-orange-600 text-white'
                              : 'bg-red-100 text-red-600 hover:bg-red-200 border border-red-300'
                          }`}
                        >
                          {month.label} ⚠️
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Future Months */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">📅 Future Months (Advance)</p>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {getFutureMonths().map(month => {
                    const isSelected = selectedMonths.includes(month.value);
                    const isPendingForAny = isMonthPendingForAnySelected(month.value);
                    
                    // Don't show if it's already in pending
                    if (isPendingForAny) return null;
                    
                    return (
                      <button
                        key={month.value}
                        onClick={() => toggleMonth(month.value)}
                        className={`px-2 md:px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                        }`}
                      >
                        {month.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-4 mb-4 md:mb-6">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">
                Payment Method
              </h2>

              <div className="flex gap-2 md:gap-4">
                <button
                  onClick={() => {
                    setPaymentMethod('cash');
                    setShowScanner(false);
                  }}
                  className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg font-medium flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                  }`}
                >
                  <span>💵</span>
                  Cash
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod('scanner');
                    setShowScanner(true);
                  }}
                  className={`flex-1 py-2 md:py-3 px-2 md:px-4 rounded-lg font-medium flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm transition-all ${
                    paymentMethod === 'scanner'
                      ? 'bg-orange-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                  }`}
                >
                  <span>📱</span>
                  Scanner
                </button>
              </div>

              {/* Scanner Image Display */}
              {showScanner && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-sm font-medium text-gray-700 mb-3">Scan QR Code to Pay</p>
                  <div className="flex justify-center">
                    <img 
                      src="/src/assets/scanner.jpg" 
                      alt="Scanner QR Code"
                      className="max-w-full h-auto rounded-lg shadow-md"
                      style={{ maxHeight: '200px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x200?text=QR+Code';
                      }}
                    />
                  </div>
                  <p className="text-xs text-green-600 font-medium text-center mt-3">
                    ✓ Payment will be marked as Completed
                  </p>
                </div>
              )}
            </div>

            {/* Payment Summary */}
            {(selectedMembers.length > 0 || selectedMonths.length > 0) && (
              <div className="sticky bottom-2 md:bottom-4 bg-white shadow-lg rounded-lg md:rounded-xl p-3 md:p-4 border border-orange-100">
                <div className="space-y-3">
                  {/* Summary Header */}
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-sm font-medium text-gray-700">Payment Summary</span>
                    <span className="text-xs text-gray-500">
                      {selectedMembers.length} members × {selectedMonths.length} months
                    </span>
                  </div>

                  {/* Detailed Breakdown */}
                  {getPaymentSummary().map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-gray-800">{item.member}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({item.months.length} month{item.months.length > 1 ? 's' : ''})
                        </span>
                      </div>
                      <span className="font-bold text-orange-600">₹{item.amount}</span>
                    </div>
                  ))}

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-base font-semibold text-gray-800">Total Amount:</span>
                    <span className="text-xl md:text-2xl font-bold text-orange-600">
                      ₹{calculateTotal()}
                    </span>
                  </div>

                  {/* Payment Method Indicator */}
                  <div className="flex items-center justify-center gap-2 text-xs">
                    <span className="text-gray-500">Payment via:</span>
                    <span className={`font-medium ${paymentMethod === 'cash' ? 'text-green-600' : 'text-blue-600'}`}>
                      {paymentMethod === 'cash' ? '💵 Cash' : '📱 Scanner'}
                    </span>
                    <span className="text-green-600 font-medium">✓ Completed</span>
                  </div>

                  {/* Pay Button */}
                  <button
                    onClick={handlePayment}
                    disabled={loading || selectedMembers.length === 0 || selectedMonths.length === 0 || calculateTotal() === 0}
                    className="w-full py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm md:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : `Pay ₹${calculateTotal()}`}
                  </button>

                  {/* Warning if no valid payments */}
                  {calculateTotal() === 0 && selectedMembers.length > 0 && selectedMonths.length > 0 && (
                    <p className="text-xs text-red-500 text-center">
                      ⚠️ All selected members have already paid for selected months
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* No Members Found State */}
        {familyMembers.length === 0 && !loading && familyId && error && (
          <div className="bg-white rounded-lg md:rounded-xl shadow-md p-6 md:p-8 text-center mb-4 md:mb-6">
            <span className="text-4xl md:text-6xl mb-4 block">👥</span>
            <p className="text-gray-500 text-sm md:text-base mb-4">
              No family members found with ID: "{familyId}"
            </p>
          </div>
        )}

        {/* Recent Payments */}
        <div className="bg-white rounded-lg md:rounded-xl shadow-md p-3 md:p-4">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              Recent Payments
            </h2>
            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs md:text-sm text-gray-600">
              {recentPayments.length} payments
            </span>
          </div>

          {recentPayments.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {recentPayments.map((payment) => (
                <div key={payment._id} className="border-b border-gray-100 last:border-0 pb-2 md:pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <span className="text-xl md:text-2xl">💰</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm md:text-base">
                          {payment.memberName || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.months?.length || 1} month(s) • {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                      <span className="font-bold text-gray-800 text-sm md:text-base">
                        ₹{10 * (payment.months?.length || 1)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        (payment.status || 'pending').toLowerCase() === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {payment.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 md:py-8">
              <span className="text-4xl md:text-6xl mb-4 block">📭</span>
              <p className="text-gray-500 text-sm md:text-base">No payments yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
