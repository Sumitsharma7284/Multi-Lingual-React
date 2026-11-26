import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  FilePlus2,
  Files,
  LogOut,
  ExternalLink,
  Shield,
  User,
  Building2,
  FileText,
} from 'lucide-react';

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Top National Tricolor Stripe */}
      <div className="tricolor-stripe" />

      <div className="flex-1 flex">
        {/* Institutional Admin Sidebar */}
        <aside className="w-64 bg-white text-[#495057] flex flex-col shrink-0 border-r border-[#DFE3E8]">
          {/* Brand */}
          <div className="p-5 border-b border-[#DFE3E8] flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-[#F8F9FA] border border-[#DFE3E8] flex items-center justify-center text-[#B84A00] shadow-xs">
              <Shield className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="font-sans font-bold text-base tracking-tight text-[#181A1B]">
                e-RajPatra
              </h2>
              <p className="text-[10px] text-[#6C757D] font-bold uppercase tracking-wider">
                Administration Portal
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 flex-1">
            <Link
              to="/admin/dashboard"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-semibold transition ${
                isActive('/admin/dashboard')
                  ? 'bg-[#FDF6F0] text-[#B84A00] border-l-4 border-l-[#B84A00] font-bold shadow-xs'
                  : 'text-[#495057] hover:bg-[#F1F3F5] hover:text-[#181A1B]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('dashboard')}</span>
            </Link>

            <Link
              to="/admin/orders"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-semibold transition ${
                isActive('/admin/orders')
                  ? 'bg-[#FDF6F0] text-[#B84A00] border-l-4 border-l-[#B84A00] font-bold shadow-xs'
                  : 'text-[#495057] hover:bg-[#F1F3F5] hover:text-[#181A1B]'
              }`}
            >
              <Files className="w-4 h-4" />
              <span>{t('manageOrders')}</span>
            </Link>

            <Link
              to="/admin/orders/new"
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-semibold transition ${
                isActive('/admin/orders/new')
                  ? 'bg-[#FDF6F0] text-[#B84A00] border-l-4 border-l-[#B84A00] font-bold shadow-xs'
                  : 'text-[#495057] hover:bg-[#F1F3F5] hover:text-[#181A1B]'
              }`}
            >
              <FilePlus2 className="w-4 h-4" />
              <span>{t('publishNewOrder')}</span>
            </Link>

            <div className="pt-3 mt-3 border-t border-[#DFE3E8]">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-[#495057] hover:bg-[#F1F3F5] hover:text-[#181A1B] transition"
              >
                <div className="flex items-center space-x-2.5">
                  <ExternalLink className="w-4 h-4 text-[#6C757D]" />
                  <span>View Citizen Portal</span>
                </div>
              </Link>
            </div>
          </nav>

          {/* User Card & Logout */}
          <div className="p-3 border-t border-[#DFE3E8] bg-[#F1F3F5]">
            <div className="flex items-center space-x-2.5 mb-2.5">
              <div className="w-7 h-7 rounded-md bg-white flex items-center justify-center text-[#181A1B] text-xs font-bold uppercase border border-[#DFE3E8] shadow-xs">
                {admin?.name ? admin.name.charAt(0) : 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-[#181A1B] truncate">{admin?.name || 'Administrator'}</p>
                <p className="text-[10px] text-[#6C757D] truncate">{admin?.email || 'admin@rajpatra.gov.in'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-1.5 bg-white hover:bg-red-50 text-[#495057] hover:text-red-700 border border-[#DFE3E8] hover:border-red-300 py-1.5 rounded-md text-xs font-semibold shadow-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </aside>

        {/* Main Admin Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <header className="bg-white border-b border-[#DFE3E8] px-6 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
              <span className="text-xs font-bold text-[#181A1B] uppercase tracking-wider font-sans">
                Official Administration Gateway Active
              </span>
            </div>
            <div className="text-xs text-[#6C757D] font-medium tabular-nums">
              Date: {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          </header>

          <main className="p-6 sm:p-8 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
