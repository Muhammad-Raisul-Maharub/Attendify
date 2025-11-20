
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LoginPage from './pages/Login';
import SignupPage from './pages/auth/Signup';
import ForgotPasswordPage from './pages/auth/ForgotPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import Layout from './components/shared/Layout';
import { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/ProfilePage';
import PlaceholderPage from './pages/PlaceholderPage';
import CoursesPage from './pages/CoursesPage';
import HistoryPage from './pages/student/HistoryPage';
import TeacherAnalyticsPage from './pages/teacher/AnalyticsPage';

const AppRoutes: React.FC = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }
  const { user, loading } = authContext;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Routes>
        <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage />} />
        <Route path="/signup" element={user ? <Navigate to={`/${user.role}`} /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Root redirect: If logged in, go to role dashboard; otherwise login */}
        <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <Navigate to="/login" />} />
        
        {/* Role-Based Routes with Redirect Guards */}
        <Route 
          path="/student" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'student' ? <Layout><StudentDashboard /></Layout> : 
            <Navigate to={`/${user.role}`} />
          } 
        />
        
        <Route 
          path="/teacher" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'teacher' ? <Layout><TeacherDashboard /></Layout> : 
            <Navigate to={`/${user.role}`} />
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'admin' ? <Layout><AdminDashboard /></Layout> : 
            <Navigate to={`/${user.role}`} />
          } 
        />
        
        {/* Shared Protected Routes */}
        <Route path="/profile" element={user ? <Layout><ProfilePage /></Layout> : <Navigate to="/login" />} />
        <Route path="/courses" element={user ? <Layout><CoursesPage /></Layout> : <Navigate to="/login" />} />
        
        {/* Specific Feature Routes */}
        <Route 
            path="/history" 
            element={
                !user ? <Navigate to="/login" /> :
                user.role === 'student' ? <Layout><HistoryPage /></Layout> : 
                <Navigate to={`/${user.role}`} />
            } 
        />
        
        <Route 
          path="/analytics" 
          element={
            !user ? <Navigate to="/login" /> :
            user.role === 'teacher' ? <Layout><TeacherAnalyticsPage /></Layout> :
            user.role === 'admin' ? <Layout><AdminAnalyticsPage /></Layout> :
            <Navigate to={`/${user.role}`} />
          } 
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
        <Toaster position="top-right" toastOptions={{
          className: 'rounded-xl bg-white dark:bg-slate-800 dark:text-slate-100 shadow-lg p-4',
          success: {
            iconTheme: {
              primary: '#16A34A',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: 'white',
            },
          }
        }} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
