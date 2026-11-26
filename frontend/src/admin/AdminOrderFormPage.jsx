import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  createAdminOrder,
  updateAdminOrder,
  getAdminOrderById,
} from '../services/api';
import {
  FilePlus,
  Save,
  ArrowLeft,
  Upload,
  FileText,
  AlertCircle,
  Globe,
  Check,
} from 'lucide-react';

const DEPARTMENTS = [
  'Higher Education',
  'Health & Family Welfare',
  'Agriculture & Farmer Welfare',
  'Transport & Highways',
  'Information Technology',
  'Finance & Taxation',
  'Social Justice & Empowerment',
  'Personnel & Administrative Reforms',
  'Home Affairs & Law Enforcement',
  'Rural Development & Panchayats',
];

const CATEGORIES = [
  'Notification',
  'Scholarship',
  'Policy Order',
  'Circular',
  'Recruitment',
  'Tender',
  'Press Release',
];

const AdminOrderFormPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeLangTab, setActiveLangTab] = useState('en');

  const [orderNumber, setOrderNumber] = useState('');
  const [department, setDepartment] = useState('Higher Education');
  const [category, setCategory] = useState('Notification');
  const [publicationDate, setPublicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [status, setStatus] = useState('published');

  const [title, setTitle] = useState({ en: '', hi: '', pa: '' });
  const [description, setDescription] = useState({ en: '', hi: '', pa: '' });

  const [pdfFile, setPdfFile] = useState(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState('');
  const [existingPdfName, setExistingPdfName] = useState('');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      const loadOrder = async () => {
        try {
          const res = await getAdminOrderById(id);
          if (res.success && res.order) {
            const ord = res.order;
            setOrderNumber(ord.orderNumber);
            setDepartment(ord.department);
            setCategory(ord.category);
            setPublicationDate(
              new Date(ord.publicationDate).toISOString().split('T')[0]
            );
            setStatus(ord.status);
            setTitle(ord.title);
            setDescription(ord.description);
            setExistingPdfUrl(ord.pdfUrl);
            setExistingPdfName(ord.pdfOriginalName);
          }
        } catch (err) {
          setError('Failed to load order for editing.');
        } finally {
          setFetching(false);
        }
      };
      loadOrder();
    }
  }, [id, isEditing]);

  const handleTitleChange = (lang, val) => {
    setTitle((prev) => ({ ...prev, [lang]: val }));
  };

  const handleDescriptionChange = (lang, val) => {
    setDescription((prev) => ({ ...prev, [lang]: val }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF document.');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setError('PDF file size cannot exceed 15MB.');
        return;
      }
      setError(null);
      setPdfFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.en.trim() || !title.hi.trim() || !title.pa.trim()) {
      setError('Please provide the Order Title in all 3 languages (English, Hindi, Punjabi).');
      return;
    }

    if (!description.en.trim() || !description.hi.trim() || !description.pa.trim()) {
      setError('Please provide the Order Description in all 3 languages (English, Hindi, Punjabi).');
      return;
    }

    if (!orderNumber.trim()) {
      setError('Order Number is required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('orderNumber', orderNumber.trim().toUpperCase());
      formData.append('department', department);
      formData.append('category', category);
      formData.append('publicationDate', publicationDate);
      formData.append('status', status);

      formData.append('title', JSON.stringify(title));
      formData.append('description', JSON.stringify(description));

      if (pdfFile) {
        formData.append('pdf', pdfFile);
      }

      if (isEditing) {
        await updateAdminOrder(id, formData);
      } else {
        await createAdminOrder(formData);
      }

      navigate('/admin/orders');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#B84A00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#DFE3E8]">
        <Link
          to="/admin/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#181A1B] hover:text-[#B84A00] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders List</span>
        </Link>

        <h1 className="font-sans text-lg font-bold text-[#181A1B] tracking-tight">
          {isEditing ? `Edit Government Order: ${orderNumber}` : t('createNewOrder')}
        </h1>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-md border border-[#DFE3E8] shadow-xs p-5 sm:p-7 space-y-6">
        {/* Core Administrative Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 pb-5 border-b border-[#DFE3E8]">
          <div>
            <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
              Order Number *
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. GO-2026-ED-105"
              className="w-full p-2 rounded-md border border-[#DFE3E8] text-xs font-mono font-bold uppercase focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] focus:outline-none text-[#181A1B]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
              Department *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2 rounded-md border border-[#DFE3E8] text-xs font-medium focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] focus:outline-none text-[#181A1B] bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 rounded-md border border-[#DFE3E8] text-xs font-medium focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] focus:outline-none text-[#181A1B] bg-white"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
              Publication Date
            </label>
            <input
              type="date"
              value={publicationDate}
              onChange={(e) => setPublicationDate(e.target.value)}
              className="w-full p-1.5 rounded-md border border-[#DFE3E8] text-xs font-medium focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] focus:outline-none text-[#181A1B]"
            />
          </div>
        </div>

        {/* Multilingual Text Section */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#DFE3E8] pb-2">
            <div>
              <h3 className="text-xs font-bold text-[#181A1B] uppercase tracking-wider">
                Multilingual Content (Mandatory EN, HI, PA)
              </h3>
              <p className="text-[11px] text-[#6C757D]">
                Official title and directive description in English, Hindi, and Punjabi
              </p>
            </div>

            <div className="flex space-x-1 bg-[#F1F3F5] p-1 rounded-md border border-[#DFE3E8]">
              <button
                type="button"
                onClick={() => setActiveLangTab('en')}
                className={`px-3 py-1 text-xs rounded-md font-bold transition flex items-center space-x-1 ${
                  activeLangTab === 'en' ? 'bg-[#181A1B] text-white shadow-xs' : 'text-[#495057] hover:text-[#181A1B]'
                }`}
              >
                <span>English</span>
                {title.en && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('hi')}
                className={`px-3 py-1 text-xs rounded-md font-bold transition flex items-center space-x-1 ${
                  activeLangTab === 'hi' ? 'bg-[#181A1B] text-white shadow-xs' : 'text-[#495057] hover:text-[#181A1B]'
                }`}
              >
                <span>हिन्दी</span>
                {title.hi && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={() => setActiveLangTab('pa')}
                className={`px-3 py-1 text-xs rounded-md font-bold transition flex items-center space-x-1 ${
                  activeLangTab === 'pa' ? 'bg-[#181A1B] text-white shadow-xs' : 'text-[#495057] hover:text-[#181A1B]'
                }`}
              >
                <span>ਪੰਜਾਬੀ</span>
                {title.pa && <Check className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-4 rounded-md border border-[#DFE3E8] space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                Order Title ({activeLangTab.toUpperCase()}) *
              </label>
              <input
                type="text"
                required
                value={title[activeLangTab]}
                onChange={(e) => handleTitleChange(activeLangTab, e.target.value)}
                placeholder="Enter translated title..."
                className="w-full p-2 rounded-md border border-[#DFE3E8] text-xs text-[#181A1B] font-semibold focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] focus:outline-none bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider mb-1">
                Order Description & Directive ({activeLangTab.toUpperCase()}) *
              </label>
              <textarea
                rows={4}
                required
                value={description[activeLangTab]}
                onChange={(e) => handleDescriptionChange(activeLangTab, e.target.value)}
                placeholder="Enter detailed directive and guidelines..."
                className="w-full p-2 rounded-md border border-[#DFE3E8] text-xs text-[#181A1B] leading-relaxed focus:ring-1 focus:ring-[#B84A00] focus:border-[#B84A00] focus:outline-none bg-white font-normal"
              />
            </div>
          </div>
        </div>

        {/* PDF File Upload */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider">
            {t('uploadPdfLabel')}
          </label>
          <div className="border border-dashed border-[#DFE3E8] hover:border-[#CFD6DE] rounded-md p-5 text-center bg-[#F8F9FA] transition">
            <Upload className="w-6 h-6 text-[#6C757D] mx-auto mb-1.5" />
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              className="text-xs text-[#495057] file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#181A1B] file:text-white hover:file:bg-[#2C3034] cursor-pointer"
            />
            <p className="text-[10px] text-[#6C757D] mt-1.5">
              {t('uploadPdfHelp')}
            </p>

            {pdfFile ? (
              <div className="mt-2.5 p-1.5 bg-[#ECFDF5] text-[#166534] rounded-md text-xs font-bold inline-flex items-center gap-1.5 border border-[#A7F3D0]">
                <FileText className="w-3.5 h-3.5" />
                <span>Selected: {pdfFile.name} ({Math.round(pdfFile.size / 1024)} KB)</span>
              </div>
            ) : existingPdfUrl ? (
              <div className="mt-2.5 p-1.5 bg-[#F1F3F5] text-[#181A1B] rounded-md text-xs font-bold inline-flex items-center gap-1.5 border border-[#DFE3E8]">
                <FileText className="w-3.5 h-3.5" />
                <span>Current Document: {existingPdfName || 'Official_Document.pdf'}</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Publication Control & Submit */}
        <div className="pt-4 border-t border-[#DFE3E8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-[#181A1B] uppercase tracking-wider">
              Publication Mode
            </label>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="text-[#166534] focus:ring-[#166534]"
                />
                <span className="text-[#166534]">{t('statusPublishNow')}</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="text-[#854D0E] focus:ring-[#854D0E]"
                />
                <span className="text-[#854D0E]">{t('statusDraft')}</span>
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/admin/orders')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-md border border-[#DFE3E8] text-xs font-bold text-[#495057] hover:bg-[#F1F3F5] transition shadow-xs"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-none bg-[#B84A00] hover:bg-[#9A3D00] text-white px-5 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center space-x-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span>{loading ? t('updatingOrderBtn') : t('saveOrderBtn')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminOrderFormPage;
