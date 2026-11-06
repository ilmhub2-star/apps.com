import React from 'react';
import { ArrowLeft, ExternalLink, Globe, Users, Clock, FileText, Activity, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import type { Website, User } from '../types.ts';
import { formatCompactNumber, formatGrowth } from '../utils/format.ts';
import { ReviewSection } from './ReviewSection.tsx';

interface WebsiteDetailProps {
  website: Website;
  allWebsites: Website[];
  onBack: () => void;
  onSelectWebsite: (site: Website) => void;
  user: User | null;
  token: string | null;
  onRequireAuth: () => void;
}

export const WebsiteDetail: React.FC<WebsiteDetailProps> = ({
  website,
  allWebsites,
  onBack,
  onSelectWebsite,
  user,
  token,
  onRequireAuth,
}) => {
  const trafficSourceData = [
    { name: 'Direct', value: website.trafficSources.direct },
    { name: 'Search', value: website.trafficSources.search },
    { name: 'Social', value: website.trafficSources.social },
    { name: 'Referral', value: website.trafficSources.referral },
    { name: 'Paid', value: website.trafficSources.paid },
  ];

  const relatedSites = allWebsites
    .filter((w) => w.id !== website.id && (website.relatedIds.includes(w.id) || w.category === website.category))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Saytlar roʻyxatiga qaytish
      </button>

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-display text-2xl font-extrabold shrink-0"
            style={{ backgroundColor: website.logoColor }}
          >
            {website.logoText}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>{website.category}</span>
              <span aria-hidden="true">·</span>
              <span>{website.country}</span>
              <span aria-hidden="true">·</span>
              <span>Manba: {website.dataSource}</span>
              <span aria-hidden="true">·</span>
              <span>Yangilangan: {website.updatedAt}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {website.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-2xl">
              {website.description}
            </p>
          </div>
        </div>

        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          Rasmiy saytga oʻtish
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Globe className="w-3.5 h-3.5 text-cyan-500" />
            <span>Global reyting</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            #{website.globalRank}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <span>Oylik tashriflar</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCompactNumber(website.monthlyVisits)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-purple-500" />
            <span>Unikal tashrifchilar</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCompactNumber(website.uniqueVisitors)}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Oʻrtacha davomiylik</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {website.avgVisitDuration || 'Maʼlumot yoʻq'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Sahifa / tashrif</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {website.pagesPerVisit ?? 'Maʼlumot yoʻq'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Activity className="w-3.5 h-3.5 text-rose-500" />
            <span>Bounce Rate / Oʻsish</span>
          </div>
          <p className="font-mono-tabular text-xl font-bold text-slate-900 dark:text-white mt-2">
            {website.bounceRate !== null ? `${website.bounceRate}%` : '—'}
            <span
              className={`ml-2 text-xs ${
                (website.growthPercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {formatGrowth(website.growthPercent)}
            </span>
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Historical Traffic Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-500" />
                Oylik trafik dinamikasi (mlrd tashriflar)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Soʻnggi 6 oylik koʻrsatkich · {website.dataSource}
              </p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={website.historicalTraffic}>
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#06B6D4"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#trafficGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Chart */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
            Trafik manbalari (%)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4">
            Kanallar boʻyicha taqsimot · {website.dataSource}
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficSourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                <XAxis type="number" stroke="#64748B" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={12} width={65} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '0.75rem',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Country Distribution & Related Websites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">
            Davlatlar boʻyicha taqsimot
          </h3>
          <div className="space-y-3.5">
            {website.countryDistribution.map((c) => (
              <div key={c.code} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {c.country} ({c.code})
                  </span>
                  <span className="font-mono-tabular font-semibold text-slate-900 dark:text-white">
                    {c.share}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                    style={{ width: `${Math.min(100, c.share)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <h3 className="font-display text-base font-bold text-slate-900 dark:text-white mb-4">
            Oʻxshash saytlar
          </h3>
          <div className="space-y-3">
            {relatedSites.map((rel) => (
              <button
                key={rel.id}
                onClick={() => onSelectWebsite(rel)}
                className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: rel.logoColor }}
                  >
                    {rel.logoText}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {rel.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {rel.domain} · #{rel.globalRank}
                    </p>
                  </div>
                </div>
                <span className="font-mono-tabular text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  {formatCompactNumber(rel.monthlyVisits)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
        <ReviewSection
          targetType="website"
          targetId={website.id}
          targetName={website.name}
          user={user}
          token={token}
          onRequireAuth={onRequireAuth}
        />
      </div>
    </div>
  );
};
