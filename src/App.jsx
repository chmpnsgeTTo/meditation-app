import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import BlockedModal from './components/BlockedModal';
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

// Компонент-обёртка для проверки блокировки
const AppContent = () => {
  const { user, loading, checkUserBlocked } = useAuth();
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockedUserId, setBlockedUserId] = useState(null);
  const [blockedUsername, setBlockedUsername] = useState('');

  useEffect(() => {
    const verifyUser = async () => {
      if (user) {
        const result = await checkUserBlocked(user.token);
        if (result.isBlocked) {
          setBlockReason(result.reason || 'Причина не указана');
          setBlockedUserId(user.userId);
          setBlockedUsername(user.username);
          setShowBlockedModal(true);
        }
      }
    };
    verifyUser();
  }, [user]);

  // Если пользователь заблокирован, показываем модальное окно поверх всего
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
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

      {/* Модальное окно блокировки */}
      <BlockedModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        blockReason={blockReason}
        userId={blockedUserId}
        username={blockedUsername}
      />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;