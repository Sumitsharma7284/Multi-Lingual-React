import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { getPublicOrders } from '../services/api';
import OrderCard from '../components/OrderCard';
import {
  Search,
  FileText,
  ShieldCheck,
  Building,
  ArrowRight,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

const departmentsList = [
  { name: 'Higher Education', code: 'HE', count: 'Scholarships & State Universities' },
  { name: 'Health & Family Welfare', code: 'HL', count: 'Diagnostics & Essential Medicines' },
  { name: 'Agriculture & Farmer Welfare', code: 'AG', count: 'Irrigation & Agricultural Subsidies' },
  { name: 'Transport & Highways', code: 'TR', count: 'Electric Transit & Fleet Directives' },
  { name: 'Information Technology', code: 'IT', count: 'Broadband Infrastructure & E-Governance' },
  { name: 'Finance & Taxation', code: 'FN', count: 'Commercial Revenue & Amnesties' },
];

const HomePage = () => {
  const { t, language } = useLanguage();
  const { notifications } = useSocket();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [latestOrders, setLatestOrders] = useState([]);
  const [totalPublished, setTotalPublished] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await getPublicOrders({ page: 1, limit: 6, sortBy: 'publicationDate', sortOrder: 'desc' });
      if (res.success) {
        setLatestOrders(res.orders);
        setTotalPublished(res.totalOrders);
      }
    } catch (err) {
      console.error('Failed to load home page orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchOrders();
    }
  }, [notifications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/orders');
    }
  };

  return (
    <div className="space-y-14 pb-16">
      {/* 1. Official Institutional Hero Section */}
      <section className="bg-white border-b border-[#DFE3E8] pt-12 pb-16 px-4 sm:px-8 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center space-x-2 bg-[#F1F3F5] px-3.5 py-1 rounded-md border border-[#DFE3E8] text-[#181A1B] text-[11px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
            <span>Official Gazette Information System</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-[#181A1B] max-w-4xl mx-auto leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-[#495057] max-w-2xl mx-auto font-normal leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Institutional Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-1.5 rounded-md shadow-xs flex flex-col sm:flex-row items-center gap-2 border border-[#DFE3E8]"
          >
            <div className="flex-1 flex items-center px-3 w-full">
              <Search className="w-4 h-4 text-[#6C757D] mr-2.5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full text-[#181A1B] placeholder-[#6C757D] text-xs sm:text-sm focus:outline-none py-2 font-sans"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#B84A00] hover:bg-[#9A3D00] text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider transition shrink-0 shadow-xs"
            >
              {t('searchButton')}
            </button>
          </form>

          {/* Metrics Counter Strip */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="bg-[#F1F3F5] rounded-md p-3.5 border border-[#DFE3E8] text-center shadow-xs">
              <div className="text-2xl font-bold text-[#181A1B] font-mono tabular-nums">
                {totalPublished || '8'}
              </div>
              <div className="text-[11px] text-[#495057] uppercase tracking-wider font-semibold mt-0.5">
                {t('quickStatsOrders')}
              </div>
            </div>

            <div className="bg-[#F1F3F5] rounded-md p-3.5 border border-[#DFE3E8] text-center shadow-xs">
              <div className="text-2xl font-bold text-[#181A1B] font-mono tabular-nums">
                12+
              </div>
              <div className="text-[11px] text-[#495057] uppercase tracking-wider font-semibold mt-0.5">
                {t('quickStatsDepartments')}
              </div>
            </div>

            <div className="bg-[#F1F3F5] rounded-md p-3.5 border border-[#DFE3E8] text-center shadow-xs">
              <div className="text-2xl font-bold text-[#181A1B] font-mono tabular-nums">
                3
              </div>
              <div className="text-[11px] text-[#495057] uppercase tracking-wider font-semibold mt-0.5">
                Languages (EN, HI, PA)
              </div>
            </div>

            <div className="bg-[#F1F3F5] rounded-md p-3.5 border border-[#DFE3E8] text-center shadow-xs">
              <div className="text-2xl font-bold text-[#166534] font-mono flex items-center justify-center gap-1.5 tabular-nums">
                <span className="w-2 h-2 rounded-full bg-[#166534]"></span>
                <span>Active</span>
              </div>
              <div className="text-[11px] text-[#495057] uppercase tracking-wider font-semibold mt-0.5">
                {t('quickStatsRealtime')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Latest Published Government Orders */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#DFE3E8] gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-[#B84A00] rounded-sm"></span>
              <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#181A1B]">
                {t('latestOrdersTitle')}
              </h2>
            </div>
            <p className="text-xs text-[#495057] mt-0.5">
              Authentic gazette notifications, circulars, and departmental orders published for public record
            </p>
          </div>

          <Link
            to="/orders"
            className="inline-flex items-center space-x-1.5 bg-[#181A1B] text-white hover:bg-[#2C3034] px-3.5 py-2 rounded-md text-xs font-bold transition shadow-xs"
          >
            <span>{t('viewAllOrdersBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        {/* Orders Cards Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-md border border-[#DFE3E8] p-5 space-y-3 shadow-xs">
                  <div className="h-4 bg-[#F1F3F5] rounded-md w-1/3"></div>
                  <div className="h-5 bg-[#F1F3F5] rounded-md w-3/4"></div>
                  <div className="h-14 bg-[#F8F9FA] rounded-md"></div>
                  <div className="h-7 bg-[#F1F3F5] rounded-md w-1/2"></div>
                </div>
              ))}
            </div>
          ) : latestOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestOrders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-md border border-dashed border-[#DFE3E8]">
              <FileText className="w-10 h-10 text-[#CFD6DE] mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#495057]">{t('noOrdersFound')}</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Explore by Government Department */}
      <section id="departments" className="max-w-7xl mx-auto px-4 sm:px-8 scroll-mt-24">
        <div className="mb-5 pb-3 border-b border-[#DFE3E8]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-[#181A1B] rounded-sm"></span>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-[#181A1B]">
              Government Departments & Portfolios
            </h2>
          </div>
          <p className="text-xs text-[#495057] mt-0.5">
            Direct access to official announcements categorized by administrative ministries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departmentsList.map((dept, index) => (
            <Link
              key={index}
              to={`/orders?department=${encodeURIComponent(dept.name)}`}
              className="bg-white p-4 rounded-md border border-[#DFE3E8] hover:border-[#CFD6DE] hover:shadow-cardHover transition flex items-center space-x-3.5 group shadow-xs"
            >
              <div className="w-10 h-10 rounded-md bg-[#F1F3F5] text-[#181A1B] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#DFE3E8]">
                {dept.code}
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-xs font-bold text-[#181A1B] group-hover:text-[#B84A00] truncate transition">
                  {dept.name}
                </h4>
                <p className="text-[11px] text-[#6C757D] truncate mt-0.5">
                  {dept.count}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#CFD6DE] group-hover:text-[#B84A00] transition shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Institutional Standards & Authenticity Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white border border-[#DFE3E8] rounded-md p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center shadow-xs">
          <div className="space-y-2 md:col-span-2">
            <div className="inline-flex items-center space-x-1.5 text-[#495057] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#166534]" />
              <span>Official Government Dissemination Standard</span>
            </div>
            <h3 className="font-sans text-lg sm:text-xl font-bold text-[#181A1B]">
              Authenticated Gazette Notifications for Public Awareness
            </h3>
            <p className="text-xs text-[#495057] leading-relaxed max-w-xl">
              All government orders published through e-RajPatra bear an authentic serial order identifier, executive departmental categorization, and downloadable PDF documents translated in English, Hindi, and Punjabi.
            </p>
          </div>

          <div className="bg-[#F1F3F5] rounded-md border border-[#DFE3E8] p-4 space-y-2.5 text-xs text-[#181A1B] shadow-xs">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0" />
              <span>Verified PDF document downloads</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0" />
              <span>Real-time WebSocket notification pipeline</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#166534] shrink-0" />
              <span>GIGW compliant multilingual indexing</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
