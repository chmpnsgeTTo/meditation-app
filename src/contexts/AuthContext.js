import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненные данные пользователя
    const savedUser = localStorage.getItem('meditationUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const register = (userData) => {
    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar || null,
      joinDate: new Date().toISOString(),
      stats: {
        totalSessions: 0,
        totalMinutes: 0,
        streak: 0,
        lastSessionDate: null,
        favoriteSound: null,
        achievements: []
      },
      notes: []
    };
    
    setUser(newUser);
    localStorage.setItem('meditationUser', JSON.stringify(newUser));
    return newUser;
  };

  const login = (email, password) => {
    // Простая проверка для демо
    const savedUser = localStorage.getItem('meditationUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      if (user.email === email) {
        setUser(user);
        return user;
      }
    }
    throw new Error('Неверные учетные данные');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('meditationUser');
  };

  const updateUserStats = (sessionData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      stats: {
        ...user.stats,
        totalSessions: user.stats.totalSessions + 1,
        totalMinutes: user.stats.totalMinutes + Math.floor(sessionData.duration / 60),
        lastSessionDate: new Date().toISOString(),
        favoriteSound: sessionData.sound || user.stats.favoriteSound
      }
    };

    // Обновляем streak
    const today = new Date().toDateString();
    const lastSession = user.stats.lastSessionDate ? new Date(user.stats.lastSessionDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastSession === yesterday) {
      updatedUser.stats.streak = user.stats.streak + 1;
    } else if (lastSession !== today) {
      updatedUser.stats.streak = 1;
    }

    // Проверяем достижения
    checkAchievements(updatedUser);

    setUser(updatedUser);
    localStorage.setItem('meditationUser', JSON.stringify(updatedUser));
  };

  const checkAchievements = (user) => {
    const achievements = [...user.stats.achievements];
    
    // Первая сессия
    if (user.stats.totalSessions === 1 && !achievements.includes('first_session')) {
      achievements.push('first_session');
    }
    
    // 7 дней подряд
    if (user.stats.streak >= 7 && !achievements.includes('week_streak')) {
      achievements.push('week_streak');
    }
    
    // 30 дней подряд
    if (user.stats.streak >= 30 && !achievements.includes('month_streak')) {
      achievements.push('month_streak');
    }
    
    // 100 сессий
    if (user.stats.totalSessions >= 100 && !achievements.includes('hundred_sessions')) {
      achievements.push('hundred_sessions');
    }

    user.stats.achievements = achievements;
  };

  const updateProfile = (profileData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...profileData
    };

    setUser(updatedUser);
    localStorage.setItem('meditationUser', JSON.stringify(updatedUser));
  };

  const addNote = (noteData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      notes: [...(user.notes || []), noteData]
    };

    setUser(updatedUser);
    localStorage.setItem('meditationUser', JSON.stringify(updatedUser));
  };

  const updateNote = (noteId, noteData) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      notes: (user.notes || []).map(note => 
        note.id === noteId ? { ...note, ...noteData } : note
      )
    };

    setUser(updatedUser);
    localStorage.setItem('meditationUser', JSON.stringify(updatedUser));
  };

  const deleteNote = (noteId) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      notes: (user.notes || []).filter(note => note.id !== noteId)
    };

    setUser(updatedUser);
    localStorage.setItem('meditationUser', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isLoading,
    register,
    login,
    logout,
    updateUserStats,
    updateProfile,
    addNote,
    updateNote,
    deleteNote
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
