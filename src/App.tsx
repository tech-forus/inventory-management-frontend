import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import { SidebarProvider, useSidebar } from './contexts/SidebarContext'

// Lazy load all components for code splitting and faster initial load
const LandingPage = lazy(() => import('./components/LandingPage'))
const RegistrationPage = lazy(() => import('./pages/RegistrationPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const OnboardingWizard = lazy(() => import('./pages/OnboardingWizard'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const SKUManagementPage = lazy(() => import('./pages/SKUManagementPage'))
const SKUCreatePage = lazy(() => import('./pages/SKUCreatePage'))
const SKUDetailPage = lazy(() => import('./pages/SKUDetailPage'))
const SKUMostSellingPage = lazy(() => import('./pages/SKUMostSellingPage'))
const SKUSlowMovingPage = lazy(() => import('./pages/SKUSlowMovingPage'))
const SKUNonMovablePage = lazy(() => import('./pages/SKUNonMovablePage'))
const InventoryPage = lazy(() => import('./pages/InventoryPage'))
const IncomingInventoryPage = lazy(() => import('./pages/IncomingInventoryPage'))
const OutgoingInventoryPage = lazy(() => import('./pages/OutgoingInventoryPage'))
const ItemHistoryPage = lazy(() => import('./pages/ItemHistoryPage'))
const InvoiceHistoryPage = lazy(() => import('./pages/InvoiceHistoryPage'))
const RejectedItemReportPage = lazy(() => import('./pages/RejectedItemReportPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const LibraryPage = lazy(() => import('./pages/LibraryPage'))
const AccessControlPage = lazy(() => import('./pages/AccessControlPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const HelpSupportPage = lazy(() => import('./pages/HelpSupportPage'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
)

// Layout component with Sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { isOpen, toggleSidebar } = useSidebar();
  
  return (
    <div className="flex h-screen bg-bg-light">
      <Sidebar />
      <div className={`flex-1 overflow-auto transition-all duration-300 ${isOpen ? 'ml-60' : 'ml-0'} relative bg-bg-light`}>
        {/* Top Navigation Bar with Hamburger */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Hamburger Button - Always visible */}
          <button
            onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center"
              aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
              <Menu className="w-5 h-5 text-gray-700" />
          </button>
            
            {/* Right side can be used for search, user menu, etc. */}
            <div className="flex items-center gap-3">
              {/* Placeholder for future elements like search, notifications, user menu */}
            </div>
          </div>
        </div>
        
        <div>
          {children}
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <SidebarProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingWizard />} />
          {/* Legacy dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* New app routes with sidebar */}
          <Route path="/app/dashboard" element={
            <AppLayout>
              <Dashboard />
            </AppLayout>
          } />
          {/* SKU Management Routes */}
          <Route path="/app/sku" element={
            <AppLayout>
              <SKUManagementPage />
            </AppLayout>
          } />
          <Route path="/app/sku/create" element={
            <AppLayout>
              <SKUCreatePage />
            </AppLayout>
          } />
          <Route path="/app/sku/analytics/most-selling" element={
            <AppLayout>
              <SKUMostSellingPage />
            </AppLayout>
          } />
          <Route path="/app/sku/analytics/slow-moving" element={
            <AppLayout>
              <SKUSlowMovingPage />
            </AppLayout>
          } />
          <Route path="/app/sku/analytics/non-movable" element={
            <AppLayout>
              <SKUNonMovablePage />
            </AppLayout>
          } />
          <Route path="/app/sku/:id" element={
            <AppLayout>
              <SKUDetailPage />
            </AppLayout>
          } />
          {/* Inventory Routes */}
          <Route path="/app/inventory" element={
            <AppLayout>
              <InventoryPage />
            </AppLayout>
          } />
          <Route path="/app/inventory/incoming" element={
            <AppLayout>
              <IncomingInventoryPage />
            </AppLayout>
          } />
          <Route path="/app/inventory/outgoing" element={
            <AppLayout>
              <OutgoingInventoryPage />
            </AppLayout>
          } />
          <Route path="/app/inventory/:id/history" element={
            <AppLayout>
              <ItemHistoryPage />
            </AppLayout>
          } />
          <Route path="/app/invoice/:invoiceNumber/:skuCode/history" element={
            <AppLayout>
              <InvoiceHistoryPage />
            </AppLayout>
          } />
          <Route path="/app/rejected-items" element={
            <AppLayout>
              <RejectedItemReportPage />
            </AppLayout>
          } />
          {/* Reports Route */}
          <Route path="/app/reports" element={
            <AppLayout>
              <ReportsPage />
            </AppLayout>
          } />
          {/* Library Route */}
          <Route path="/app/library" element={
            <AppLayout>
              <LibraryPage />
            </AppLayout>
          } />
          {/* Access Control Route */}
          <Route path="/app/access-control" element={
            <AppLayout>
              <AccessControlPage />
            </AppLayout>
          } />
          {/* Profile Route */}
          <Route path="/app/profile" element={
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          } />
          {/* Settings Route */}
          <Route path="/app/settings" element={
            <AppLayout>
              <SettingsPage />
            </AppLayout>
          } />
          {/* Help & Support Route */}
          <Route path="/app/help" element={
            <AppLayout>
              <HelpSupportPage />
            </AppLayout>
          } />
        </Routes>
        </Suspense>
      </SidebarProvider>
    </BrowserRouter>
  )
}

export default App

