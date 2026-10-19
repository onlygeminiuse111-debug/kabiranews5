import React, { useState } from 'react';
import { Shield, Copy, Check, ExternalLink, Code } from 'lucide-react';

export const FIRESTORE_RULES_CONTENT = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if request is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check if user has admin role
    function isAdmin() {
      return isAuthenticated() &&
        (request.auth.token.role == 'admin' ||
         exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor']);
    }

    // News articles: Public can read published articles; authenticated editors can write
    match /articles/{articleId} {
      allow read: if true;
      allow create, update, delete: if isAuthenticated();
    }

    // Comments: Anyone can read, anyone can submit comments
    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.resource.data.commentText is string && request.resource.data.commentText.size() > 0;
      allow update, delete: if isAuthenticated();
    }

    // User profiles & RBAC
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
    }

    // Site settings
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }
  }
}`;

export const STORAGE_RULES_CONTENT = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /articles/{allPaths=**} {
      // Anyone can view news article images
      allow read: if true;
      // Authenticated users or editors can upload images up to 10MB
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}`;

export const FirebaseRulesView: React.FC = () => {
  const [copiedFirestore, setCopiedFirestore] = useState(false);
  const [copiedStorage, setCopiedStorage] = useState(false);

  const copyFirestoreRules = () => {
    navigator.clipboard.writeText(FIRESTORE_RULES_CONTENT);
    setCopiedFirestore(true);
    setTimeout(() => setCopiedFirestore(false), 2000);
  };

  const copyStorageRules = () => {
    navigator.clipboard.writeText(STORAGE_RULES_CONTENT);
    setCopiedStorage(true);
    setTimeout(() => setCopiedStorage(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm">फ़ायरबेस सुरक्षा नियम (Firebase Security Rules)</h4>
          <p className="mt-1 leading-relaxed">
            कबीरा न्यूज़ के फ़ायरबेस प्रोजेक्ट (<code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 rounded">tactile-sweep-464417-p2</code>) के लिए नीचे दिए गए नियम तैयार हैं। ये नियम सुनिश्चित करते हैं कि आम पाठक बिना किसी रोक-टोक के समाचार पढ़ सकें, जबकि केवल लॉग-इन संपादक ही समाचार बना, बदल या हटा सकें।
          </p>
        </div>
      </div>

      {/* Firestore Rules */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-900 text-white">
        <div className="p-3 bg-gray-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-amber-400" />
            <span className="font-bold">firestore.rules</span>
          </div>
          <button
            onClick={copyFirestoreRules}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            {copiedFirestore ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedFirestore ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
          </button>
        </div>
        <pre className="p-4 text-xs font-mono overflow-x-auto text-gray-300 leading-relaxed">
          {FIRESTORE_RULES_CONTENT}
        </pre>
      </div>

      {/* Storage Rules */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-900 text-white">
        <div className="p-3 bg-gray-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-cyan-400" />
            <span className="font-bold">storage.rules</span>
          </div>
          <button
            onClick={copyStorageRules}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            {copiedStorage ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedStorage ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
          </button>
        </div>
        <pre className="p-4 text-xs font-mono overflow-x-auto text-gray-300 leading-relaxed">
          {STORAGE_RULES_CONTENT}
        </pre>
      </div>
    </div>
  );
};
