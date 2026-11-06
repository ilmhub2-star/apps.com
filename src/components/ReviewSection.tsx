import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Flag, MessageSquarePlus } from 'lucide-react';
import type { Review, User } from '../types.ts';

interface ReviewSectionProps {
  targetType?: 'website' | 'app';
  targetId?: string;
  targetName?: string;
  user: User | null;
  token: string | null;
  onRequireAuth: () => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  targetType,
  targetId,
  targetName,
  user,
  token,
  onRequireAuth,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState<'newest' | 'helpful'>('newest');
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (targetType) params.set('targetType', targetType);
      if (targetId) params.set('targetId', targetId);
      const res = await fetch(`/api/reviews?${params.toString()}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [targetType, targetId, sort]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) {
      onRequireAuth();
      return;
    }
    if (!targetType || !targetId) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType,
          targetId,
          rating,
          title,
          comment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sharh qoʻshishda xatolik.');
      } else {
        setTitle('');
        setComment('');
        setRating(5);
        fetchReviews();
      }
    } catch {
      setError('Server bilan bogʻlanishda xatolik.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!user || !token) {
      onRequireAuth();
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)));
      }
    } catch {
      // Ignore
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!user || !token) {
      onRequireAuth();
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: 'Nomaqbul yoki notoʻgʻri maʼlumot' }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, ...updated } : r)));
      }
    } catch {
      // Ignore
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';
  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Foydalanuvchi sharhlari {targetName ? `— ${targetName}` : ''}
          </h3>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            <span>Oʻrtacha baho: {avgRating} / 5.0</span>
            <span aria-hidden="true">·</span>
            <span>Jami sharhlar: {reviews.length}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-600 dark:text-emerald-400">Ijobiy: {positiveCount}</span>
            <span aria-hidden="true">·</span>
            <span className="text-red-500">Salbiy: {negativeCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 self-start">
          <button
            onClick={() => setSort('newest')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              sort === 'newest'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Eng yangi
          </button>
          <button
            onClick={() => setSort('helpful')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              sort === 'helpful'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Eng foydali
          </button>
        </div>
      </div>

      {/* Write Review Form (only when on a specific website or app detail page) */}
      {targetType && targetId && (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0B1120] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquarePlus className="w-4 h-4 text-cyan-500" />
              Sharh qoldirish
            </h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer"
                  aria-label={`${star} yulduz`}
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sharh sarlavhasi (ixtiyoriy)"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />

          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              user
                ? 'Platforma haqidagi fikringizni yozing...'
                : 'Sharh yozish uchun avval tizimga kiring...'
            }
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {user ? (submitting ? 'Yuborilmoqda...' : 'Sharhni yuborish') : 'Kirish va yuborish'}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-slate-100 dark:bg-slate-900/60 animate-pulse"
            />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Hozircha sharhlar mavjud emas.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Birinchi boʻlib oʻz fikringizni bildiring!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => {
            const isLiked = user ? rev.likedBy.includes(user.id) : false;
            return (
              <div
                key={rev.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {rev.userName}
                      </span>
                      {!targetId && rev.targetName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-cyan-600 dark:text-cyan-400 font-medium">
                            {rev.targetName}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('uz-UZ')}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                      {rev.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {rev.comment}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/70">
                  <button
                    onClick={() => handleLike(rev.id)}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer ${
                      isLiked
                        ? 'text-blue-600 dark:text-cyan-400'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="tabular-nums">Foydali ({rev.likes})</span>
                  </button>

                  <button
                    onClick={() => handleReport(rev.id)}
                    disabled={rev.reported}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{rev.reported ? 'Shikoyat yuborilgan' : 'Shikoyat qilish'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
