import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Allows e2e / offline runs to force local-only mode regardless of .env.local.
const firebaseDisabled = import.meta.env.VITE_DISABLE_FIREBASE === '1'

export const isFirebaseConfigured =
  !firebaseDisabled &&
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  )

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null

export const firebaseApp = app
export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
