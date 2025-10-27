import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home';
import ExpensesDashboard from './pages/Expenses/Dashboard';
import ExpensesSummary from './pages/Expenses/Summary';
import GroupDetail from './pages/Expenses/GroupDetail';
import GroupJoin from './pages/Expenses/GroupJoin';
import ShoppingLists from './pages/Shopping/ShoppingLists';
import ShoppingListDetail from './pages/Shopping/ShoppingListDetail';
import ShoppingListJoin from './pages/Shopping/ShoppingListJoin';
import GymCards from './pages/Gym/GymCards';
import GymCardDetail from './pages/Gym/GymCardDetail';

// Components
import Navbar from './components/Navbar';

// Theme Manager Component
const ThemeManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Remove all theme classes
    document.body.classList.remove('theme-default', 'theme-shopping', 'theme-expenses', 'theme-gym');

    // Add appropriate theme class
    if (location.pathname.startsWith('/shopping')) {
      document.body.classList.add('theme-shopping');
    } else if (location.pathname.startsWith('/expenses')) {
      document.body.classList.add('theme-expenses');
    } else if (location.pathname.startsWith('/gym')) {
      document.body.classList.add('theme-gym');
    } else {
      document.body.classList.add('theme-default');
    }
  }, [location.pathname]);

  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route (redirect to home if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <ThemeManager />
      <div className="App">
        <Routes>
          {/* Public routes */}
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

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navbar />
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <Navbar />
                <ExpensesDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/summary"
            element={
              <ProtectedRoute>
                <Navbar />
                <ExpensesSummary />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/groups/join/:token"
            element={
              <ProtectedRoute>
                <Navbar />
                <GroupJoin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses/groups/:groupId"
            element={
              <ProtectedRoute>
                <Navbar />
                <GroupDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping"
            element={
              <ProtectedRoute>
                <Navbar />
                <ShoppingLists />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping/join/:token"
            element={
              <ProtectedRoute>
                <Navbar />
                <ShoppingListJoin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping/:listId"
            element={
              <ProtectedRoute>
                <Navbar />
                <ShoppingListDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gym"
            element={
              <ProtectedRoute>
                <Navbar />
                <GymCards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gym/:cardId"
            element={
              <ProtectedRoute>
                <Navbar />
                <GymCardDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
