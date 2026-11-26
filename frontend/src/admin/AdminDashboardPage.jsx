import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getAdminStats, toggleAdminOrderStatus } from '../services/api';
import {
  Files,
  FileCheck2,
  FileClock,
  Building2,
  PlusCircle,
  ArrowUpRight,
  RefreshCw,
  CheckCircle,
  Clock,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { t, getLocalized } = useLanguage();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      await toggleAdminOrderStatus(id);
      await fetchStats();
    } catch (err) {
      alert('Could not update status: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#B84A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE3E8]">
        <div>
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-[#181A1B] tracking-tight">
            Administrative Overview
          </h1>
          <p className="text-xs text-[#495057] mt-0.5">
            Real-time status of published gazettes, draft reviews, and departmental distributions
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchStats}
            className="p-2 bg-white border border-[#DFE3E8] rounded-md text-[#495057] hover:text-[#181A1B] hover:bg-[#F1F3F5] transition shadow-xs"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <Link
            to="/admin/orders/new"
            className="inline-flex items-center space-x-1.5 bg-[#B84A00] hover:bg-[#9A3D00] text-white px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('publishNewOrder')}</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid with Left Accent Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-md border border-[#DFE3E8] border-l-4 border-l-[#181A1B] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              {t('totalOrdersMetric')}
            </p>
            <h3 className="text-2xl font-bold text-[#181A1B] mt-0.5 font-mono tabular-nums">
              {stats?.totalOrders || 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#F1F3F5] text-[#181A1B] flex items-center justify-center border border-[#DFE3E8]">
            <Files className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Published */}
        <div className="bg-white p-5 rounded-md border border-[#DFE3E8] border-l-4 border-l-[#166534] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              {t('publishedMetric')}
            </p>
            <h3 className="text-2xl font-bold text-[#166534] mt-0.5 font-mono tabular-nums">
              {stats?.publishedOrders || 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#ECFDF5] text-[#166534] flex items-center justify-center border border-[#A7F3D0]">
            <FileCheck2 className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white p-5 rounded-md border border-[#DFE3E8] border-l-4 border-l-[#854D0E] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              {t('draftsMetric')}
            </p>
            <h3 className="text-2xl font-bold text-[#854D0E] mt-0.5 font-mono tabular-nums">
              {stats?.draftOrders || 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#FEFCE8] text-[#854D0E] flex items-center justify-center border border-[#FEF08A]">
            <FileClock className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>

        {/* Active Portfolios */}
        <div className="bg-white p-5 rounded-md border border-[#DFE3E8] border-l-4 border-l-[#B84A00] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider">
              Active Portfolios
            </p>
            <h3 className="text-2xl font-bold text-[#B84A00] mt-0.5 font-mono tabular-nums">
              {stats?.departmentBreakdown?.length || 0}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#FDF6F0] text-[#B84A00] flex items-center justify-center border border-[#F5D0B5]">
            <Building2 className="w-5 h-5 stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* Recent Orders Table & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-md border border-[#DFE3E8] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DFE3E8]">
            <h3 className="font-sans text-sm font-bold text-[#181A1B]">
              Recent Publications & Submissions
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#B84A00] hover:text-[#9A3D00] flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F3F5] text-[#181A1B] uppercase font-bold border-b border-[#DFE3E8]">
                <tr>
                  <th className="py-2.5 px-3">Order No</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DFE3E8] font-medium">
                {stats?.recentOrders?.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#181A1B] tabular-nums">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3 text-[#181A1B] max-w-xs truncate">
                      {getLocalized(ord.title)}
                    </td>
                    <td className="py-3 px-3 text-[#495057] truncate">
                      {ord.department}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          ord.status === 'published'
                            ? 'bg-[#ECFDF5] text-[#166534] border border-[#A7F3D0]'
                            : 'bg-[#FEFCE8] text-[#854D0E] border border-[#FEF08A]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleToggle(ord._id)}
                        disabled={togglingId === ord._id}
                        className="text-[11px] font-bold text-[#B84A00] hover:text-[#9A3D00] hover:underline disabled:opacity-50"
                      >
                        {ord.status === 'published' ? 'Unpublish' : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-md border border-[#DFE3E8] shadow-xs p-5 space-y-3">
          <h3 className="font-sans text-sm font-bold text-[#181A1B] pb-2 border-b border-[#DFE3E8]">
            Orders by Department
          </h3>
          <div className="space-y-2">
            {stats?.departmentBreakdown?.map((dept) => (
              <div key={dept._id} className="flex items-center justify-between text-xs py-1.5 border-b border-[#F1F3F5]">
                <span className="font-medium text-[#181A1B] truncate pr-2">
                  {dept._id}
                </span>
                <span className="bg-[#F1F3F5] text-[#181A1B] border border-[#DFE3E8] font-mono font-bold px-2 py-0.5 rounded-md text-[11px] tabular-nums">
                  {dept.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
