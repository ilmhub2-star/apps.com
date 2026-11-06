import React, { useState } from 'react';
import { Sun, Moon, Menu, X, Shield, LogOut, User as UserIcon } from 'lucide-react';
import type { User } from '../types.ts';

export type PageView =
  | 'home'
  | 'websites'
  | 'apps'
  | 'categories'
  | 'rankings'
  | 'reviews'
  | 'website-detail'
  | 'app-detail'
  | 'admin';

interface NavbarProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: PageView; label: string }[] = [
  { id: 'home', label: 'Bosh sahifa' },
  { id: 'websites', label: 'Saytlar' },
  { id: 'apps', label: 'Ilovalar' },
  { id: 'categories', label: 'Kategoriyalar' },
  { id: 'rankings', label: 'Reytinglar' },
  { id: 'reviews', label: 'Sharhlar' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  theme,
  onToggleTheme,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (page: PageView) => {
    onNavigate(page);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#060913]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => handleNav('home')}
          className="font-display text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          apps<span className="text-cyan-500">.com</span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
          {NAV_ITEMS.map((item) => {
            const active =
              currentPage === item.id ||
              (item.id === 'websites' && currentPage === 'website-detail') ||
              (item.id === 'apps' && currentPage === 'app-detail');
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors cursor-pointer ${
                  active
                    ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Theme Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onToggleTheme}
            aria-label="Mavzuni almashtirish"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {user.role === 'admin' && (
                <button
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    currentPage === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </button>
              )}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 px-2 whitespace-nowrap">
                {user.name}
              </span>
              <button
                onClick={onLogout}
                title="Chiqish"
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Kirish
            </button>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menyu"
            className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] px-4 py-4 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentPage === item.id
                  ? 'bg-blue-600/10 text-blue-600 dark:text-cyan-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                <div className="flex items-center gap-2">
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNav('admin')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Chiqish
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth();
                }}
                className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 text-white"
              >
                Tizimga kirish
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
