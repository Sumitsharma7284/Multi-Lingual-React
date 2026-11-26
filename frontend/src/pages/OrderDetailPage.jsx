import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPublicOrderById, summarizeOrder } from '../services/api';
import {
  FileText,
  Download,
  Calendar,
  Building,
  Tag,
  ArrowLeft,
  Share2,
  Printer,
  Check,
  ShieldCheck,
  ExternalLink,
  Bot,
  Loader2,
  X,
  RotateCcw,
} from 'lucide-react';

const OrderDetailPage = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeLangTab, setActiveLangTab] = useState(language);

  // AI Plain-Language Summary State
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [aiSummaries, setAiSummaries] = useState({}); // { [lang]: string[] }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPublicOrderById(id);
        if (res.success && res.order) {
          setOrder(res.order);
        } else {
          setError(res.message || 'Record could not be retrieved.');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load official gazette record.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  useEffect(() => {
    setActiveLangTab(language);
  }, [language]);

  const getPdfFullUrl = (url) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const base = import.meta.env.PROD
      ? window.location.origin
      : (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    return `${base}${url}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: order?.title?.[activeLangTab] || order?.title?.en || 'Official Gazette Order',
          url: window.location.href,
        });
      } catch (err) {
        // User dismissed share
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const fetchSummaryForLang = async (lang, force = false) => {
    if ((!force && aiSummaries[lang]) || !order) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const activeTitle = order.title[lang] || order.title.en;
      const activeDesc = order.description[lang] || order.description.en;
      const res = await summarizeOrder({
        title: activeTitle,
        description: activeDesc,
        language: lang,
      });
      if (res.success && Array.isArray(res.bullets)) {
        setAiSummaries((prev) => ({ ...prev, [lang]: res.bullets }));
      } else {
        setAiError(res.message || 'AI summary unavailable.');
      }
    } catch (err) {
      setAiError(err.response?.data?.message || 'Unable to connect to AI summary service. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleAiSummary = () => {
    if (!showAiSummary) {
      setShowAiSummary(true);
      if (!aiSummaries[activeLangTab]) {
        fetchSummaryForLang(activeLangTab);
      }
    } else {
      setShowAiSummary(false);
    }
  };

  useEffect(() => {
    if (showAiSummary && !aiSummaries[activeLangTab]) {
      fetchSummaryForLang(activeLangTab);
    }
  }, [activeLangTab, showAiSummary]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-3 border-[#B84A00] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#6C757D] uppercase tracking-wider">
          Retrieving Official Gazette Document...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="w-12 h-12 text-[#CFD6DE] mx-auto" />
        <h2 className="font-sans text-lg font-bold text-[#181A1B]">Gazette Record Unavailable</h2>
        <p className="text-xs text-[#495057]">{error || 'This order does not exist or has been archived.'}</p>
        <Link
          to="/orders"
          className="inline-flex items-center space-x-1.5 bg-[#181A1B] text-white px-4 py-2 rounded-md text-xs font-bold shadow-xs hover:bg-[#2C3034]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToOrders')}</span>
        </Link>
      </div>
    );
  }

  const currentTitle = order.title[activeLangTab] || order.title.en;
  const currentDescription = order.description[activeLangTab] || order.description.en;
  const formattedDate = new Date(order.publicationDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const activeBullets = aiSummaries[activeLangTab] || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/orders"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#181A1B] hover:text-[#B84A00] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToOrders')}</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1 bg-white border border-[#DFE3E8] px-3 py-1.5 rounded-md text-xs font-semibold text-[#181A1B] hover:bg-[#F1F3F5] transition shadow-xs"
            title={t('shareOrder')}
          >
            {copied ? <Check className="w-3 h-3 text-[#166534]" /> : <Share2 className="w-3 h-3 text-[#6C757D]" />}
            <span>{copied ? t('copiedToClipboard') : t('shareOrder')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1 bg-white border border-[#DFE3E8] px-3 py-1.5 rounded-md text-xs font-semibold text-[#181A1B] hover:bg-[#F1F3F5] transition shadow-xs"
            title={t('printOrder')}
          >
            <Printer className="w-3 h-3 text-[#6C757D]" />
            <span>{t('printOrder')}</span>
          </button>
        </div>
      </div>

      {/* Gazette Document Container */}
      <article className="bg-white rounded-md border border-[#DFE3E8] shadow-card overflow-hidden">
        {/* Tricolor Stripe */}
        <div className="tricolor-stripe" />

        {/* Gazette Sheet Header */}
        <div className="p-6 sm:p-7 bg-[#F1F3F5] border-b border-[#DFE3E8]">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-white text-[#181A1B] text-xs font-mono font-bold tracking-wide border border-[#DFE3E8] tabular-nums">
                {order.orderNumber}
              </span>
              <span className="text-xs font-medium bg-white text-[#495057] border border-[#DFE3E8] px-2.5 py-0.5 rounded-md">
                {order.category}
              </span>
            </div>

            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#166534] bg-[#ECFDF5] px-2.5 py-0.5 rounded-md border border-[#A7F3D0]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Gazette Record</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold text-[#181A1B] mb-2">
            <Building className="w-3.5 h-3.5 text-[#6C757D]" />
            <span>{order.department}</span>
          </div>

          <div className="flex items-center text-xs text-[#6C757D] font-medium tabular-nums">
            <Calendar className="w-3.5 h-3.5 mr-1 text-[#6C757D]" />
            <span>{t('publishedOn')}: {formattedDate}</span>
          </div>
        </div>

        {/* Language Tabs & AI Summary Button */}
        <div className="px-6 sm:px-7 pt-4 border-b border-[#DFE3E8] flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-bold text-[#6C757D] uppercase tracking-wider mr-2">
              Translation:
            </span>
            <button
              onClick={() => setActiveLangTab('en')}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition ${
                activeLangTab === 'en'
                  ? 'border-[#B84A00] text-[#B84A00]'
                  : 'border-transparent text-[#495057] hover:text-[#181A1B]'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setActiveLangTab('hi')}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition ${
                activeLangTab === 'hi'
                  ? 'border-[#B84A00] text-[#B84A00]'
                  : 'border-transparent text-[#495057] hover:text-[#181A1B]'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setActiveLangTab('pa')}
              className={`px-3 py-1.5 text-xs font-bold border-b-2 transition ${
                activeLangTab === 'pa'
                  ? 'border-[#B84A00] text-[#B84A00]'
                  : 'border-transparent text-[#495057] hover:text-[#181A1B]'
              }`}
            >
              ਪੰਜਾਬੀ
            </button>
          </div>

          {/* Dedicated AI Summary Action Button (NOT a dropdown) */}
          <button
            type="button"
            onClick={handleToggleAiSummary}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition shadow-xs ${
              showAiSummary
                ? 'bg-[#181A1B] text-white hover:bg-[#2C3034]'
                : 'bg-white hover:bg-[#F1F3F5] text-[#181A1B] border border-[#DFE3E8]'
            }`}
            title="Generate AI plain-language summary in active language"
          >
            {aiLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B84A00]" />
            ) : (
              <Bot className="w-3.5 h-3.5 text-[#B84A00]" />
            )}
            <span>{showAiSummary ? 'Hide AI Summary' : 'AI Plain-Language Summary'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-[#181A1B] leading-snug">
              {currentTitle}
            </h2>
          </div>

          {/* AI Summary Callout Box */}
          {showAiSummary && (
            <div className="p-4 bg-[#F1F3F5] border border-[#DFE3E8] rounded-md text-xs space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#B84A00] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <Bot className="w-3.5 h-3.5" />
                  Plain-language summary generated by AI ({activeLangTab.toUpperCase()})
                </span>
                <div className="flex items-center space-x-1.5">
                  {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6C757D]" />}
                  <button
                    type="button"
                    onClick={() => setShowAiSummary(false)}
                    className="text-[#6C757D] hover:text-[#181A1B] p-0.5 rounded-md"
                    title="Close AI Summary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {aiError ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 bg-red-50/80 border border-red-200 rounded-md">
                  <p className="text-xs text-red-700 leading-snug">{aiError}</p>
                  <button
                    type="button"
                    onClick={() => fetchSummaryForLang(activeLangTab, true)}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-white hover:bg-[#F1F3F5] text-[#181A1B] border border-[#DFE3E8] rounded-md text-xs font-bold shadow-xs shrink-0 transition"
                  >
                    <RotateCcw className="w-3 h-3 text-[#B84A00]" />
                    <span>Try Again</span>
                  </button>
                </div>
              ) : activeBullets.length > 0 ? (
                <ul className="space-y-1.5 text-[#181A1B] text-xs list-disc list-inside leading-relaxed">
                  {activeBullets.map((bullet, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : aiLoading ? (
                <p className="text-xs text-[#6C757D] italic">
                  Generating 3-bullet plain-language summary in {activeLangTab === 'hi' ? 'Hindi' : activeLangTab === 'pa' ? 'Punjabi' : 'English'}...
                </p>
              ) : null}
            </div>
          )}

          <div className="bg-[#F8F9FA] p-5 rounded-md border border-[#DFE3E8] space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#495057]">
              {t('orderSummary')}
            </h3>
            <p className="text-xs sm:text-sm text-[#181A1B] leading-relaxed whitespace-pre-line font-normal">
              {currentDescription}
            </p>
          </div>

          {/* PDF Document Box */}
          <div className="border border-[#DFE3E8] bg-white rounded-md p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-md bg-[#F1F3F5] text-[#181A1B] border border-[#DFE3E8] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#181A1B]">
                    {order.pdfOriginalName || `Gazette_${order.orderNumber}.pdf`}
                  </h4>
                  <p className="text-[11px] text-[#6C757D] tabular-nums">
                    Authenticated Gazette PDF Document • {order.pdfSize ? `${Math.round(order.pdfSize / 1024)} KB` : 'Verified Digital Copy'}
                  </p>
                </div>
              </div>

              {order.pdfUrl ? (
                <div className="flex items-center gap-2">
                  <a
                    href={getPdfFullUrl(order.pdfUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-white border border-[#DFE3E8] text-[#181A1B] hover:bg-[#F1F3F5] px-3 py-1.5 rounded-md text-xs font-bold transition shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#6C757D]" />
                    <span>{t('previewPdf')}</span>
                  </a>

                  <a
                    href={getPdfFullUrl(order.pdfUrl)}
                    download
                    className="inline-flex items-center space-x-1.5 bg-[#B84A00] hover:bg-[#9A3D00] text-white px-3.5 py-1.5 rounded-md text-xs font-bold transition shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-white" />
                    <span>{t('downloadPdf')}</span>
                  </a>
                </div>
              ) : (
                <span className="text-xs text-[#6C757D] italic">No document file attached</span>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default OrderDetailPage;
