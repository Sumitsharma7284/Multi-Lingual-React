import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getAdminOrders, toggleAdminOrderStatus, deleteAdminOrder } from '../services/api';
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Download,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const AdminOrdersListPage = () => {
  const { t } = useLanguage();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [togglingId, setTogglingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search: search.trim(),
        status,
      };
      const res = await getAdminOrders(params);
      if (res.success) {
        setOrders(res.orders);
        setTotalPages(res.totalPages);
        setTotalOrders(res.totalOrders);
      }
    } catch (err) {
      console.error('Failed to load admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    try {
      await toggleAdminOrderStatus(id);
      await fetchOrders();
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAdminOrder(id);
      setDeleteConfirmId(null);
      await fetchOrders();
    } catch (err) {
      alert('Error deleting order: ' + err.message);
    }
  };

  const getPdfFullUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.PROD
      ? window.location.origin
      : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    return `${base}${url}`;
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#DFE3E8]">
        <div>
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-[#181A1B] tracking-tight">
            {t('manageOrders')}
          </h1>
          <p className="text-xs text-[#495057] mt-0.5">
            Complete registry of government orders: draft, review, publish, update, and manage PDF records
          </p>
        </div>

        <Link
          to="/admin/orders/new"
          className="inline-flex items-center space-x-1.5 bg-[#B84A00] hover:bg-[#9A3D00] text-white px-3.5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition shadow-xs"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t('publishNewOrder')}</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-md border border-[#DFE3E8] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#6C757D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order Number or keywords..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-[#DFE3E8] text-xs text-[#181A1B] placeholder-[#6C757D] focus:outline-none focus:ring-1 focus:ring-[#B84A00]"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-[11px] font-bold text-[#6C757D] uppercase">{t('tableStatus')}:</span>
          <div className="flex rounded-md border border-[#DFE3E8] overflow-hidden text-xs">
            {['all', 'published', 'draft'].map((s) => (
              <button
                key={s}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`px-3 py-1 font-bold uppercase text-[10px] transition ${
                  status === s ? 'bg-[#181A1B] text-white' : 'bg-white text-[#495057] hover:bg-[#F1F3F5]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Management Table */}
      <div className="bg-white rounded-md border border-[#DFE3E8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F1F3F5] text-[#181A1B] uppercase font-bold border-b border-[#DFE3E8]">
              <tr>
                <th className="py-2.5 px-3.5">{t('tableOrderNo')}</th>
                <th className="py-2.5 px-3.5">{t('tableTitle')}</th>
                <th className="py-2.5 px-3.5">{t('tableDepartment')}</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">{t('tableDate')}</th>
                <th className="py-2.5 px-3.5">{t('tableStatus')}</th>
                <th className="py-2.5 px-3.5 text-center">PDF</th>
                <th className="py-2.5 px-3.5 text-right">{t('tableActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFE3E8] font-medium">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-[#6C757D]">
                    Loading administrative orders...
                  </td>
                </tr>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-[#F8F9FA] transition">
                    <td className="py-3 px-3.5 font-mono font-bold text-[#181A1B] whitespace-nowrap tabular-nums">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3 px-3.5 max-w-xs">
                      <p className="font-bold text-[#181A1B] truncate">
                        {ord.title.en}
                      </p>
                      <div className="flex space-x-1 mt-0.5">
                        <span className="text-[9px] bg-[#F1F3F5] text-[#495057] border border-[#DFE3E8] px-1 rounded-md font-bold">HI</span>
                        <span className="text-[9px] bg-[#F1F3F5] text-[#495057] border border-[#DFE3E8] px-1 rounded-md font-bold">PA</span>
                      </div>
                    </td>

                    <td className="py-3 px-3.5 text-[#495057] whitespace-nowrap">
                      {ord.department}
                    </td>

                    <td className="py-3 px-3.5 text-[#495057] whitespace-nowrap">
                      <span className="bg-[#F1F3F5] text-[#181A1B] border border-[#DFE3E8] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {ord.category}
                      </span>
                    </td>

                    <td className="py-3 px-3.5 text-[#6C757D] whitespace-nowrap font-mono text-[11px] tabular-nums">
                      {new Date(ord.publicationDate).toLocaleDateString('en-IN')}
                    </td>

                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(ord._id)}
                        disabled={togglingId === ord._id}
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition ${
                          ord.status === 'published'
                            ? 'bg-[#ECFDF5] text-[#166534] border border-[#A7F3D0]'
                            : 'bg-[#FEFCE8] text-[#854D0E] border border-[#FEF08A]'
                        }`}
                        title="Click to toggle status"
                      >
                        {ord.status}
                      </button>
                    </td>

                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      {ord.pdfUrl ? (
                        <a
                          href={getPdfFullUrl(ord.pdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block text-[#181A1B] hover:text-[#B84A00] p-1"
                          title="View PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-[#B84A00]" />
                        </a>
                      ) : (
                        <span className="text-[#CFD6DE]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3.5 text-right whitespace-nowrap space-x-1.5">
                      <Link
                        to={`/orders/${ord._id}`}
                        target="_blank"
                        className="inline-block p-1 text-[#6C757D] hover:text-[#181A1B]"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <Link
                        to={`/admin/orders/edit/${ord._id}`}
                        className="inline-block p-1 text-[#2B4C6F] hover:text-[#181A1B]"
                        title={t('actionEdit')}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => setDeleteConfirmId(ord._id)}
                        className="inline-block p-1 text-red-600 hover:text-red-800"
                        title={t('actionDelete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-[#6C757D]">
                    No orders match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-[#DFE3E8] flex items-center justify-between">
            <span className="text-[11px] text-[#6C757D] tabular-nums">
              Page {page} of {totalPages} ({totalOrders} orders)
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1 rounded-md border border-[#DFE3E8] text-[#495057] hover:bg-[#F1F3F5] disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1 rounded-md border border-[#DFE3E8] text-[#495057] hover:bg-[#F1F3F5] disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-md max-w-sm w-full p-5 space-y-3 shadow-dropdown border border-[#DFE3E8]">
            <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-sans text-sm font-bold text-[#181A1B]">
                Confirm Deletion
              </h3>
              <p className="text-xs text-[#495057] mt-0.5">
                {t('deleteConfirm')}
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-1.5 rounded-md border border-[#DFE3E8] text-xs font-semibold text-[#495057] hover:bg-[#F1F3F5]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersListPage;
