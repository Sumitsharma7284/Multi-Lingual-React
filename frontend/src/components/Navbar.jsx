import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  Globe,
  FileText,
  Shield,
  Menu,
  X,
  CheckCircle,
  ExternalLink,
  UserCheck,
  Building,
} from 'lucide-react';

const Navbar = () => {
  const { language, switchLanguage, t, getLocalized, fontSizeLevel, adjustFontSize } = useLanguage();
  const { notifications, unreadCount, markAllAsRead } = useSocket();
  const { isAuthenticated, admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#DFE3E8] shadow-xs">
      {/* 1. National Tricolor Accent Bar (Top of Viewport) */}
      <div className="tricolor-stripe" />

      {/* 2. Official Institutional Utility Bar */}
      <div className="bg-[#F1F3F5] text-[#495057] text-xs py-1.5 px-4 sm:px-8 border-b border-[#DFE3E8]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Academic Portal Demonstration Notice */}
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#B84A00]"></span>
            <span className="text-[#495057] font-medium text-[11px]">
              {t('academicDisclaimer')}
            </span>
          </div>

          {/* Right Utilities: Accessibility Controls & Language Switcher */}
          <div className="flex items-center space-x-4">
            {/* Font Size Accessibility Adjuster */}
            <div className="hidden sm:flex items-center space-x-1 border-r border-[#DFE3E8] pr-3">
              <span className="text-[11px] text-[#6C757D] mr-1">{t('fontSize')}:</span>
              <button
                onClick={() => adjustFontSize(-1)}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition border ${
                  fontSizeLevel === -1
                    ? 'bg-[#181A1B] text-white border-[#181A1B]'
                    : 'bg-white hover:bg-[#E9ECEF] text-[#495057] border-[#DFE3E8]'
                }`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => adjustFontSize(0)}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition border ${
                  fontSizeLevel === 0
                    ? 'bg-[#181A1B] text-white border-[#181A1B]'
                    : 'bg-white hover:bg-[#E9ECEF] text-[#495057] border-[#DFE3E8]'
                }`}
                title="Default font size"
              >
                A
              </button>
              <button
                onClick={() => adjustFontSize(1)}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition border ${
                  fontSizeLevel === 1
                    ? 'bg-[#181A1B] text-white border-[#181A1B]'
                    : 'bg-white hover:bg-[#E9ECEF] text-[#495057] border-[#DFE3E8]'
                }`}
                title="Increase font size"
              >
                A+
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-[#6C757D] mr-1" />
              <button
                onClick={() => switchLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded-md transition font-medium ${
                  language === 'en'
                    ? 'bg-[#B84A00] text-white font-semibold shadow-xs'
                    : 'text-[#495057] hover:text-[#181A1B] hover:bg-[#E9ECEF]'
                }`}
              >
                English
              </button>
              <span className="text-[#CFD6DE]">|</span>
              <button
                onClick={() => switchLanguage('hi')}
                className={`px-2 py-0.5 text-[11px] rounded-md transition font-medium ${
                  language === 'hi'
                    ? 'bg-[#B84A00] text-white font-semibold shadow-xs'
                    : 'text-[#495057] hover:text-[#181A1B] hover:bg-[#E9ECEF]'
                }`}
              >
                हिन्दी
              </button>
              <span className="text-[#CFD6DE]">|</span>
              <button
                onClick={() => switchLanguage('pa')}
                className={`px-2 py-0.5 text-[11px] rounded-md transition font-medium ${
                  language === 'pa'
                    ? 'bg-[#B84A00] text-white font-semibold shadow-xs'
                    : 'text-[#495057] hover:text-[#181A1B] hover:bg-[#E9ECEF]'
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Institutional Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Emblem & Portal Authority Identity */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-11 h-11 rounded-md bg-[#F8F9FA] border border-[#DFE3E8] flex items-center justify-center text-[#B84A00] shadow-xs">
              <FileText className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-sans font-bold tracking-tight text-[#181A1B]">
                  {t('portalTitle')}
                </span>
                <span className="hidden sm:inline-block text-[10px] bg-[#F1F3F5] text-[#495057] border border-[#DFE3E8] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider tabular-nums">
                  Gazette Portal
                </span>
              </div>
              <p className="text-[11px] text-[#495057] font-medium tracking-normal mt-0.5">
                {t('portalSubtitle')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5 font-medium text-xs">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-md transition ${
                isActive('/')
                  ? 'text-[#B84A00] bg-[#FDF6F0] border border-[#F5D0B5] font-bold'
                  : 'text-[#495057] hover:text-[#181A1B] hover:bg-[#F1F3F5]'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/orders"
              className={`px-3.5 py-1.5 rounded-md transition ${
                isActive('/orders')
                  ? 'text-[#B84A00] bg-[#FDF6F0] border border-[#F5D0B5] font-bold'
                  : 'text-[#495057] hover:text-[#181A1B] hover:bg-[#F1F3F5]'
              }`}
            >
              {t('allOrders')}
            </Link>
            <Link
              to="/orders?department=Higher%20Education"
              className="px-3.5 py-1.5 rounded-md text-[#495057] hover:text-[#181A1B] hover:bg-[#F1F3F5] transition"
            >
              {t('departments')}
            </Link>
          </nav>

          {/* Right Action Items: Real-Time Alerts & Admin */}
          <div className="flex items-center space-x-3">
            {/* Real-Time Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-md text-[#495057] hover:text-[#181A1B] hover:bg-[#F1F3F5] border border-transparent hover:border-[#DFE3E8] transition focus:outline-none focus:ring-2 focus:ring-[#B84A00]/20"
                title={t('notifications')}
                aria-label={t('notifications')}
              >
                <Bell className="w-5 h-5 stroke-[1.8]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#B84A00] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-xs tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-md shadow-dropdown border border-[#DFE3E8] overflow-hidden z-50 animate-in fade-in duration-100">
                  <div className="bg-[#F1F3F5] text-[#181A1B] px-4 py-3 flex items-center justify-between border-b border-[#DFE3E8]">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-[#B84A00]" />
                      <span className="font-bold text-xs tracking-wider uppercase font-sans">
                        {t('notifications')}
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-[#B84A00] hover:text-[#9A3D00] font-semibold underline"
                      >
                        {t('markAllRead')}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-[#DFE3E8]">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-[#6C757D] text-xs">
                        <CheckCircle className="w-7 h-7 text-[#CFD6DE] mx-auto mb-2" />
                        <p>{t('noNotifications')}</p>
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setIsNotifOpen(false);
                            navigate(`/orders/${item.order._id}`);
                          }}
                          className={`p-3.5 hover:bg-[#F8F9FA] cursor-pointer transition ${
                            !item.read ? 'bg-[#FDF6F0]/60' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-mono font-bold text-[#181A1B] tabular-nums">
                              {item.order.orderNumber}
                            </span>
                            <span className="text-[10px] text-[#6C757D] tabular-nums">
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#181A1B] line-clamp-2">
                            {getLocalized(item.order.title)}
                          </p>
                          <span className="inline-block mt-1.5 text-[10px] bg-[#F1F3F5] text-[#495057] border border-[#DFE3E8] px-2 py-0.5 rounded-md font-medium">
                            {item.order.department}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Administrative Portal Action */}
            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-1.5 bg-[#181A1B] hover:bg-[#2C3034] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('dashboard')}</span>
              </Link>
            ) : (
              <Link
                to="/admin/login"
                className="flex items-center space-x-1.5 bg-white hover:bg-[#F1F3F5] text-[#181A1B] border border-[#DFE3E8] px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs transition"
              >
                <Shield className="w-3.5 h-3.5 text-[#B84A00]" />
                <span>{t('adminLogin')}</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-[#495057] hover:text-[#181A1B] hover:bg-[#F1F3F5]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[#DFE3E8] space-y-1.5">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-xs font-semibold ${
                isActive('/') ? 'bg-[#FDF6F0] text-[#B84A00]' : 'text-[#495057]'
              }`}
            >
              {t('home')}
            </Link>
            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-xs font-semibold ${
                isActive('/orders') ? 'bg-[#FDF6F0] text-[#B84A00]' : 'text-[#495057]'
              }`}
            >
              {t('allOrders')}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
