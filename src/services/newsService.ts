import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { NewsArticle, NewsCategory, CommentItem } from '../types/news';
import { INITIAL_NEWS_ARTICLES } from '../data/seedNews';

const ARTICLES_COLLECTION = 'articles';
const COMMENTS_COLLECTION = 'comments';
const LOCAL_STORAGE_KEY = 'kabira_news_offline_articles';

// Helper to save locally as fallback
function saveToLocalStorage(articles: NewsArticle[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(articles));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

function getFromLocalStorage(): NewsArticle[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('LocalStorage read failed:', e);
  }
  return INITIAL_NEWS_ARTICLES;
}

export interface FetchArticlesOptions {
  category?: NewsCategory | 'all';
  state?: string;
  isBreaking?: boolean;
  isTrending?: boolean;
  isHeroHighlight?: boolean;
  searchQuery?: string;
  limitCount?: number;
  status?: 'published' | 'draft' | 'all';
}

export async function fetchArticles(options: FetchArticlesOptions = {}): Promise<NewsArticle[]> {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    let q = query(articlesRef);

    // If query by status (public view only published)
    if (options.status && options.status !== 'all') {
      q = query(q, where('status', '==', options.status));
    }

    if (options.category && options.category !== 'all') {
      q = query(q, where('category', '==', options.category));
    }

    if (options.state) {
      q = query(q, where('state', '==', options.state));
    }

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      let articles: NewsArticle[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        articles.push({
          id: docSnap.id,
          ...data,
        } as NewsArticle);
      });

      // Filter in memory for complex filters if needed
      if (options.isBreaking !== undefined) {
        articles = articles.filter(a => a.isBreaking === options.isBreaking);
      }
      if (options.isTrending !== undefined) {
        articles = articles.filter(a => a.isTrending === options.isTrending);
      }
      if (options.isHeroHighlight !== undefined) {
        articles = articles.filter(a => a.isHeroHighlight === options.isHeroHighlight);
      }
      if (options.searchQuery && options.searchQuery.trim()) {
        const qLower = options.searchQuery.toLowerCase().trim();
        articles = articles.filter(
          a =>
            a.title.toLowerCase().includes(qLower) ||
            a.summary.toLowerCase().includes(qLower) ||
            (a.tags && a.tags.some(t => t.toLowerCase().includes(qLower))) ||
            (a.author?.name && a.author.name.toLowerCase().includes(qLower)) ||
            (a.content && a.content.toLowerCase().includes(qLower))
        );
      }

      // Sort by publishedAt desc
      articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

      if (options.limitCount && options.limitCount > 0) {
        articles = articles.slice(0, options.limitCount);
      }

      saveToLocalStorage(articles);
      return articles;
    }
  } catch (error) {
    console.warn('Firestore fetch failed or rules restricted, using cached/seed articles:', error);
  }

  // Fallback to local storage or bundled seed news
  let fallback = getFromLocalStorage();

  if (options.status && options.status !== 'all') {
    fallback = fallback.filter(a => a.status === options.status);
  }
  if (options.category && options.category !== 'all') {
    fallback = fallback.filter(a => a.category === options.category);
  }
  if (options.state) {
    fallback = fallback.filter(a => a.state === options.state);
  }
  if (options.isBreaking !== undefined) {
    fallback = fallback.filter(a => a.isBreaking === options.isBreaking);
  }
  if (options.isTrending !== undefined) {
    fallback = fallback.filter(a => a.isTrending === options.isTrending);
  }
  if (options.isHeroHighlight !== undefined) {
    fallback = fallback.filter(a => a.isHeroHighlight === options.isHeroHighlight);
  }
  if (options.searchQuery && options.searchQuery.trim()) {
    const qLower = options.searchQuery.toLowerCase().trim();
    fallback = fallback.filter(
      a =>
        a.title.toLowerCase().includes(qLower) ||
        a.summary.toLowerCase().includes(qLower) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(qLower))) ||
        (a.author?.name && a.author.name.toLowerCase().includes(qLower))
    );
  }

  fallback.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  if (options.limitCount && options.limitCount > 0) {
    fallback = fallback.slice(0, options.limitCount);
  }

  return fallback;
}

/**
 * Real-time listener for Firestore articles.
 * Enables the portal to update live automatically when GitHub Actions or Admin publishes news.
 */
export function subscribeToArticles(
  onUpdate: (articles: NewsArticle[]) => void,
  options: FetchArticlesOptions = {}
): () => void {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    let q = query(articlesRef);

    if (options.status && options.status !== 'all') {
      q = query(q, where('status', '==', options.status));
    }

    if (options.category && options.category !== 'all') {
      q = query(q, where('category', '==', options.category));
    }

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const articles: NewsArticle[] = [];
          querySnapshot.forEach((docSnap) => {
            articles.push({
              id: docSnap.id,
              ...docSnap.data(),
            } as NewsArticle);
          });
          articles.sort(
            (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
          );
          saveToLocalStorage(articles);
          onUpdate(articles);
        }
      },
      (error) => {
        console.warn('Realtime articles listener warning:', error);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to attach realtime articles listener:', err);
    return () => {};
  }
}

