import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useLanguage } from '../context/LanguageContext';
import { Bell, X, ExternalLink, FileText } from 'lucide-react';

const RealtimeToast = () => {
  const { activeToast, dismissToast } = useSocket();
  const { getLocalized, t } = useLanguage();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const handleView = () => {
    navigate(`/orders/${activeToast.order._id}`);
    dismissToast();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 bg-white border border-[#DFE3E8] border-l-4 border-l-[#B84A00] rounded-md shadow-dropdown animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#FDF6F0] text-[#B84A00] border border-[#F5D0B5] flex items-center justify-center">
            <Bell className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-[#B84A00] uppercase tracking-wider font-sans">
              {t('newOrderAlert')}
            </h4>
            <span className="text-[11px] text-[#181A1B] font-mono font-bold tabular-nums">
              {activeToast.order.orderNumber}
            </span>
          </div>
        </div>
        <button
          onClick={dismissToast}
          className="text-[#6C757D] hover:text-[#181A1B] p-1 rounded-md"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="mt-2.5 text-xs font-semibold text-[#181A1B] line-clamp-2 leading-relaxed">
        {getLocalized(activeToast.order.title)}
      </p>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#DFE3E8]">
        <span className="text-[10px] bg-[#F1F3F5] text-[#495057] border border-[#DFE3E8] px-2 py-0.5 rounded-md font-medium">
          {activeToast.order.department}
        </span>
        <button
          onClick={handleView}
          className="text-xs font-bold text-[#B84A00] hover:text-[#9A3D00] flex items-center space-x-1"
        >
          <span>{t('viewDetails')}</span>
          <ExternalLink className="w-3 h-3 ml-0.5" />
        </button>
      </div>
    </div>
  );
};

export default RealtimeToast;
