import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MeditationPage from './pages/MeditationPage';
import ProfilePage from './pages/ProfilePage';
import LearningPage from './pages/LearningPage';
import YogaDirectionPage from './pages/YogaDirectionPage';
import AsanasCatalog from './pages/AsanasCatalog';
import AsanaDetailPage from './pages/AsanaDetailPage';
import FeedPage from './pages/FeedPage';
import './index.css';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <div className="video-background">
            <video autoPlay muted loop playsInline>
              <source src="/videos/background.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="overlay"></div>
          
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/meditation" element={<PrivateRoute><MeditationPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="/learning" element={<PrivateRoute><LearningPage /></PrivateRoute>} />
            <Route path="/learning/:directionId" element={<PrivateRoute><YogaDirectionPage /></PrivateRoute>} />
            <Route path="/courses" element={<PrivateRoute><CoursesPage /></PrivateRoute>} />
            <Route path="/courses/:id" element={<PrivateRoute><CourseDetailPage /></PrivateRoute>} />
            <Route path="/catalog" element={<PrivateRoute><AsanasCatalog /></PrivateRoute>} />
            <Route path="/catalog/:id" element={<PrivateRoute><AsanaDetailPage /></PrivateRoute>} />
            <Route path="/feed" element={<PrivateRoute><FeedPage /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;