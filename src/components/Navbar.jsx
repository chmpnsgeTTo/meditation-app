import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GiMeditation } from 'react-icons/gi';
import { MdSelfImprovement, MdOutlineLibraryBooks, MdOutlineBarChart, MdFeed } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { IoLogOutOutline } from 'react-icons/io5';
import { FiSun, FiMoon, FiShield, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const location = useLocation();

  const toggleMenu = () => setMobileOpen(!mobileOpen);
  const closeMenu = () => setMobileOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand" onClick={closeMenu}>
        <GiMeditation size={24} />
        Yoga Practice
      </Link>

      <button className="mobile-menu-btn" onClick={toggleMenu}>
        {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      <div className={`nav-links ${mobileOpen ? 'show' : ''}`}>
        <Link 
          to="/meditation" 
          className={location.pathname === '/meditation' ? 'active' : ''}
          onClick={closeMenu}
        >
          <MdSelfImprovement size={18} /> Медитация
        </Link>
        <Link 
          to="/learning" 
          className={location.pathname === '/learning' ? 'active' : ''}
          onClick={closeMenu}
        >
          <MdOutlineLibraryBooks size={18} /> Направления
        </Link>
        <Link 
          to="/catalog" 
          className={location.pathname === '/catalog' ? 'active' : ''}
          onClick={closeMenu}
        >
          <MdOutlineBarChart size={18} /> Каталог асан
        </Link>
        <Link 
          to="/feed" 
          className={location.pathname === '/feed' ? 'active' : ''}
          onClick={closeMenu}
        >
          <MdFeed size={18} /> Лента
        </Link>
        <Link 
          to="/courses" 
          className={location.pathname === '/courses' ? 'active' : ''}
          onClick={closeMenu}
        >
          <GiMeditation size={18} /> Курсы
        </Link>
        <Link 
          to="/profile" 
          className={location.pathname === '/profile' ? 'active' : ''}
          onClick={closeMenu}
        >
          <FaUserCircle size={18} /> Профиль
        </Link>
        
        {/* Ссылка на админ-панель (только для админов) */}
        {user?.role === 'admin' && (
          <Link 
            to="/admin" 
            className={location.pathname === '/admin' ? 'active' : ''}
            onClick={closeMenu}
          >
            <FiShield size={18} /> Админ
          </Link>
        )}
        
        <button onClick={toggleDarkMode} className="theme-toggle">
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>
        
        <button onClick={logout} className="logout-btn">
          <IoLogOutOutline size={18} /> Выйти
        </button>
      </div>
    </nav>
  );
};

export default Navbar;