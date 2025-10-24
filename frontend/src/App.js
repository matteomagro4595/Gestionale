import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home';
import ExpensesDashboard from './pages/Expenses/Dashboard';
import GroupDetail from './pages/Expenses/GroupDetail';
import ShoppingLists from './pages/Shopping/ShoppingLists';
import ShoppingListDetail from './pages/Shopping/ShoppingListDetail';
import GymCards from './pages/Gym/GymCards';
import GymCardDetail from './pages/Gym/GymCardDetail';

// Components
import Navbar from './components/Navbar';

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
