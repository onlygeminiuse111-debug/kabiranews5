export type NewsCategory = 
  | 'national' 
  | 'politics' 
  | 'world' 
  | 'sports' 
  | 'entertainment' 
  | 'business' 
  | 'tech' 
  | 'health' 
  | 'education'
  | 'state';

export interface Author {
  name: string;
  role?: string;
  avatar?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleEn?: string;
  slug: string;
  summary: string;
  content: string;
  category: NewsCategory;
  state?: string;
  city?: string;
  imageUrl: string;
  imageCaption?: string;
  author: Author;
  publishedAt: string; // ISO string or formatted date
  updatedAt?: string;
  scheduledAt?: string;
  status: 'published' | 'draft' | 'scheduled';
  isBreaking: boolean;
  isTrending: boolean;
  isHeroHighlight: boolean;
  views: number;
  tags: string[];
  readingTime: number; // in minutes
  source?: {
    name: string;
    url?: string;
    originalPubDate?: string;
  };
  attributionText?: string;
  aiProcessed?: boolean;
  aiModel?: string;
}

export interface CategoryInfo {
  id: NewsCategory;
  nameHi: string;
  nameEn: string;
  slug: string;
  iconName: string;
  color: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  userName: string;
  commentText: string;
  createdAt: string;
}

export interface AppSettings {
  siteName: string;
  tagline: string;
  breakingNewsEnabled: boolean;
  maintenanceMode: boolean;
  contactEmail: string;
  phone: string;
  address: string;
}
