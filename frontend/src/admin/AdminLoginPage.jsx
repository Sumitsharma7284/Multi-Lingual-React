import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, FileText } from 'lucide-react';

const AdminLoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@rajpatra.gov.in');
    setPassword('Admin@12345');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Tricolor Strip */}
      <div className="fixed top-0 left-0 right-0 tricolor-stripe" />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 rounded-md bg-white border border-[#DFE3E8] text-[#B84A00] flex items-center justify-center mx-auto shadow-xs">
          <FileText className="w-6 h-6 stroke-[2]" />
        </div>
        <h2 className="font-sans text-2xl font-bold text-[#181A1B] tracking-tight">
          {t('adminPortalTitle')}
        </h2>
        <p className="text-xs text-[#495057]">
          {t('adminPortalSubtitle')}
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-7 px-6 shadow-card rounded-md sm:px-8 border border-[#DFE3E8] space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@rajpatra.gov.in"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-[#DFE3E8] text-xs text-[#181A1B] placeholder-[#6C757D] focus:outline-none focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-[#DFE3E8] text-xs text-[#181A1B] placeholder-[#6C757D] focus:outline-none focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#B84A00] hover:bg-[#9A3D00] text-white py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <span>{loading ? t('signingIn') : t('signInBtn')}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* College Demo Credentials Helper */}
          <div className="bg-[#F1F3F5] border border-[#DFE3E8] rounded-md p-3 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase text-[#495057] text-[10px]">
                Evaluation Credentials:
              </span>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-[11px] font-bold text-[#B84A00] underline hover:text-[#9A3D00]"
              >
                Auto-fill
              </button>
            </div>
            <p className="font-mono text-[11px] text-[#181A1B] bg-white p-2 rounded-md border border-[#DFE3E8] tabular-nums">
              admin@rajpatra.gov.in / Admin@12345
            </p>
          </div>

          <div className="text-center pt-1">
            <Link to="/" className="text-xs text-[#6C757D] hover:text-[#181A1B] font-medium">
              ← Return to Citizen Public Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
