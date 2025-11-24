import React, { useState, useCallback } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import HomePage from './components/HomePage';
import MeditationTimer from './components/MeditationTimer';
import SoundLibrary from './components/SoundLibrary';
import Profile from './components/Profile/Profile';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import Explore from './components/Explore/Explore';
import Notes from './components/Notes/Notes';
import YogaExercises from './components/YogaExercises/YogaExercises';

const AppContent = () => {
  const [selectedSound, setSelectedSound] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const { user, updateUserStats } = useAuth();
  const { currentView, navigateTo, goBack } = useNavigation();

  const handleMeditationComplete = useCallback((sessionData) => {
    if (user) {
      updateUserStats(sessionData);
    }
  }, [user, updateUserStats]);

  const renderCurrentView = () => {
    switch(currentView) {
      case 'timer':
        return (
          <MeditationTimer 
            selectedSound={selectedSound} 
            onBack={goBack}
            onSessionComplete={handleMeditationComplete}
          />
        );
      case 'sounds':
        return <SoundLibrary onBack={goBack} onSelectSound={setSelectedSound} />;
      case 'explore':
        return <Explore onBack={goBack} />;
      case 'notes':
        return <Notes onBack={goBack} />;
      case 'yoga':
        return <YogaExercises onBack={goBack} />;
      case 'profile':
        if (user) {
          return <Profile onBack={goBack} />;
        } else {
          setAuthModal('login');
          return null;
        }
      default:
        return (
          <HomePage 
            onNavigate={navigateTo} 
            onAuthClick={setAuthModal}
            user={user}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
      
      {authModal === 'login' && (
        <LoginForm
          onClose={() => setAuthModal(null)}
          onSwitchToRegister={() => setAuthModal('register')}
        />
      )}
      
      {authModal === 'register' && (
        <RegisterForm
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal('login')}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
