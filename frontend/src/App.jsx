import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store';

// Pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import { Login, Register } from '@/pages/Auth';
import DogsList from '@/pages/Dogs/DogsList';
import DogDetail from '@/pages/Dogs/DogDetail';
import DogForm from '@/pages/Dogs/DogForm';

// Marketplace Pages
import { MarketplaceList, CreateListing, ListingDetail } from '@/pages/Marketplace';

// Community Pages
import { CommunityList, GroupDetail } from '@/pages/Community';

// AI Trainer Pages
import { AITrainerDashboard, AnalysisResult } from '@/pages/AITrainer';

// Layouts
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Styles
import '@/styles/design-tokens.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1F2937',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected Routes - SaaS Dashboard */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          
          {/* Dogs */}
          <Route path="dogs" element={<DogsList />} />
          <Route path="dogs/new" element={<DogForm />} />
          <Route path="dogs/:id" element={<DogDetail />} />
          <Route path="dogs/:id/edit" element={<DogForm />} />
          
          {/* Marketplace */}
          <Route path="marketplace" element={<MarketplaceList />} />
          <Route path="marketplace/new" element={<CreateListing />} />
          <Route path="marketplace/:id" element={<ListingDetail />} />
          
          {/* Community */}
          <Route path="community" element={<CommunityList />} />
          <Route path="community/:slug" element={<GroupDetail />} />
          
          {/* AI Trainer */}
          <Route path="ai" element={<AITrainerDashboard />} />
          <Route path="ai/:id" element={<AnalysisResult />} />
          
          {/* Settings - Placeholder */}
          <Route path="settings" element={<ComingSoon title="Impostazioni" emoji="⚙️" />} />
        </Route>
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

// Coming Soon Placeholder
function ComingSoon({ title, emoji }) {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '4rem 2rem',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      <span style={{ fontSize: '4rem' }}>{emoji}</span>
      <h1 style={{ marginTop: '1rem', fontFamily: 'var(--font-display)' }}>{title}</h1>
      <p style={{ color: 'var(--gray-500)', marginTop: '0.5rem' }}>
        Questa sezione sarà disponibile a breve!
      </p>
    </div>
  );
}

// 404 Page
function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <span style={{ fontSize: '6rem' }}>🐕</span>
        <h1 style={{ fontFamily: 'var(--font-display)', marginTop: '1rem' }}>
          Oops! Pagina non trovata
        </h1>
        <p style={{ color: 'var(--gray-500)', margin: '1rem 0 2rem' }}>
          Sembra che questo cane sia scappato...
        </p>
        <a 
          href="/" 
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--gradient-warm)',
            color: 'white',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          Torna alla Home
        </a>
      </div>
    </div>
  );
}

export default App;
