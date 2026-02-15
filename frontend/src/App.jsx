import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import UserLogin from './pages/UserLogin'
import UserRegister from './pages/UserRegister'
import AdminLogin from './pages/AdminLogin'
import AdminRegister from './pages/AdminRegister'
import UserDashboard from './user/UserDashboard'
import UserBenefits from './user/Benefits'           // New Benefits page
import UserInstallments from './user/Installments'   // New Installments page
import UserApplyBenefit from './user/ApplyBenefit'   // New Apply Benefit page
import AdminLayout from './admin/AdminLayout'
import Dashboard from './admin/pages/Dashboard'
import Users from './admin/pages/Users'
import Benefits from './admin/pages/Benefits'
import Payments from './admin/pages/Payments'
import Settings from './admin/pages/Settings'
import UserRegistration from './admin/pages/UserRegistration'
import UserManagement from './admin/pages/UserManagement'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} setUser={setUser} />} />
        <Route path="/user/login" element={<UserLogin setUser={setUser} />} />
        <Route path="/user/register" element={<UserRegister />} />
        
        {/* User Routes - Protected */}
        <Route path="/user/dashboard" element={
          user && user.role === 'user' ? 
          <UserDashboard user={user} setUser={setUser} /> : 
          <Navigate to="/user/login" />
        } />
        
        {/* New User Benefit Routes */}
        <Route path="/user/benefits" element={
          user && user.role === 'user' ? 
          <UserBenefits user={user} setUser={setUser} /> : 
          <Navigate to="/user/login" />
        } />
        
        <Route path="/user/installments" element={
          user && user.role === 'user' ? 
          <UserInstallments user={user} setUser={setUser} /> : 
          <Navigate to="/user/login" />
        } />
        
        <Route path="/user/apply-benefit" element={
          user && user.role === 'user' ? 
          <UserApplyBenefit user={user} setUser={setUser} /> : 
          <Navigate to="/user/login" />
        } />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin setUser={setUser} />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        
        {/* Admin Routes wrapped with AdminLayout - Protected */}
        <Route path="/admin" element={
          user && user.role === 'admin' ? 
          <AdminLayout user={user} setUser={setUser} /> : 
          <Navigate to="/admin/login" />
        }>
          <Route index element={<Navigate to="dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="benefits" element={<Benefits />} />
          <Route path="payments" element={<Payments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="user-registration" element={<UserRegistration />} />
          <Route path="user-management" element={<UserManagement />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

export default App