import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation должен использоваться внутри NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [currentView, setCurrentView] = useState('home');
  const [navigationHistory, setNavigationHistory] = useState(['home']);

  const navigateTo = (view, options = {}) => {
    const { replace = false, returnUrl = null } = options;
    
    if (replace) {
      // Заменяем текущую страницу в истории
      setNavigationHistory(prev => [...prev.slice(0, -1), view]);
    } else {
      // Добавляем новую страницу в историю
      setNavigationHistory(prev => [...prev, view]);
    }
    
    setCurrentView(view);
    
    // Сохраняем returnUrl если указан
    if (returnUrl) {
      sessionStorage.setItem(`returnUrl_${view}`, returnUrl);
    }
  };

  const goBack = (fallbackView = 'home') => {
    const currentViewIndex = navigationHistory.length - 1;
    
    if (currentViewIndex > 0) {
      // Есть предыдущая страница в истории
      const previousView = navigationHistory[currentViewIndex - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentView(previousView);
      return previousView;
    } else {
      // Проверяем сохраненный returnUrl
      const savedReturnUrl = sessionStorage.getItem(`returnUrl_${currentView}`);
      if (savedReturnUrl) {
        sessionStorage.removeItem(`returnUrl_${currentView}`);
        navigateTo(savedReturnUrl, { replace: true });
        return savedReturnUrl;
      } else {
        // Возвращаемся на fallback страницу
        navigateTo(fallbackView, { replace: true });
        return fallbackView;
      }
    }
  };

  const navigateWithReturn = (targetView, returnView = null) => {
    const actualReturnView = returnView || currentView;
    navigateTo(targetView, { returnUrl: actualReturnView });
  };

  const canGoBack = () => {
    return navigationHistory.length > 1 || 
           sessionStorage.getItem(`returnUrl_${currentView}`) !== null;
  };

  const getPreviousView = () => {
    const currentViewIndex = navigationHistory.length - 1;
    if (currentViewIndex > 0) {
      return navigationHistory[currentViewIndex - 1];
    }
    
    const savedReturnUrl = sessionStorage.getItem(`returnUrl_${currentView}`);
    return savedReturnUrl || 'home';
  };

  const resetNavigation = () => {
    setCurrentView('home');
    setNavigationHistory(['home']);
    // Очищаем все сохраненные returnUrl
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('returnUrl_')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const value = {
    currentView,
    navigationHistory,
    navigateTo,
    goBack,
    navigateWithReturn,
    canGoBack,
    getPreviousView,
    resetNavigation
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