export async function fetchArticleByIdOrSlug(idOrSlug: string): Promise<NewsArticle | null> {
  try {
    // Try by ID first
    const docRef = doc(db, ARTICLES_COLLECTION, idOrSlug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as NewsArticle;
    }

    // Try by slug
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, where('slug', '==', idOrSlug), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const match = querySnapshot.docs[0];
      return { id: match.id, ...match.data() } as NewsArticle;
    }
  } catch (error) {
    console.warn('Fetch article by slug error:', error);
  }

  // Fallback to local
  const localList = getFromLocalStorage();
  const found = localList.find(a => a.id === idOrSlug || a.slug === idOrSlug);
  return found || null;
}

export async function incrementArticleViews(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch {
    // Fallback in localStorage
    const local = getFromLocalStorage();
    const item = local.find(a => a.id === articleId);
    if (item) {
      item.views = (item.views || 0) + 1;
      saveToLocalStorage(local);
    }
  }
}

export async function saveArticle(article: Partial<NewsArticle>): Promise<string> {
  const isNew = !article.id;
  const articleId = article.id || `art-${Date.now()}`;
  
  const payload: any = {
    title: article.title || '',
    titleEn: article.titleEn || '',
    slug: article.slug || generateSlug(article.title || 'news-article'),
    summary: article.summary || '',
    content: article.content || '',
    category: article.category || 'national',
    state: article.state || '',
    city: article.city || '',
    imageUrl: article.imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
    imageCaption: article.imageCaption || '',
    author: {
      name: article.author?.name || 'कबीरा विशेष संवाददाता',
      role: article.author?.role || 'संपादकीय विभाग',
      avatar: article.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    publishedAt: article.publishedAt || new Date().toISOString(),
    status: article.status || 'published',
    isBreaking: Boolean(article.isBreaking),
    isTrending: Boolean(article.isTrending),
    isHeroHighlight: Boolean(article.isHeroHighlight),
    views: article.views || 0,
    tags: article.tags || ['समाचार', 'कबीरा न्यूज़'],
    readingTime: Math.max(1, Math.ceil((article.content?.split(' ').length || 200) / 180)),
    updatedAt: new Date().toISOString(),
  };

  if (article.scheduledAt) {
    payload.scheduledAt = article.scheduledAt;
  }

  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    console.warn('Firestore save failed, updating in local storage:', error);
  }

  // Also update local list so immediate UI updates reflect reliably
  const localList = getFromLocalStorage();
  const existingIdx = localList.findIndex(a => a.id === articleId);
  const fullArticle: NewsArticle = { id: articleId, ...payload };
  if (existingIdx >= 0) {
    localList[existingIdx] = fullArticle;
  } else {
    localList.unshift(fullArticle);
  }
  saveToLocalStorage(localList);

  return articleId;
}

export async function deleteArticle(articleId: string): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, articleId);
    await deleteDoc(docRef);
  } catch (e) {
    console.warn('Firestore delete failed:', e);
  }

  const localList = getFromLocalStorage().filter(a => a.id !== articleId);
  saveToLocalStorage(localList);
}

export async function uploadImageToStorage(file: File): Promise<string> {
  try {
    const fileName = `articles/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.warn('Storage upload error, falling back to base64 data URL:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}

export async function seedInitialArticlesToFirestore(): Promise<{ count: number; message: string }> {
  let count = 0;
  for (const article of INITIAL_NEWS_ARTICLES) {
    try {
      const docRef = doc(db, ARTICLES_COLLECTION, article.id);
      await setDoc(docRef, article, { merge: true });
      count++;
    } catch (e) {
      console.warn('Could not seed article', article.id, e);
    }
  }

  saveToLocalStorage(INITIAL_NEWS_ARTICLES);
  return {
    count,
    message: count > 0 
      ? `सफलतापूर्वक ${count} लेख फ़ायरबेस फायरस्टोर में सुरक्षित किए गए!` 
      : 'स्थानीय डेटा को सक्रिय किया गया (फ़ायरबेस सुरक्षा नियमों की पुष्टि करें).'
  };
}

export async function fetchComments(articleId: string): Promise<CommentItem[]> {
  try {
    const commentsRef = collection(db, COMMENTS_COLLECTION);
    const q = query(commentsRef, where('articleId', '==', articleId), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const items: CommentItem[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() } as CommentItem));
    return items;
  } catch {
    const local = localStorage.getItem(`comments_${articleId}`);
    return local ? JSON.parse(local) : [
      {
        id: 'c-1',
        articleId,
        userName: 'राकेश शर्मा, भोपाल',
        commentText: 'बहुत ही सटीक और निष्पक्ष रिपोर्टिंग। कबीरा न्यूज़ की यही खूबी है।',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      }
    ];
  }
}

export async function addComment(articleId: string, userName: string, commentText: string): Promise<CommentItem> {
  const newComment: CommentItem = {
    id: `comm-${Date.now()}`,
    articleId,
    userName: userName.trim() || 'पाठक',
    commentText: commentText.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    await addDoc(collection(db, COMMENTS_COLLECTION), newComment);
  } catch {
    // Save to local storage
    const current = await fetchComments(articleId);
    current.unshift(newComment);
    localStorage.setItem(`comments_${articleId}`, JSON.stringify(current));
  }

  return newComment;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || `news-${Date.now()}`;
}
