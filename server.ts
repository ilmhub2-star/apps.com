import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { getDb, saveDb, hashPassword, verifyPassword, signToken, verifyToken } from './server/store.ts';
import type { Website, Application, Review } from './src/types.ts';

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
  };
}

const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Tizimga kirish talab qilinadi.' });
  }
  const token = authHeader.split('Bearer ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Sessiya muddati tugagan yoki yaroqsiz.' });
  }
  req.user = decoded;
  next();
};

const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Faqat administratorlar uchun ruxsat berilgan.' });
  }
  next();
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Overview & Platform Stats
  app.get('/api/overview', (_req, res) => {
    const db = getDb();
    res.json({
      totalWebsites: db.websites.length,
      totalApps: db.applications.length,
      totalCategories: db.categories.length,
      totalReviews: db.reviews.filter((r) => r.status === 'approved').length,
      lastUpdated: db.lastUpdated,
      dataNotice: 'Demo data',
      integrations: {
        similarwebConfigured: Boolean(process.env.SIMILARWEB_API_KEY),
        serpapiConfigured: Boolean(process.env.SERPAPI_API_KEY),
      },
    });
  });

  // Search with autocomplete
  app.get('/api/search', (req, res) => {
    const q = String(req.query.q || '').trim().toLowerCase();
    const db = getDb();
    if (!q) {
      return res.json({ websites: [], applications: [], categories: [] });
    }
    const websites = db.websites
      .filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.domain.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q)
      )
      .slice(0, 6);

    const applications = db.applications
      .filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.developer.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      )
      .slice(0, 6);

    const categories = db.categories
      .filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
      .slice(0, 4);

    res.json({ websites, applications, categories });
  });

  // Websites CRUD & Filtering
  app.get('/api/websites', (req, res) => {
    const db = getDb();
    let list = [...db.websites];
    const { category, country, sort } = req.query;

    if (category && category !== 'All') {
      list = list.filter((w) => w.category.toLowerCase() === String(category).toLowerCase());
    }
    if (country && country !== 'All') {
      list = list.filter((w) => w.country.toLowerCase() === String(country).toLowerCase());
    }

    if (sort === 'growth') {
      list.sort((a, b) => (b.growthPercent ?? -999) - (a.growthPercent ?? -999));
    } else if (sort === 'visits') {
      list.sort((a, b) => (b.monthlyVisits ?? 0) - (a.monthlyVisits ?? 0));
    } else {
      list.sort((a, b) => a.globalRank - b.globalRank);
    }

    res.json(list);
  });

  app.get('/api/websites/:id', (req, res) => {
    const db = getDb();
    const site = db.websites.find((w) => w.id === req.params.id || w.slug === req.params.id);
    if (!site) return res.status(404).json({ error: 'Sayt topilmadi.' });
    res.json(site);
  });

  app.post('/api/websites', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const body = req.body;
    if (!body.name || !body.url || !body.category) {
      return res.status(400).json({ error: 'Nomi, URL va kategoriya majburiy.' });
    }
    const domain = body.domain || body.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newSite: Website = {
      id: `web-${Date.now()}`,
      name: body.name,
      slug,
      url: body.url,
      domain,
      logoText: body.logoText || body.name.slice(0, 2).toUpperCase(),
      logoColor: body.logoColor || '#3B82F6',
      category: body.category,
      country: body.country || 'United States',
      description: body.description || `${body.name} rasmiy veb-platformasi.`,
      globalRank: Number(body.globalRank) || db.websites.length + 1,
      monthlyVisits: body.monthlyVisits !== undefined && body.monthlyVisits !== '' ? Number(body.monthlyVisits) : null,
      uniqueVisitors: body.uniqueVisitors !== undefined && body.uniqueVisitors !== '' ? Number(body.uniqueVisitors) : null,
      avgVisitDuration: body.avgVisitDuration || null,
      pagesPerVisit: body.pagesPerVisit !== undefined && body.pagesPerVisit !== '' ? Number(body.pagesPerVisit) : null,
      bounceRate: body.bounceRate !== undefined && body.bounceRate !== '' ? Number(body.bounceRate) : null,
      growthPercent: body.growthPercent !== undefined && body.growthPercent !== '' ? Number(body.growthPercent) : null,
      dataSource: body.dataSource || 'Demo data',
      updatedAt: new Date().toISOString().split('T')[0],
      trafficSources: body.trafficSources || { direct: 60, search: 25, social: 8, referral: 5, paid: 2 },
      countryDistribution: body.countryDistribution || [
        { country: 'United States', code: 'US', share: 30 },
        { country: 'Uzbekistan', code: 'UZ', share: 5 },
      ],
      historicalTraffic: body.historicalTraffic || [
        { month: 'Jun', visits: 1.0 },
        { month: 'Jul', visits: 1.1 },
        { month: 'Aug', visits: 1.15 },
        { month: 'Sep', visits: 1.2 },
        { month: 'Oct', visits: 1.25 },
        { month: 'Nov', visits: 1.3 },
      ],
      relatedIds: [],
    };
    db.websites.push(newSite);
    db.lastUpdated = new Date().toISOString().split('T')[0];
    saveDb(db);
    res.status(201).json(newSite);
  });

  app.put('/api/websites/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const idx = db.websites.findIndex((w) => w.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Sayt topilmadi.' });
    db.websites[idx] = {
      ...db.websites[idx],
      ...req.body,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    db.lastUpdated = new Date().toISOString().split('T')[0];
    saveDb(db);
    res.json(db.websites[idx]);
  });

  app.delete('/api/websites/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    db.websites = db.websites.filter((w) => w.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Applications CRUD & Filtering
  app.get('/api/apps', (req, res) => {
    const db = getDb();
    let list = [...db.applications];
    const { category, platform, sort } = req.query;

    if (category && category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === String(category).toLowerCase());
    }
    if (platform && platform !== 'All') {
      list = list.filter((a) => a.platforms.includes(String(platform) as any));
    }

    if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'mau') {
      list.sort((a, b) => (b.monthlyActiveUsers ?? 0) - (a.monthlyActiveUsers ?? 0));
    } else {
      list.sort((a, b) => (b.downloadsCount ?? 0) - (a.downloadsCount ?? 0));
    }

    res.json(list);
  });

  app.get('/api/apps/:id', (req, res) => {
    const db = getDb();
    const appItem = db.applications.find((a) => a.id === req.params.id || a.slug === req.params.id);
    if (!appItem) return res.status(404).json({ error: 'Ilova topilmadi.' });
    res.json(appItem);
  });

  app.post('/api/apps', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const body = req.body;
    if (!body.name || !body.developer || !body.category) {
      return res.status(400).json({ error: 'Ilova nomi, ishlab chiquvchi va kategoriya majburiy.' });
    }
    const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newApp: Application = {
      id: `app-${Date.now()}`,
      name: body.name,
      slug,
      developer: body.developer,
      iconText: body.iconText || body.name.slice(0, 2).toUpperCase(),
      iconColor: body.iconColor || '#8B5CF6',
      category: body.category,
      description: body.description || `${body.name} mobil ilovasi.`,
      releaseYear: body.releaseYear ? Number(body.releaseYear) : null,
      platforms: body.platforms || ['Android', 'iOS'],
      googlePlayUrl: body.googlePlayUrl || null,
      appStoreUrl: body.appStoreUrl || null,
      downloadsCount: body.downloadsCount !== undefined && body.downloadsCount !== '' ? Number(body.downloadsCount) : null,
      monthlyActiveUsers: body.monthlyActiveUsers !== undefined && body.monthlyActiveUsers !== '' ? Number(body.monthlyActiveUsers) : null,
      rating: Number(body.rating) || 4.5,
      reviewsCount: Number(body.reviewsCount) || 0,
      version: body.version || '1.0.0',
      dataSource: body.dataSource || 'Demo data',
      updatedAt: new Date().toISOString().split('T')[0],
      similarIds: [],
    };
    db.applications.push(newApp);
    db.lastUpdated = new Date().toISOString().split('T')[0];
    saveDb(db);
    res.status(201).json(newApp);
  });

  app.put('/api/apps/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const idx = db.applications.findIndex((a) => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Ilova topilmadi.' });
    db.applications[idx] = {
      ...db.applications[idx],
      ...req.body,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    db.lastUpdated = new Date().toISOString().split('T')[0];
    saveDb(db);
    res.json(db.applications[idx]);
  });

  app.delete('/api/apps/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    db.applications = db.applications.filter((a) => a.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Categories
  app.get('/api/categories', (_req, res) => {
    const db = getDb();
    res.json(db.categories);
  });

  app.post('/api/categories', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Kategoriya nomi majburiy.' });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      description: description || `${name} yoʻnalishidagi platformalar.`,
      websiteCount: 0,
      appCount: 0,
    };
    db.categories.push(newCat);
    saveDb(db);
    res.status(201).json(newCat);
  });

  app.delete('/api/categories/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Reviews System
  app.get('/api/reviews', (req, res) => {
    const db = getDb();
    const { targetType, targetId, sort, includeAll } = req.query;
    let list = [...db.reviews];

    if (includeAll !== 'true') {
      list = list.filter((r) => r.status === 'approved');
    }
    if (targetType) {
      list = list.filter((r) => r.targetType === targetType);
    }
    if (targetId) {
      list = list.filter((r) => r.targetId === targetId);
    }

    if (sort === 'helpful') {
      list.sort((a, b) => b.likes - a.likes);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const enriched = list.map((r) => {
      const target =
        r.targetType === 'website'
          ? db.websites.find((w) => w.id === r.targetId)?.name
          : db.applications.find((a) => a.id === r.targetId)?.name;
      return { ...r, targetName: target || r.targetId };
    });

    res.json(enriched);
  });

  app.post('/api/reviews', requireAuth, (req: AuthRequest, res) => {
    const db = getDb();
    const { targetType, targetId, rating, title, comment } = req.body;
    if (!targetType || !targetId || !rating || !comment) {
      return res.status(400).json({ error: 'Barcha majburiy maydonlarni toʻldiring.' });
    }
    const numRating = Math.min(5, Math.max(1, Number(rating)));
    const sentiment = numRating >= 4 ? 'positive' : numRating <= 2 ? 'negative' : 'neutral';

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      targetType,
      targetId,
      userId: req.user!.id,
      userName: req.user!.name,
      rating: numRating,
      title: title || 'Foydalanuvchi sharhi',
      comment,
      sentiment,
      likes: 0,
      likedBy: [],
      reported: false,
      reportReason: null,
      status: 'approved',
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);
    saveDb(db);
    res.status(201).json(newReview);
  });

  app.post('/api/reviews/:id/like', requireAuth, (req: AuthRequest, res) => {
    const db = getDb();
    const rev = db.reviews.find((r) => r.id === req.params.id);
    if (!rev) return res.status(404).json({ error: 'Sharh topilmadi.' });

    const uid = req.user!.id;
    if (rev.likedBy.includes(uid)) {
      rev.likedBy = rev.likedBy.filter((id) => id !== uid);
    } else {
      rev.likedBy.push(uid);
    }
    rev.likes = rev.likedBy.length;
    saveDb(db);
    res.json(rev);
  });

  app.post('/api/reviews/:id/report', requireAuth, (req: AuthRequest, res) => {
    const db = getDb();
    const rev = db.reviews.find((r) => r.id === req.params.id);
    if (!rev) return res.status(404).json({ error: 'Sharh topilmadi.' });

    rev.reported = true;
    rev.reportReason = req.body.reason || 'Nomaqbul kontent';
    saveDb(db);
    res.json(rev);
  });

  app.patch('/api/reviews/:id/moderate', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const rev = db.reviews.find((r) => r.id === req.params.id);
    if (!rev) return res.status(404).json({ error: 'Sharh topilmadi.' });
    rev.status = req.body.status || 'approved';
    if (req.body.clearReport) {
      rev.reported = false;
      rev.reportReason = null;
    }
    saveDb(db);
    res.json(rev);
  });

  app.delete('/api/reviews/:id', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    db.reviews = db.reviews.filter((r) => r.id !== req.params.id);
    saveDb(db);
    res.json({ success: true });
  });

  // Authentication
  app.post('/api/auth/register', (req, res) => {
    const db = getDb();
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Ism, email va parol majburiy.' });
    }
    if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ error: 'Bu email allaqachon roʻyxatdan oʻtgan.' });
    }
    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'user' as const,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveDb(db);
    const token = signToken({ id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role });
    res.status(201).json({
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, createdAt: newUser.createdAt },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const db = getDb();
    const { email, password } = req.body;
    const user = db.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase());
    if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
      return res.status(401).json({ error: 'Email yoki parol notoʻgʻri.' });
    }
    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({ user: req.user });
  });

  // Admin Users Management
  app.get('/api/admin/users', requireAuth, requireAdmin, (_req, res) => {
    const db = getDb();
    res.json(db.users.map(({ passwordHash: _, ...u }) => u));
  });

  app.patch('/api/admin/users/:id/role', requireAuth, requireAdmin, (req: AuthRequest, res) => {
    const db = getDb();
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'Foydalanuvchi topilmadi.' });
    user.role = req.body.role === 'admin' ? 'admin' : 'user';
    saveDb(db);
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  });

  // Vite middleware in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ILMHUB.TREND server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
