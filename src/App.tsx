import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Globe,
  Smartphone,
  Folder,
  Clock,
  ArrowUpRight,
  Star,
  Download,
  Users,
  TrendingUp,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Navbar, PageView } from './components/Navbar.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { WebsiteDetail } from './components/WebsiteDetail.tsx';
import { AppDetail } from './components/AppDetail.tsx';
import { ReviewSection } from './components/ReviewSection.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { formatCompactNumber, formatGrowth } from './utils/format.ts';
import type { Website, Application, Category, OverviewStats, User } from './types.ts';

type RankingTab =
  | 'top-websites'
  | 'top-apps'
  | 'fastest-growing'
  | 'ai-tools'
  | 'education'
  | 'social-media'
  | 'gaming';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [page, setPage] = useState<PageView>('home');
  const [websites, setWebsites] = useState<Website[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Search & Autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    websites: Website[];
    applications: Application[];
    categories: Category[];
  }>({ websites: [], applications: [], categories: [] });
  const [searchFocused, setSearchFocused] = useState(false);

  // Filters
  const [webCategoryFilter, setWebCategoryFilter] = useState('All');
  const [webCountryFilter, setWebCountryFilter] = useState('All');
  const [webSort, setWebSort] = useState<'rank' | 'visits' | 'growth'>('rank');

  const [appCategoryFilter, setAppCategoryFilter] = useState('All');
  const [appPlatformFilter, setAppPlatformFilter] = useState('All');
  const [appSort, setAppSort] = useState<'downloads' | 'mau' | 'rating'>('downloads');

  const [rankingTab, setRankingTab] = useState<RankingTab>('top-websites');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [ovRes, webRes, appRes, catRes] = await Promise.all([
        fetch('/api/overview'),
        fetch('/api/websites'),
        fetch('/api/apps'),
        fetch('/api/categories'),
      ]);
      if (ovRes.ok) setOverview(await ovRes.json());
      if (webRes.ok) setWebsites(await webRes.json());
      if (appRes.ok) setApplications(await appRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Autocomplete search
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults({ websites: [], applications: [], categories: [] });
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          setSearchResults(await res.json());
        }
      } catch {
        // Ignore
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openWebsiteDetail = (site: Website) => {
    setSelectedWebsite(site);
    setPage('website-detail');
    setSearchFocused(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAppDetail = (app: Application) => {
    setSelectedApp(app);
    setPage('app-detail');
    setSearchFocused(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredWebsites = useMemo(() => {
    let list = [...websites];
    if (webCategoryFilter !== 'All') {
      list = list.filter((w) => w.category.toLowerCase() === webCategoryFilter.toLowerCase());
    }
    if (webCountryFilter !== 'All') {
      list = list.filter((w) => w.country.toLowerCase() === webCountryFilter.toLowerCase());
    }
    if (webSort === 'growth') {
      list.sort((a, b) => (b.growthPercent ?? -999) - (a.growthPercent ?? -999));
    } else if (webSort === 'visits') {
      list.sort((a, b) => (b.monthlyVisits ?? 0) - (a.monthlyVisits ?? 0));
    } else {
      list.sort((a, b) => a.globalRank - b.globalRank);
    }
    return list;
  }, [websites, webCategoryFilter, webCountryFilter, webSort]);

  const filteredApps = useMemo(() => {
    let list = [...applications];
    if (appCategoryFilter !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === appCategoryFilter.toLowerCase());
    }
    if (appPlatformFilter !== 'All') {
      list = list.filter((a) => a.platforms.includes(appPlatformFilter as any));
    }
    if (appSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (appSort === 'mau') {
      list.sort((a, b) => (b.monthlyActiveUsers ?? 0) - (a.monthlyActiveUsers ?? 0));
    } else {
      list.sort((a, b) => (b.downloadsCount ?? 0) - (a.downloadsCount ?? 0));
    }
    return list;
  }, [applications, appCategoryFilter, appPlatformFilter, appSort]);

  const rankingItems = useMemo(() => {
    switch (rankingTab) {
      case 'top-websites':
        return {
          type: 'website' as const,
          items: [...websites].sort((a, b) => a.globalRank - b.globalRank).slice(0, 100),
        };
      case 'top-apps':
        return {
          type: 'app' as const,
          items: [...applications]
            .sort((a, b) => (b.downloadsCount ?? 0) - (a.downloadsCount ?? 0))
            .slice(0, 100),
        };
      case 'fastest-growing':
        return {
          type: 'website' as const,
          items: [...websites].sort((a, b) => (b.growthPercent ?? -999) - (a.growthPercent ?? -999)),
        };
      case 'ai-tools':
        return {
          type: 'website' as const,
          items: websites.filter((w) => w.category === 'Artificial Intelligence'),
        };
      case 'education':
        return {
          type: 'website' as const,
          items: websites.filter((w) => w.category === 'Education'),
        };
      case 'social-media':
        return {
          type: 'website' as const,
          items: websites.filter((w) => w.category === 'Social Media'),
        };
      case 'gaming':
        return {
          type: 'app' as const,
          items: applications.filter((a) => a.category === 'Games'),
        };
    }
  }, [rankingTab, websites, applications]);

  const countries = useMemo(
    () => ['All', ...Array.from(new Set(websites.map((w) => w.country)))],
    [websites]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        currentPage={page}
        onNavigate={(p) => {
          setPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={() => {
          setUser(null);
          setToken(null);
          if (page === 'admin') setPage('home');
        }}
      />

      <main className="flex-1">
        {/* HOMEPAGE */}
        {page === 'home' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-14">
            {/* Hero Section */}
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="text-center max-w-3xl mx-auto space-y-6"
            >
              <p className="text-xs font-semibold tracking-wide text-cyan-600 dark:text-cyan-400">
                Internet olamidagi eng mashhur saytlar va ilovalar bir joyda!
              </p>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight [text-wrap:balance]">
                Dunyoning eng mashhur raqamli platformalarini kashf et!
              </h1>
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                Millionlab insonlar foydalanadigan saytlar va ilovalar haqida statistikalar, reytinglar va sharhlar.
              </p>

              {/* Large Search Bar with Autocomplete */}
              <div className="relative max-w-2xl mx-auto pt-2">
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sayt, ilova, kategoriya yoki kompaniya qidiring (masalan: ChatGPT, Telegram, Google)..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-sm sm:text-base text-slate-900 dark:text-white shadow-lg shadow-black/5 dark:shadow-black/30 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* Autocomplete Dropdown */}
                {searchFocused &&
                  searchQuery.trim() !== '' &&
                  (searchResults.websites.length > 0 ||
                    searchResults.applications.length > 0 ||
                    searchResults.categories.length > 0) && (
                    <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-2xl z-30 p-3 text-left max-h-96 overflow-y-auto space-y-3">
                      {searchResults.websites.length > 0 && (
                        <div>
                          <p className="px-3 py-1 text-xs font-semibold text-slate-400">Saytlar</p>
                          {searchResults.websites.map((w) => (
                            <button
                              key={w.id}
                              onMouseDown={() => openWebsiteDetail(w)}
                              className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-sm cursor-pointer"
                            >
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {w.name}
                              </span>
                              <span className="text-xs text-slate-500">{w.domain}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.applications.length > 0 && (
                        <div>
                          <p className="px-3 py-1 text-xs font-semibold text-slate-400">Ilovalar</p>
                          {searchResults.applications.map((a) => (
                            <button
                              key={a.id}
                              onMouseDown={() => openAppDetail(a)}
                              className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-sm cursor-pointer"
                            >
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {a.name}
                              </span>
                              <span className="text-xs text-slate-500">{a.developer}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.categories.length > 0 && (
                        <div>
                          <p className="px-3 py-1 text-xs font-semibold text-slate-400">
                            Kategoriyalar
                          </p>
                          {searchResults.categories.map((c) => (
                            <button
                              key={c.id}
                              onMouseDown={() => {
                                setWebCategoryFilter(c.name);
                                setPage('websites');
                                setSearchFocused(false);
                              }}
                              className="w-full px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 flex items-center justify-between text-sm cursor-pointer"
                            >
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {c.name}
                              </span>
                              <span className="text-xs text-cyan-500">
                                {c.websiteCount + c.appCount} platforma
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </motion.section>

            {/* 4 Statistics Cards */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Jami saytlar</span>
                  <Globe className="w-4 h-4 text-cyan-500" />
                </div>
                <p className="font-mono-tabular text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {overview?.totalWebsites ?? websites.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manba: Demo data
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Jami ilovalar</span>
                  <Smartphone className="w-4 h-4 text-purple-500" />
                </div>
                <p className="font-mono-tabular text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {overview?.totalApps ?? applications.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Manba: Demo data
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Kategoriyalar</span>
                  <Folder className="w-4 h-4 text-blue-500" />
                </div>
                <p className="font-mono-tabular text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {overview?.totalCategories ?? categories.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Barcha yoʻnalishlar
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Soʻnggi yangilanish</span>
                  <Clock className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="font-mono-tabular text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {overview?.lastUpdated ?? '2026-11-01'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Demo data · Tekshirilgan
                </p>
              </div>
            </section>

            {/* Popular Websites Preview */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Mashhur saytlar
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Global tashriflar boʻyicha yetakchi veb-platformalar · Demo data
                  </p>
                </div>
                <button
                  onClick={() => setPage('websites')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Barchasini koʻrish <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-900/60 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {websites.slice(0, 6).map((site) => (
                    <div
                      key={site.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-blue-500/50 transition-colors flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold text-base shrink-0"
                              style={{ backgroundColor: site.logoColor }}
                            >
                              {site.logoText}
                            </div>
                            <div>
                              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                                {site.name}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {site.domain} · {site.category}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono-tabular text-xs font-bold text-cyan-600 dark:text-cyan-400">
                            #{site.globalRank}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">Tashriflar</span>
                            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                              {formatCompactNumber(site.monthlyVisits)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">Davomiylik</span>
                            <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                              {site.avgVisitDuration || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 dark:text-slate-400 block">Oʻsish</span>
                            <span
                              className={`font-mono-tabular font-semibold ${
                                (site.growthPercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                              }`}
                            >
                              {formatGrowth(site.growthPercent)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-slate-400">{site.dataSource}</span>
                        <button
                          onClick={() => openWebsiteDetail(site)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                        >
                          Batafsil <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Popular Applications Preview */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Mashhur mobil ilovalar
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Yuklab olishlar va oylik faol foydalanuvchilar (MAU) alohida koʻrsatilgan · Demo data
                  </p>
                </div>
                <button
                  onClick={() => setPage('apps')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
                >
                  Barchasini koʻrish <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.slice(0, 6).map((app) => (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-purple-500/50 transition-colors flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold text-base shrink-0"
                            style={{ backgroundColor: app.iconColor }}
                          >
                            {app.iconText}
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {app.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {app.developer} · {app.category}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono-tabular text-xs font-semibold text-amber-500 flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {app.rating.toFixed(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block">
                            Yuklab olishlar
                          </span>
                          <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                            {formatCompactNumber(app.downloadsCount)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 dark:text-slate-400 block">
                            Oylik faol (MAU)
                          </span>
                          <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                            {formatCompactNumber(app.monthlyActiveUsers)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-400">
                        {app.platforms.join(', ')} · {app.dataSource}
                      </span>
                      <button
                        onClick={() => openAppDetail(app)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        Batafsil <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* WEBSITES PAGE */}
        {page === 'websites' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Mashhur saytlar reytingi
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Oylik tashriflar, davomiylik va oʻsish koʻrsatkichlari · Manba: Demo data
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={webCategoryFilter}
                  onChange={(e) => setWebCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="All">Barcha kategoriyalar</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={webCountryFilter}
                  onChange={(e) => setWebCountryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? 'Barcha davlatlar' : c}
                    </option>
                  ))}
                </select>

                <select
                  value={webSort}
                  onChange={(e) => setWebSort(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="rank">Global reyting boʻyicha</option>
                  <option value="visits">Oylik tashriflar boʻyicha</option>
                  <option value="growth">Oʻsish surʼati boʻyicha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWebsites.map((site) => (
                <div
                  key={site.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-blue-500/50 transition-colors flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold text-base shrink-0"
                          style={{ backgroundColor: site.logoColor }}
                        >
                          {site.logoText}
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                            {site.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {site.domain} · {site.category}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-xs font-bold text-cyan-600 dark:text-cyan-400">
                        #{site.globalRank}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Oylik tashriflar</span>
                        <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {formatCompactNumber(site.monthlyVisits)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Oʻrtacha davomiylik</span>
                        <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {site.avgVisitDuration || 'Maʼlumot yoʻq'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Sahifa / tashrif</span>
                        <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {site.pagesPerVisit ?? 'Maʼlumot yoʻq'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Oʻsish</span>
                        <span
                          className={`font-mono-tabular font-semibold ${
                            (site.growthPercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                          }`}
                        >
                          {formatGrowth(site.growthPercent)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      {site.dataSource} · {site.updatedAt}
                    </span>
                    <button
                      onClick={() => openWebsiteDetail(site)}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600/10 text-blue-600 dark:text-cyan-400 hover:bg-blue-600/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batafsil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPLICATIONS PAGE */}
        {page === 'apps' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Mashhur mobil ilovalar
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Yuklab olishlar soni va oylik faol foydalanuvchilar (MAU) alohida koʻrsatilgan · Demo data
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={appCategoryFilter}
                  onChange={(e) => setAppCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="All">Barcha kategoriyalar</option>
                  {[
                    'Social Media',
                    'Messaging',
                    'Entertainment',
                    'Education',
                    'Games',
                    'Productivity',
                    'Artificial Intelligence',
                    'Shopping',
                  ].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={appPlatformFilter}
                  onChange={(e) => setAppPlatformFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="All">Barcha platformalar</option>
                  <option value="Android">Android</option>
                  <option value="iOS">iOS</option>
                  <option value="Web">Web</option>
                  <option value="Desktop">Desktop</option>
                </select>

                <select
                  value={appSort}
                  onChange={(e) => setAppSort(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <option value="downloads">Yuklab olishlar boʻyicha</option>
                  <option value="mau">Oylik faol (MAU) boʻyicha</option>
                  <option value="rating">Reyting boʻyicha</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-purple-500/50 transition-colors flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-display font-bold text-base shrink-0"
                          style={{ backgroundColor: app.iconColor }}
                        >
                          {app.iconText}
                        </div>
                        <div>
                          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                            {app.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {app.developer} · {app.category}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-xs font-semibold text-amber-500 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {app.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          Yuklab olishlar
                        </span>
                        <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {formatCompactNumber(app.downloadsCount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">
                          Oylik faol (MAU)
                        </span>
                        <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {formatCompactNumber(app.monthlyActiveUsers)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Sharhlar</span>
                        <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {formatCompactNumber(app.reviewsCount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400 block">Platformalar</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {app.platforms.join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {app.googlePlayUrl && (
                        <a
                          href={app.googlePlayUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                        >
                          Play <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {app.appStoreUrl && (
                        <a
                          href={app.appStoreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          App Store <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => openAppDetail(app)}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-600/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600/20 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Batafsil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORIES PAGE */}
        {page === 'categories' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Platforma kategoriyalari
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Yoʻnalishlar boʻyicha saytlar va mobil ilovalarni saralang
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setWebCategoryFilter(cat.name);
                    setPage('websites');
                  }}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-cyan-500/50 transition-colors text-left flex flex-col justify-between gap-4 cursor-pointer"
                >
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-cyan-600 dark:text-cyan-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <span className="tabular-nums">
                      {cat.websiteCount} sayt · {cat.appCount} ilova
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* RANKINGS PAGE */}
        {page === 'rankings' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Global reytinglar
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Yoʻnalishlar boʻyicha eng yuqori oʻrinlardagi saytlar va ilovalar · Demo data
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80">
              {[
                { id: 'top-websites', label: 'Top 100 Saytlar' },
                { id: 'top-apps', label: 'Top 100 Ilovalar' },
                { id: 'fastest-growing', label: 'Eng tez oʻsayotganlar' },
                { id: 'ai-tools', label: 'Mashhur AI vositalar' },
                { id: 'education', label: 'Taʼlim platformalari' },
                { id: 'social-media', label: 'Ijtimoiy tarmoqlar' },
                { id: 'gaming', label: 'Oʻyin platformalari' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setRankingTab(t.id as RankingTab)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    rankingTab === t.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4 font-semibold">#</th>
                      <th className="py-3.5 px-4 font-semibold">Platforma</th>
                      <th className="py-3.5 px-4 font-semibold">Kategoriya</th>
                      <th className="py-3.5 px-4 font-semibold text-right">
                        {rankingItems.type === 'website' ? 'Oylik tashriflar' : 'Yuklab olishlar'}
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-right">
                        {rankingItems.type === 'website' ? 'Oʻsish' : 'Reyting'}
                      </th>
                      <th className="py-3.5 px-4 font-semibold text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
                    {rankingItems.items.map((item, idx) => {
                      const isWeb = rankingItems.type === 'website';
                      const w = item as Website;
                      const a = item as Application;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono-tabular font-bold text-cyan-600 dark:text-cyan-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                            {item.category}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-slate-900 dark:text-white">
                            {isWeb
                              ? formatCompactNumber(w.monthlyVisits)
                              : formatCompactNumber(a.downloadsCount)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular">
                            {isWeb ? (
                              <span
                                className={
                                  (w.growthPercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
                                }
                              >
                                {formatGrowth(w.growthPercent)}
                              </span>
                            ) : (
                              <span className="text-amber-500">★ {a.rating.toFixed(1)}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => (isWeb ? openWebsiteDetail(w) : openAppDetail(a))}
                              className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                            >
                              Batafsil
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS PAGE */}
        {page === 'reviews' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <ReviewSection
              user={user}
              token={token}
              onRequireAuth={() => setAuthModalOpen(true)}
            />
          </div>
        )}

        {/* WEBSITE DETAIL PAGE */}
        {page === 'website-detail' && selectedWebsite && (
          <WebsiteDetail
            website={selectedWebsite}
            allWebsites={websites}
            onBack={() => setPage('websites')}
            onSelectWebsite={openWebsiteDetail}
            user={user}
            token={token}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {/* APP DETAIL PAGE */}
        {page === 'app-detail' && selectedApp && (
          <AppDetail
            app={selectedApp}
            allApps={applications}
            onBack={() => setPage('apps')}
            onSelectApp={openAppDetail}
            user={user}
            token={token}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {/* ADMIN PANEL */}
        {page === 'admin' && user?.role === 'admin' && token && (
          <AdminPanel
            token={token}
            websites={websites}
            applications={applications}
            categories={categories}
            overview={overview}
            onRefresh={fetchAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-slate-900 dark:text-white">
              apps.com
            </span>
            <span>·</span>
            <span>Internet olamidagi eng mashhur saytlar va ilovalar bir joyda!</span>
          </div>
          <div>
            <span>Barcha namuna statistikalar "Demo data" sifatida belgilangan.</span>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(t, u) => {
          setToken(t);
          setUser(u);
        }}
      />
    </div>
  );
}
