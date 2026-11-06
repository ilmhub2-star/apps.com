export type DataSourceType = 'Demo data' | 'Similarweb API' | 'Google Play' | 'App Store' | 'Public Dataset';

export interface TrafficSources {
  direct: number;
  search: number;
  social: number;
  referral: number;
  paid: number;
}

export interface CountryShare {
  country: string;
  code: string;
  share: number;
}

export interface HistoricalTrafficPoint {
  month: string;
  visits: number;
}

export interface Website {
  id: string;
  name: string;
  slug: string;
  url: string;
  domain: string;
  logoText: string;
  logoColor: string;
  category: string;
  country: string;
  description: string;
  globalRank: number;
  monthlyVisits: number | null;
  uniqueVisitors: number | null;
  avgVisitDuration: string | null;
  pagesPerVisit: number | null;
  bounceRate: number | null;
  growthPercent: number | null;
  dataSource: DataSourceType;
  updatedAt: string;
  trafficSources: TrafficSources;
  countryDistribution: CountryShare[];
  historicalTraffic: HistoricalTrafficPoint[];
  relatedIds: string[];
}

export type AppPlatform = 'Android' | 'iOS' | 'Web' | 'Desktop';

export interface Application {
  id: string;
  name: string;
  slug: string;
  developer: string;
  iconText: string;
  iconColor: string;
  category: string;
  description: string;
  releaseYear: number | null;
  platforms: AppPlatform[];
  googlePlayUrl: string | null;
  appStoreUrl: string | null;
  downloadsCount: number | null;
  monthlyActiveUsers: number | null;
  rating: number;
  reviewsCount: number;
  version: string;
  dataSource: DataSourceType;
  updatedAt: string;
  similarIds: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  websiteCount: number;
  appCount: number;
}

export interface Review {
  id: string;
  targetType: 'website' | 'app';
  targetId: string;
  targetName?: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  likes: number;
  likedBy: string[];
  reported: boolean;
  reportReason: string | null;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface OverviewStats {
  totalWebsites: number;
  totalApps: number;
  totalCategories: number;
  totalReviews: number;
  lastUpdated: string;
  dataNotice: string;
  integrations: {
    similarwebConfigured: boolean;
    serpapiConfigured: boolean;
  };
}
