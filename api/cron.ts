import { runIngestionCycle, getAutomationState, setOnPublishArticleCallback } from '../src/server/automationEngine';
import { publishArticleToFirestore } from '../src/server/firestoreBridge';

// Connect automation callback to Firestore
setOnPublishArticleCallback(async (article) => {
  await publishArticleToFirestore(article);
});

export default async function handler(req: any, res: any) {
  try {
    const result = await runIngestionCycle();
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
      automation: getAutomationState(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Automation run failed',
    });
  }
}
