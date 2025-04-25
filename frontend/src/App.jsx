import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthForm } from './pages/auth/AuthForm';
import { Dashboard } from './pages/dashboard/Dashboard';
import { Portfolio } from './pages/portfolio/Portfolio';
import { Markets } from './pages/markets/Markets';
import { Sidebar } from './components/layout/Sidebar';
import { Settings } from './pages/settings/Settings';
import { TransactionHistory } from './pages/transactions/TransactionHistory';
import { Referrals } from './pages/referrals/Referrals';
import { Learn } from './pages/learn/Learn';
import { Header } from './components/layout/Header';
import { DepositPage } from './pages/deposit/DepositPage';
import { NotificationProvider } from './context/NotificationContext';
import { PricePage } from './pages/price/PricePage';
import { AuthProvider } from './store/auth/AuthContext';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { useAuth } from './store/auth/useAuth';
import Users from './pages/admin/users/Users'; 
import { ApiDocsPage } from './pages/ApiDocs/ApiDocsPage';


function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-primary transition-colors duration-200">
      <Header onSidebarOpen={() => setIsSidebarOpen(true)} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}

// Crie um componente de rota protegida para admin
function AdminRoute({ children }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <AuthProvider>
            <Layout>
              <AnimatePresence mode="wait">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/signin" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center min-h-[80vh]"
                    >
                      <AuthForm type="signin" />
                    </motion.div>
                  } />
                  <Route path="/signup" element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center min-h-[80vh]"
                    >
                      <AuthForm type="signup" />
                    </motion.div>
                  } />
                  <Route path="/login" element={<Navigate to="/signin" replace />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/portfolio" element={
                    <PrivateRoute>
                      <Portfolio />
                    </PrivateRoute>
                  } />
                  <Route path="/markets" element={
                    <PrivateRoute>
                      <Markets />
                    </PrivateRoute>
                  } />
                  <Route path="/settings/*" element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } />
                  <Route path="/history" element={
                    <PrivateRoute>
                      <TransactionHistory />
                    </PrivateRoute>
                  } />
                  <Route path="/referrals" element={
                    <PrivateRoute>
                      <Referrals />
                    </PrivateRoute>
                  } />
                  <Route path="/learn" element={
                    <PrivateRoute>
                      <Learn />
                    </PrivateRoute>
                  } />
                  <Route path="/deposit" element={
                    <PrivateRoute>
                      <DepositPage />
                    </PrivateRoute>
                  } />
                  <Route path="/price/:coinId" element={
                    <PrivateRoute>
                      <PricePage />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/users" element={
                    <PrivateRoute>
                      <Users />
                    </PrivateRoute>
                  } />

                  {/* API Docs Route */}
                  <Route path="/api-docs" element={
                    <AdminRoute>
                      <ApiDocsPage />
                    </AdminRoute>
                  } />

                  {/* Default Route */}
                  <Route path="/" element={<Navigate to="/signin" replace />} />
                </Routes>
              </AnimatePresence>
            </Layout>
          </AuthProvider>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
