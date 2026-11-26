import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { FileText, Shield, ExternalLink } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#F1F3F5] text-[#495057] mt-24 border-t border-[#DFE3E8]">
      {/* Tricolor accent bar */}
      <div className="tricolor-stripe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Identity & Legal Mandate */}
          <div className="space-y-3.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-md bg-white border border-[#DFE3E8] flex items-center justify-center text-[#B84A00] shadow-xs">
                <FileText className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-[#181A1B] tracking-tight">
                  {t('portalTitle')}
                </h3>
                <p className="text-[10px] text-[#6C757D] uppercase tracking-wider font-semibold">
                  Official Gazette Registry
                </p>
              </div>
            </div>
            <p className="text-xs text-[#495057] leading-relaxed">
              Official centralized repository for government orders, statutory gazette notifications, circulars, and departmental mandates published for public dissemination.
            </p>
            <div className="p-3 bg-white rounded-md border border-[#DFE3E8] text-[11px] text-[#495057] shadow-xs">
              <span className="font-bold text-[#B84A00]">Notice:</span> {t('academicDisclaimer')}
            </div>
          </div>

          {/* Column 2: Portal Navigation */}
          <div>
            <h4 className="text-xs font-bold text-[#181A1B] uppercase tracking-wider mb-3.5 pb-1.5 border-b border-[#DFE3E8]">
              Gazette Navigation
            </h4>
            <ul className="space-y-2 text-xs text-[#495057]">
              <li>
                <Link to="/" className="hover:text-[#181A1B] transition">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#181A1B] transition">
                  {t('allOrders')}
                </Link>
              </li>
              <li>
                <Link to="/orders?category=Scholarship" className="hover:text-[#181A1B] transition">
                  Scholarships & Stipends
                </Link>
              </li>
              <li>
                <Link to="/orders?category=Recruitment" className="hover:text-[#181A1B] transition">
                  Public Service Commission Recruitment
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-[#181A1B] transition">
                  {t('adminLogin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portfolios & Directorates */}
          <div>
            <h4 className="text-xs font-bold text-[#181A1B] uppercase tracking-wider mb-3.5 pb-1.5 border-b border-[#DFE3E8]">
              Key Portfolios & Directorates
            </h4>
            <ul className="space-y-2 text-xs text-[#495057]">
              <li>
                <Link to="/orders?department=Higher%20Education" className="hover:text-[#181A1B] transition">
                  Higher Education & Universities
                </Link>
              </li>
              <li>
                <Link to="/orders?department=Health%20%26%20Family%20Welfare" className="hover:text-[#181A1B] transition">
                  Health & Family Welfare
                </Link>
              </li>
              <li>
                <Link to="/orders?department=Agriculture%20%26%20Farmer%20Welfare" className="hover:text-[#181A1B] transition">
                  Agriculture & Farmer Welfare
                </Link>
              </li>
              <li>
                <Link to="/orders?department=Transport%20%26%20Highways" className="hover:text-[#181A1B] transition">
                  Transport & Highways
                </Link>
              </li>
              <li>
                <Link to="/orders?department=Information%20Technology" className="hover:text-[#181A1B] transition">
                  Electronics & Information Technology
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Institutional Compliance & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#181A1B] uppercase tracking-wider mb-3.5 pb-1.5 border-b border-[#DFE3E8]">
              Statutory Compliance
            </h4>
            <div className="p-3 bg-white rounded-md border border-[#DFE3E8] space-y-1.5 text-xs shadow-xs">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-[#166534]">
                <Shield className="w-3.5 h-3.5 text-[#166534]" />
                <span>Verified Public Repository</span>
              </div>
              <p className="text-[11px] text-[#495057] leading-relaxed">
                All gazette entries are archived with immutable timestamps and authenticated original PDF documents for legal reference.
              </p>
            </div>
            <div className="text-[11px] text-[#6C757D] leading-relaxed">
              Designed according to national e-governance data publication standards.
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-10 pt-6 border-t border-[#DFE3E8] flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C757D] gap-2">
          <p>© {new Date().getFullYear()} e-RajPatra Gazette Platform. All rights reserved.</p>
          <p className="text-[11px]">National Gazette & Government Order Information System</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
