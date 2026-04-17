import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
      direction: 'vertical',
      smooth: true,
      touchMultiplier: 2
    })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => { lenis.raf(time * 1000) })
    gsap.ticker.lagSmoothing(0)
    return () => lenis.destroy()
  }, [])
  return null
}

import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Layout from './components/Layout'
import AdminLayout from './components/AdminLayout'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler'
import DashboardPage from './pages/DashboardPage'
import ResourcesPage from './pages/resources/ResourcesPage'
import ResourceFormPage from './pages/resources/ResourceFormPage'
import NewBookingPage from './pages/bookings/NewBookingPage'
import MyBookingsPage from './pages/bookings/MyBookingsPage'
import NewTicketPage from './pages/tickets/NewTicketPage'
import MyTicketsPage from './pages/tickets/MyTicketsPage'
import TicketDetailPage from './pages/tickets/TicketDetailPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminTicketsPage from './pages/admin/AdminTicketsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import CheckInPage from './pages/admin/CheckInPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import TechnicianPage from './pages/technician/TechnicianPage'

import './App.css'

function PrivateLayout({ children, adminOnly }) {
  return (
    <PrivateRoute adminOnly={adminOnly}>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

function AdminPage({ children }) {
  return (
    <PrivateRoute adminOnly>
      <Layout>
        <AdminLayout>{children}</AdminLayout>
      </Layout>
    </PrivateRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/dashboard" element={<PrivateLayout><DashboardPage /></PrivateLayout>} />
          <Route path="/resources" element={<PrivateLayout><ResourcesPage /></PrivateLayout>} />
          <Route path="/bookings/new" element={<PrivateLayout><NewBookingPage /></PrivateLayout>} />
          <Route path="/bookings/my" element={<PrivateLayout><MyBookingsPage /></PrivateLayout>} />
          <Route path="/bookings" element={<PrivateLayout><MyBookingsPage /></PrivateLayout>} />
          <Route path="/tickets/new" element={<PrivateLayout><NewTicketPage /></PrivateLayout>} />
          <Route path="/tickets/my" element={<PrivateLayout><MyTicketsPage /></PrivateLayout>} />
          <Route path="/tickets/:id" element={<PrivateLayout><TicketDetailPage /></PrivateLayout>} />
          <Route path="/tickets" element={<PrivateLayout><MyTicketsPage /></PrivateLayout>} />
          <Route path="/technician" element={<PrivateLayout><TechnicianPage /></PrivateLayout>} />

          {/* Admin routes — all use AdminLayout sidebar */}
          <Route path="/admin/dashboard" element={<AdminPage><AdminDashboardPage /></AdminPage>} />
          <Route path="/admin/bookings" element={<AdminPage><AdminBookingsPage /></AdminPage>} />
          <Route path="/admin/tickets" element={<AdminPage><AdminTicketsPage /></AdminPage>} />
          <Route path="/admin/users" element={<AdminPage><AdminUsersPage /></AdminPage>} />
          <Route path="/admin/checkin" element={<AdminPage><CheckInPage /></AdminPage>} />
          <Route path="/admin/resources/new" element={<AdminPage><ResourceFormPage /></AdminPage>} />
          <Route path="/admin/resources/edit/:id" element={<AdminPage><ResourceFormPage /></AdminPage>} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="/settings" element={<PrivateLayout><SettingsPage /></PrivateLayout>} />
          <Route path="/profile" element={<PrivateLayout><ProfilePage /></PrivateLayout>} />
          <Route path="/" element={<HomePage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
