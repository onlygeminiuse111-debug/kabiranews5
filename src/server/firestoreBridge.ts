import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ARTICLES_COLLECTION = 'articles';

export async function publishArticleToFirestore(article: any): Promise<void> {
  try {
    const docRef = doc(db, ARTICLES_COLLECTION, article.id);
    await setDoc(docRef, article, { merge: true });
    console.log(`[Firestore] Article successfully written: ${article.id} - "${article.title}"`);
  } catch (error: any) {
    console.warn(`[Firestore] Write warning (local/rules check): ${error?.message || error}`);
  }
}

export async function getPublishedArticlesForSitemap(): Promise<Array<{ id: string; slug?: string; publishedAt: string; title: string }>> {
  try {
    const { collection, getDocs, limit, query } = await import('firebase/firestore');
    const q = query(collection(db, ARTICLES_COLLECTION), limit(100));
    const snap = await getDocs(q);
    const results: Array<{ id: string; slug?: string; publishedAt: string; title: string }> = [];
    snap.forEach((d) => {
      const data = d.data();
      results.push({
        id: d.id,
        slug: data.slug,
        publishedAt: data.publishedAt || new Date().toISOString(),
        title: data.title || '',
      });
    });
    return results;
  } catch (err) {
    return [];
  }
}
