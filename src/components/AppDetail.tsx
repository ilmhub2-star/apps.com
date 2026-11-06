import React from 'react';
import { ArrowLeft, Download, Users, Star, Smartphone, Calendar, Layers, ExternalLink } from 'lucide-react';
import type { Application, User } from '../types.ts';
import { formatCompactNumber } from '../utils/format.ts';
import { ReviewSection } from './ReviewSection.tsx';

interface AppDetailProps {
  app: Application;
  allApps: Application[];
  onBack: () => void;
  onSelectApp: (app: Application) => void;
  user: User | null;
  token: string | null;
  onRequireAuth: () => void;
}

export const AppDetail: React.FC<AppDetailProps> = ({
  app,
  allApps,
  onBack,
  onSelectApp,
  user,
  token,
  onRequireAuth,
}) => {
  const similarApps = allApps
    .filter((a) => a.id !== app.id && (app.similarIds.includes(a.id) || a.category === app.category))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Ilovalar roʻyxatiga qaytish
      </button>

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display text-2xl font-extrabold shrink-0"
            style={{ backgroundColor: app.iconColor }}
          >
            {app.iconText}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{app.developer}</span>
              <span aria-hidden="true">·</span>
              <span>{app.category}</span>
              <span aria-hidden="true">·</span>
              <span>Manba: {app.dataSource}</span>
              <span aria-hidden="true">·</span>
              <span>Yangilangan: {app.updatedAt}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {app.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl">
              {app.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {app.googlePlayUrl && (
            <a
              href={app.googlePlayUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              Google Play
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {app.appStoreUrl && (
            <a
              href={app.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              App Store
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Metrics Grid — Clearly distinguishing Downloads vs Monthly Active Users */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Download className="w-3.5 h-3.5 text-cyan-500" />
            <span>Yuklab olishlar (Downloads)</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCompactNumber(app.downloadsCount)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>Oylik faol (MAU)</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCompactNumber(app.monthlyActiveUsers)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Oʻrtacha reyting</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {app.rating.toFixed(1)} / 5.0
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Chiqarilgan yili</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {app.releaseYear ?? 'Maʼlumot yoʻq'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Versiya</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {app.version}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Smartphone className="w-3.5 h-3.5 text-rose-500" />
            <span>Platformalar</span>
          </div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white mt-2.5">
            {app.platforms.join(', ')}
          </p>
        </div>
      </div>

      {/* Similar Applications */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
        <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">
          Oʻxshash ilovalar
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {similarApps.map((sim) => (
            <button
              key={sim.id}
              onClick={() => onSelectApp(sim)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex items-center justify-between transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: sim.iconColor }}
                >
                  {sim.iconText}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{sim.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{sim.developer}</p>
                </div>
              </div>
              <span className="font-mono-tabular text-xs font-semibold text-amber-500">
                ★ {sim.rating.toFixed(1)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
        <ReviewSection
          targetType="app"
          targetId={app.id}
          targetName={app.name}
          user={user}
          token={token}
          onRequireAuth={onRequireAuth}
        />
      </div>
    </div>
  );
};
