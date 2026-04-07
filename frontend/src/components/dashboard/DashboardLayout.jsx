import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  HeartIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  VideoCameraIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useUIStore } from '@/store';
import { Avatar } from '@/components/common';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navItems = [
    { path: '/app', icon: HomeIcon, label: 'Dashboard', end: true },
    { path: '/app/dogs', icon: HeartIcon, label: 'I Miei Cani' },
    { path: '/app/marketplace', icon: ShoppingBagIcon, label: 'Marketplace' },
    { path: '/app/community', icon: UserGroupIcon, label: 'Community' },
    { path: '/app/ai', icon: VideoCameraIcon, label: 'AI Trainer' },
  ];
  
  return (
    <div className={`dashboard-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <img src="/images/logo-ugo1.png" alt="DogLife" />
            {sidebarOpen && <span>DogLife</span>}
          </Link>
          <button 
            className="sidebar-toggle desktop"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Bars3Icon />
          </button>
          <button 
            className="sidebar-toggle mobile"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <XMarkIcon />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="sidebar-icon" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        
        <div className="sidebar-footer">
          <NavLink 
            to="/app/settings" 
            className="sidebar-link"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Cog6ToothIcon className="sidebar-icon" />
            {sidebarOpen && <span>Impostazioni</span>}
          </NavLink>
          <button className="sidebar-link logout" onClick={handleLogout}>
            <ArrowRightOnRectangleIcon className="sidebar-icon" />
            {sidebarOpen && <span>Esci</span>}
          </button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Bars3Icon />
          </button>
          
          <div className="header-search">
            <input 
              type="search" 
              placeholder="Cerca..." 
              className="search-input"
            />
          </div>
          
          <div className="header-user">
            <span className="user-greeting">
              Ciao, {user?.firstName || user?.username || 'Amico'}! 🐾
            </span>
            <Link to="/app/settings" className="user-avatar">
              <Avatar 
                src={user?.avatar} 
                name={user?.firstName || user?.username}
                size="md"
              />
            </Link>
          </div>
        </header>
        
        {/* Page Content */}
        <motion.div 
          className="dashboard-content"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
