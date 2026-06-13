import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GiMeditation } from 'react-icons/gi';
import { MdSelfImprovement, MdOutlineLibraryBooks, MdOutlineBarChart, MdFeed } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { IoLogOutOutline } from 'react-icons/io5';
import { FiSun, FiMoon, FiShield } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();  // ← добавили user
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <GiMeditation size={24} />
        Yoga Practice
      </div>
      <div className={`nav-links ${mobileOpen ? 'show' : ''}`}>
        <Link to="/meditation" className={location.pathname === '/meditation' ? 'active' : ''}>
          <MdSelfImprovement size={18} /> Медитация
        </Link>
        <Link to="/learning" className={location.pathname === '/learning' ? 'active' : ''}>
          <MdOutlineLibraryBooks size={18} /> Направления
        </Link>
        <Link to="/catalog" className={location.pathname === '/catalog' ? 'active' : ''}>
          <MdOutlineBarChart size={18} /> Каталог асан
        </Link>
        <Link to="/feed" className={location.pathname === '/feed' ? 'active' : ''}>
          <MdFeed size={18} /> Лента
        </Link>
        <Link to="/courses" className={location.pathname === '/courses' ? 'active' : ''}>
          <GiMeditation size={18} /> Курсы
        </Link>
        <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
          <FaUserCircle size={18} /> Профиль
        </Link>
        
        {/* Ссылка на админ-панель (только для админов) */}
        {user?.role === 'admin' && (
          <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
            <FiShield size={18} /> Админ
          </Link>
        )}
        
        <button onClick={toggleDarkMode} className="theme-toggle">
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        <a onClick={logout}>
          <IoLogOutOutline size={18} /> Выйти
        </a>
      </div>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
    </nav>
  );
};

export default Navbar;