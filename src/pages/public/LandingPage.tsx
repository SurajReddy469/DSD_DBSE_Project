import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { BookCard } from '../../components/books/BookCard';
import { Button } from '../../components/common/Button';
import {
  Search,
  BookOpen,
  Users,
  Layers,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Bookmark,
  Sparkles,
  Library,
  GraduationCap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { books } = useLibrary();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const featuredBooks = books.slice(0, 4);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/student/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/student/books');
    }
  };

  const quickDemoLogin = (role: 'student' | 'librarian' | 'admin') => {
    login(`${role}@klh.edu.in`, role);
    navigate(`/${role}/dashboard`);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(12,135,235,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(12,135,235,0.15),rgba(0,0,0,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/60 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-8 animate-fade-in shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Next-Generation Academic Library Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            Scholarly Discovery, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-400">
              Effortlessly Organized.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Access thousands of academic monographs, research textbooks, digital reserves, and circulation services with the KLH University modern portal.
          </p>

          {/* Search bar CTA */}
          <div className="mt-10 max-w-2xl mx-auto">
            <form
              onSubmit={handleHeroSearch}
              className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800"
            >
              <div className="flex-1 flex items-center pl-3 gap-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by title, author, ISBN, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                />
              </div>
              <Button type="submit" size="md">
                Search Catalog
              </Button>
            </form>
          </div>

          {/* Instant Demo Role Switchers for testing */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Demo Access:</span>
            <button
              onClick={() => quickDemoLogin('student')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              🎓 Student Demo
            </button>
            <button
              onClick={() => quickDemoLogin('librarian')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              💼 Librarian Demo
            </button>
            <button
              onClick={() => quickDemoLogin('admin')}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition-colors"
            >
              🛡️ Admin Demo
            </button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="stats" className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                10,000+
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Printed & Digital Volumes</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Peer-reviewed academic texts</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                2,500+
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Active Campus Members</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Students, faculty, and scholars</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                50+
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Subject Categories</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">From AI to Classical Philosophy</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                25+
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Years of Knowledge</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Excellence in research support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Collection */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Curated Volumes
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              Featured Academic Texts
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Hand-selected seminal works across scientific and engineering disciplines.
            </p>
          </div>
          <Link to="/student/books">
            <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View Full Catalog
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={() => {
                login('student@klh.edu.in', 'student');
                navigate(`/student/books/${book.id}`);
              }}
              onReserve={() => {
                login('student@klh.edu.in', 'student');
                navigate(`/student/books/${book.id}`);
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Enterprise Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Engineered for Modern Academic Institutions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            A comprehensive suite of tools tailored for students, circulation librarians, and system administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Deep Multi-Facet Search
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Filter by publication year, availability, author, and classification with instant real-time query refinement and shelf location guidance.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Automated Holds & Queues
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Reserve checked-out volumes with transparent queue position tracking and automatic pickup alert notifications when books are returned.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
              Role-Based Portals
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Dedicated interfaces with specific permission gates for Student self-service, Librarian circulation desk operations, and Administrative system oversight.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-slate-100/70 dark:bg-slate-900/30 py-20 border-y border-slate-200 dark:border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              How the KLH Library Platform Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <div className="text-3xl font-black text-brand-500/20 mb-3">01</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">Search & Discover</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Query our unified catalog by course syllabus, subject keyword, or call number.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <div className="text-3xl font-black text-brand-500/20 mb-3">02</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">Borrow or Hold</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Check out directly online or enter the hold queue if all copies are in active use.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <div className="text-3xl font-black text-brand-500/20 mb-3">03</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">Track Due Dates</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receive proactive reminders 48 hours prior to due dates with 1-click renewal.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
              <div className="text-3xl font-black text-brand-500/20 mb-3">04</div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">Check-in & Return</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Drop off at any campus circulation desk or smart dropbox for instant check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-tr from-brand-700 via-brand-600 to-indigo-700 rounded-3xl p-8 sm:p-14 text-white shadow-2xl shadow-brand-500/20 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Begin Your Research?
          </h2>
          <p className="mt-4 text-brand-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Sign in with your KLH University credentials or register for library membership to start borrowing today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-700 hover:bg-slate-100 font-bold border-none shadow-lg">
                Create Member Account
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Sign In to Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
