import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Check, X, Shield, Globe, Smartphone, Folder, MessageSquare, Users } from 'lucide-react';
import type { Website, Application, Category, Review, User, OverviewStats } from '../types.ts';
import { formatCompactNumber } from '../utils/format.ts';

interface AdminPanelProps {
  token: string;
  websites: Website[];
  applications: Application[];
  categories: Category[];
  overview: OverviewStats | null;
  onRefresh: () => void;
}

type AdminTab = 'websites' | 'apps' | 'categories' | 'reviews' | 'users';

export const AdminPanel: React.FC<AdminPanelProps> = ({
  token,
  websites,
  applications,
  categories,
  overview,
  onRefresh,
}) => {
  const [tab, setTab] = useState<AdminTab>('websites');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [statusMsg, setStatusMsg] = useState('');

  // New Website Form
  const [wName, setWName] = useState('');
  const [wUrl, setWUrl] = useState('');
  const [wCategory, setWCategory] = useState(categories[0]?.name || 'Technology');
  const [wRank, setWRank] = useState('');
  const [wVisits, setWVisits] = useState('');
  const [wDesc, setWDesc] = useState('');

  // Edit Website State
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null);
  const [editSiteDesc, setEditSiteDesc] = useState('');
  const [editSiteVisits, setEditSiteVisits] = useState('');

  // New App Form
  const [aName, setAName] = useState('');
  const [aDev, setADev] = useState('');
  const [aCategory, setACategory] = useState(categories[0]?.name || 'Social Media');
  const [aDownloads, setADownloads] = useState('');
  const [aMau, setAMau] = useState('');
  const [aDesc, setADesc] = useState('');

  // New Category Form
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const loadAdminData = async () => {
    try {
      const [revRes, usrRes] = await Promise.all([
        fetch('/api/reviews?includeAll=true', { headers }),
        fetch('/api/admin/users', { headers }),
      ]);
      if (revRes.ok) setReviews(await revRes.json());
      if (usrRes.ok) setUsers(await usrRes.json());
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [tab]);

  const notify = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleAddWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/websites', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: wName,
        url: wUrl,
        category: wCategory,
        globalRank: wRank || websites.length + 1,
        monthlyVisits: wVisits || null,
        description: wDesc,
        dataSource: 'Demo data',
      }),
    });
    if (res.ok) {
      setWName('');
      setWUrl('');
      setWRank('');
      setWVisits('');
      setWDesc('');
      notify('Yangi sayt qoʻshildi.');
      onRefresh();
    }
  };

  const handleSaveSiteEdit = async (id: string) => {
    const res = await fetch(`/api/websites/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        description: editSiteDesc,
        monthlyVisits: editSiteVisits !== '' ? Number(editSiteVisits) : null,
      }),
    });
    if (res.ok) {
      setEditingSiteId(null);
      notify('Sayt maʼlumotlari yangilandi.');
      onRefresh();
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    const res = await fetch(`/api/websites/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      notify('Sayt oʻchirildi.');
      onRefresh();
    }
  };

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/apps', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: aName,
        developer: aDev,
        category: aCategory,
        downloadsCount: aDownloads || null,
        monthlyActiveUsers: aMau || null,
        description: aDesc,
        dataSource: 'Demo data',
      }),
    });
    if (res.ok) {
      setAName('');
      setADev('');
      setADownloads('');
      setAMau('');
      setADesc('');
      notify('Yangi ilova qoʻshildi.');
      onRefresh();
    }
  };

  const handleDeleteApp = async (id: string) => {
    const res = await fetch(`/api/apps/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      notify('Ilova oʻchirildi.');
      onRefresh();
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: cName, description: cDesc }),
    });
    if (res.ok) {
      setCName('');
      setCDesc('');
      notify('Kategoriya qoʻshildi.');
      onRefresh();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      notify('Kategoriya oʻchirildi.');
      onRefresh();
    }
  };

  const handleModerateReview = async (id: string, status: 'approved' | 'rejected') => {
    const res = await fetch(`/api/reviews/${id}/moderate`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, clearReport: true }),
    });
    if (res.ok) {
      notify('Sharh holati yangilandi.');
      loadAdminData();
    }
  };

  const handleDeleteReview = async (id: string) => {
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers });
    if (res.ok) {
      notify('Sharh oʻchirildi.');
      loadAdminData();
    }
  };

  const handleToggleUserRole = async (u: User) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    const res = await fetch(`/api/admin/users/${u.id}/role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      notify('Foydalanuvchi roli yangilandi.');
      loadAdminData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Shield className="w-6 h-6 text-purple-500" />
            Administrator boshqaruv paneli
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Saytlar, ilovalar, kategoriyalar, sharhlar va foydalanuvchilarni boshqarish
          </p>
        </div>

        {statusMsg && (
          <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-500">
            {statusMsg}
          </div>
        )}
      </div>

      {/* Platform Analytics Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Jami saytlar</span>
          <p className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {websites.length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Jami ilovalar</span>
          <p className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {applications.length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <span className="text-xs text-slate-500 dark:text-slate-400">Kategoriyalar</span>
          <p className="font-mono-tabular text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {categories.length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <span className="text-xs text-slate-500 dark:text-slate-400">API integratsiya</span>
          <p className="text-xs font-semibold text-slate-900 dark:text-white mt-2">
            {overview?.integrations.similarwebConfigured ? 'Similarweb: Faol' : 'Demo data rejimi'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 w-fit">
        {[
          { id: 'websites', label: 'Saytlar', icon: Globe },
          { id: 'apps', label: 'Ilovalar', icon: Smartphone },
          { id: 'categories', label: 'Kategoriyalar', icon: Folder },
          { id: 'reviews', label: 'Sharhlar moderatsiyasi', icon: MessageSquare },
          { id: 'users', label: 'Foydalanuvchilar', icon: Users },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as AdminTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content: Websites */}
      {tab === 'websites' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleAddWebsite}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-4 h-fit"
          >
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-500" />
              Yangi sayt qoʻshish
            </h3>
            <input
              type="text"
              required
              placeholder="Sayt nomi (masalan: GitHub)"
              value={wName}
              onChange={(e) => setWName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="url"
              required
              placeholder="https://github.com"
              value={wUrl}
              onChange={(e) => setWUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <select
              value={wCategory}
              onChange={(e) => setWCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Global reyting"
                value={wRank}
                onChange={(e) => setWRank(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Oylik tashriflar"
                value={wVisits}
                onChange={(e) => setWVisits(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Qisqacha tavsif..."
              value={wDesc}
              onChange={(e) => setWDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              Saytni saqlash
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {websites.map((site) => (
              <div
                key={site.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      #{site.globalRank} {site.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {site.domain} · {site.category} · {formatCompactNumber(site.monthlyVisits)} tashrif
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingSiteId(site.id);
                        setEditSiteDesc(site.description);
                        setEditSiteVisits(site.monthlyVisits ? String(site.monthlyVisits) : '');
                      }}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-500 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWebsite(site.id)}
                      className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {editingSiteId === site.id && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                    <input
                      type="number"
                      value={editSiteVisits}
                      onChange={(e) => setEditSiteVisits(e.target.value)}
                      placeholder="Oylik tashriflar"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      value={editSiteDesc}
                      onChange={(e) => setEditSiteDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveSiteEdit(site.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Saqlash
                      </button>
                      <button
                        onClick={() => setEditingSiteId(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Bekor qilish
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Apps */}
      {tab === 'apps' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleAddApp}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-4 h-fit"
          >
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-500" />
              Yangi ilova qoʻshish
            </h3>
            <input
              type="text"
              required
              placeholder="Ilova nomi"
              value={aName}
              onChange={(e) => setAName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="text"
              required
              placeholder="Ishlab chiquvchi (Developer)"
              value={aDev}
              onChange={(e) => setADev(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <select
              value={aCategory}
              onChange={(e) => setACategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Yuklab olishlar"
                value={aDownloads}
                onChange={(e) => setADownloads(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
              <input
                type="number"
                placeholder="Oylik faol (MAU)"
                value={aMau}
                onChange={(e) => setAMau(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
              />
            </div>
            <textarea
              rows={3}
              placeholder="Ilova tavsifi..."
              value={aDesc}
              onChange={(e) => setADesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold cursor-pointer"
            >
              Ilovani saqlash
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {app.developer} · {app.category} · Yuklab olishlar: {formatCompactNumber(app.downloadsCount)} · MAU: {formatCompactNumber(app.monthlyActiveUsers)}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteApp(app.id)}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Categories */}
      {tab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleAddCategory}
            className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-4 h-fit"
          >
            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
              Yangi kategoriya
            </h3>
            <input
              type="text"
              required
              placeholder="Kategoriya nomi"
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <textarea
              rows={3}
              placeholder="Tavsif..."
              value={cDesc}
              onChange={(e) => setCDesc(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              Qoʻshish
            </button>
          </form>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {cat.websiteCount} sayt · {cat.appCount} ilova
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: Reviews Moderation */}
      {tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Moderatsiya uchun sharhlar mavjud emas.
              </p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-900 dark:text-white">{rev.userName}</span>
                    <span>·</span>
                    <span>{rev.targetName}</span>
                    <span>·</span>
                    <span>Holat: {rev.status}</span>
                    {rev.reported && (
                      <>
                        <span>·</span>
                        <span className="text-red-500 font-semibold">Shikoyat qilingan</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{rev.comment}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleModerateReview(rev.id, 'approved')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Tasdiqlash
                  </button>
                  <button
                    onClick={() => handleModerateReview(rev.id, 'rejected')}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold cursor-pointer"
                  >
                    Rad etish
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Users */}
      {tab === 'users' && (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{u.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {u.email} · Rol: {u.role}
                </p>
              </div>
              <button
                onClick={() => handleToggleUserRole(u)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {u.role === 'admin' ? 'User qilish' : 'Admin qilish'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
