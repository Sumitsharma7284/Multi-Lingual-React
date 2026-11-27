import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { getPublicOrders, getDepartments, getCategories } from '../services/api';
import OrderCard from '../components/OrderCard';
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  Building,
  Tag,
  FileText,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

const OrdersListPage = () => {
  const { t } = useLanguage();
  const { notifications } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
  const [sortBy, setSortBy] = useState('publicationDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync state when URL search parameters change (e.g., clicking navbar or external links)
  useEffect(() => {
    const deptParam = searchParams.get('department') || 'all';
    const catParam = searchParams.get('category') || 'all';
    const searchParam = searchParams.get('search') || '';
    const startParam = searchParams.get('startDate') || '';
    const endParam = searchParams.get('endDate') || '';

    setDepartment(deptParam);
    setCategory(catParam);
    setSearch(searchParam);
    setStartDate(startParam);
    setEndDate(endParam);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [deptRes, catRes] = await Promise.all([getDepartments(), getCategories()]);
        if (deptRes.success) setDepartmentsList(deptRes.departments);
        if (catRes.success) setCategoriesList(catRes.categories);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
        sortBy,
        sortOrder,
      };

      if (search.trim()) params.search = search.trim();
      if (department && department !== 'all') params.department = department;
      if (category && category !== 'all') params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getPublicOrders(params);
      if (res.success) {
        setOrders(res.orders);
        setTotalOrders(res.totalOrders);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to retrieve orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, department, category, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    if (notifications.length > 0) {
      fetchOrders();
    }
  }, [notifications]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDepartment('all');
    setCategory('all');
    setStartDate('');
    setEndDate('');
    setSortBy('publicationDate');
    setSortOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Official Directory Header */}
      <div className="bg-white text-[#181A1B] rounded-md p-6 sm:p-7 shadow-xs border border-[#DFE3E8]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#181A1B]">
              {t('allOrders')}
            </h1>
            <p className="text-xs text-[#495057] mt-1 max-w-2xl font-normal leading-relaxed">
              Official catalog of administrative orders, circulars, statutory notifications, and gazette records.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-[#F1F3F5] px-3.5 py-1.5 rounded-md border border-[#DFE3E8] text-xs font-semibold tabular-nums text-[#181A1B]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#B84A00]" />
            <span>
              {totalOrders} {t('resultsFound')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white rounded-md border border-[#DFE3E8] shadow-xs p-5 sm:p-6 space-y-4">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full pl-9 pr-3 py-2 rounded-md border border-[#DFE3E8] text-xs focus:outline-none focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] text-[#181A1B] placeholder-[#6C757D]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#B84A00] hover:bg-[#9A3D00] text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs"
            >
              {t('searchButton')}
            </button>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-1">
            {/* Department */}
            <div>
              <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                {t('filterByDepartment')}
              </label>
              <select
                value={department}
                onChange={(e) => {
                  const val = e.target.value;
                  setDepartment(val);
                  setPage(1);
                  const p = new URLSearchParams(searchParams);
                  if (val && val !== 'all') {
                    p.set('department', val);
                  } else {
                    p.delete('department');
                  }
                  setSearchParams(p);
                }}
                className="w-full p-2 text-xs rounded-md border border-[#DFE3E8] bg-white text-[#181A1B] focus:outline-none focus:ring-1 focus:ring-[#B84A00]"
              >
                <option value="all">{t('allDepartments')}</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                {t('filterByCategory')}
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const val = e.target.value;
                  setCategory(val);
                  setPage(1);
                  const p = new URLSearchParams(searchParams);
                  if (val && val !== 'all') {
                    p.set('category', val);
                  } else {
                    p.delete('category');
                  }
                  setSearchParams(p);
                }}
                className="w-full p-2 text-xs rounded-md border border-[#DFE3E8] bg-white text-[#181A1B] focus:outline-none focus:ring-1 focus:ring-[#B84A00]"
              >
                <option value="all">{t('allCategories')}</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                {t('dateFrom')}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full p-1.5 text-xs rounded-md border border-[#DFE3E8] text-[#181A1B] focus:outline-none focus:ring-1 focus:ring-[#B84A00]"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                {t('dateTo')}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full p-1.5 text-xs rounded-md border border-[#DFE3E8] text-[#181A1B] focus:outline-none focus:ring-1 focus:ring-[#B84A00]"
              />
            </div>
          </div>

          {/* Sorter and Reset */}
          <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#DFE3E8] text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-[#495057] font-medium">{t('sortBy')}:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [sb, so] = e.target.value.split('-');
                  setSortBy(sb);
                  setSortOrder(so);
                }}
                className="text-xs bg-[#F1F3F5] border border-[#DFE3E8] rounded-md px-2 py-1 font-semibold text-[#181A1B] focus:outline-none"
              >
                <option value="publicationDate-desc">{t('newestFirst')}</option>
                <option value="publicationDate-asc">{t('oldestFirst')}</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center space-x-1 text-xs text-red-700 hover:text-red-900 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('resetFilters')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Orders Grid */}
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
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-md border border-dashed border-[#DFE3E8]">
          <FileText className="w-10 h-10 text-[#CFD6DE] mx-auto mb-2" />
          <h3 className="font-sans text-sm font-bold text-[#181A1B]">{t('noOrdersFound')}</h3>
          <p className="text-xs text-[#495057] mt-1 max-w-sm mx-auto leading-relaxed">
            Try adjusting your search query, selecting different departments, or resetting filter options.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-3.5 bg-[#181A1B] hover:bg-[#2C3034] text-white px-3.5 py-1.5 rounded-md text-xs font-semibold shadow-xs"
          >
            {t('resetFilters')}
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-1.5 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-1.5 rounded-md border border-[#DFE3E8] bg-white text-[#495057] hover:bg-[#F1F3F5] disabled:opacity-40 shadow-xs"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-md text-xs font-bold transition tabular-nums shadow-xs ${
                page === p
                  ? 'bg-[#181A1B] text-white'
                  : 'bg-white border border-[#DFE3E8] text-[#495057] hover:bg-[#F1F3F5]'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="p-1.5 rounded-md border border-[#DFE3E8] bg-white text-[#495057] hover:bg-[#F1F3F5] disabled:opacity-40 shadow-xs"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersListPage;
