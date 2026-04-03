import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import ViewSearch from './pages/ViewSearch';
import CourseEnrollment from './pages/CourseEnrollment';
import StudentReport from './pages/StudentReport';
import AdvancedFeatures from './pages/AdvancedFeatures';
import ExamManagement from './pages/ExamManagement';
import ResultManagement from './pages/ResultManagement';
import Login from './pages/Login';



const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <AppLayout>
                <Dashboard />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/data-entry"
          element={
            isAuthenticated ? (
              <AppLayout>
                <DataEntry />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
            path="/enrollment"
            element={
                isAuthenticated ? (
                    <AppLayout>
                        <CourseEnrollment />
                    </AppLayout>
                ) : (
                    <Navigate to="/login" />
                )
            }
        />
        <Route
          path="/view-search"
          element={
            isAuthenticated ? (
              <AppLayout>
                <ViewSearch />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/exams"
          element={
            isAuthenticated ? (
              <AppLayout>
                <ExamManagement />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/results"
          element={
            isAuthenticated ? (
              <AppLayout>
                <ResultManagement />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/student-report"
          element={
            isAuthenticated ? (
              <AppLayout>
                <StudentReport />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/advanced"
          element={
            isAuthenticated ? (
              <AppLayout>
                <AdvancedFeatures />
              </AppLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;