import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotesExplorer from './pages/NotesExplorer';
import NoteDetails from './pages/NoteDetails';
import OrganizeNotes from './pages/OrganizeNotes';
import UploadNote from './pages/UploadNote';
import Assignments from './pages/Assignments';
import NoticeBoard from './pages/NoticeBoard';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import NotesRequests from './pages/NotesRequests';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isPublicPage =
    location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register';

  if (isPublicPage) {
    return children;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-layout">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppLayout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes"
                element={
                  <ProtectedRoute>
                    <NotesExplorer />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes/:id"
                element={
                  <ProtectedRoute>
                    <NoteDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organize"
                element={
                  <ProtectedRoute>
                    <OrganizeNotes />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notes-requests"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <NotesRequests />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadNote />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/assignments"
                element={
                  <ProtectedRoute>
                    <Assignments />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notice-board"
                element={
                  <ProtectedRoute>
                    <NoticeBoard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
