import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import CampaignPicker from './pages/donate/CampaignPicker'
import DonateFlow from './pages/donate/DonateFlow'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Ledger from './pages/Ledger'
import Admin from './pages/Admin'
import Reconciliation from './pages/Reconciliation'
import Audit from './pages/Audit'
import Settings from './pages/Settings'

export default function App() {
  const [locale, setLocale] = useState('en')

  return (
    <div className="min-h-screen">
      <Navbar locale={locale} />
      <Routes>
        {/* Public donation app (M1) - no login required */}
        <Route path="/" element={<CampaignPicker locale={locale} />} />
        <Route path="/donate/:campaignId" element={<DonateFlow locale={locale} />} />
        <Route path="/settings" element={<Settings locale={locale} setLocale={setLocale} />} />

        {/* Charity staff admin tool (M2) */}
        <Route path="/staff/login" element={<Login locale={locale} />} />
        <Route path="/staff/dashboard" element={<ProtectedRoute><Dashboard locale={locale} /></ProtectedRoute>} />
        <Route path="/staff/ledger" element={<ProtectedRoute><Ledger locale={locale} /></ProtectedRoute>} />
        <Route path="/staff/campaigns" element={<ProtectedRoute minRole="manager"><Admin /></ProtectedRoute>} />
        <Route path="/staff/reconciliation" element={<ProtectedRoute><Reconciliation /></ProtectedRoute>} />
        <Route path="/staff/audit" element={<ProtectedRoute minRole="admin"><Audit /></ProtectedRoute>} />
        <Route path="/staff/settings" element={<ProtectedRoute><Settings locale={locale} setLocale={setLocale} /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
