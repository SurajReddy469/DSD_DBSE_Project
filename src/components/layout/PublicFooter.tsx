import React from 'react';
import { Library, Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md">
                <Library className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block">
                  KLH UNIVERSITY
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                  University Library
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering scholarly discovery, interdisciplinary research, and lifelong learning across over 250,000 physical volumes and modern digital collections.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Campus Digital Systems: Fully Operational</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Academic Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Digital Catalog Search
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Student Member Portal
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Course Reserves & Syllabi
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Interlibrary Loan (ILLiad)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Special Collections & Archives
                </Link>
              </li>
            </ul>
          </div>

          {/* Hours & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Library Hours
            </h4>
            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-300 font-semibold block">Monday – Thursday:</span>
                <span className="text-slate-400">7:30 AM – Midnight</span>
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">Friday:</span>
                <span className="text-slate-400">7:30 AM – 8:00 PM</span>
              </div>
              <div>
                <span className="text-slate-300 font-semibold block">Saturday & Sunday:</span>
                <span className="text-slate-400">9:00 AM – 9:00 PM</span>
              </div>
              <p className="text-[11px] text-brand-400 pt-1">
                24/7 Study Hall open during Finals Week.
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-4">
              Circulation Desk
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>Central Academic Quad, Bldg 4, Aziznagar Campus</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+1 (555) 800-BOOK</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>librarian@klh.edu.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} KLH University KLH Bachupally Library System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Circulation</span>
            <span className="hover:text-slate-400 cursor-pointer">Accessibility Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
