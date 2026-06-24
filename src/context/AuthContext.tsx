import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '../firebase/config'
import { googleSignInWithFallback } from '../lib/googleAuth'
import type { Streak } from '../types/lesson'

type AuthContextValue = {
  user: User | null
  loading: boolean
  displayName: string | null
  signUp: (email: string, password: string, name: string) => Promise<void>
  logIn: (email: string, password: string) => Promise<void>
  logInWithGoogle: () => Promise<void>
  logOut: () => Promise<void>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [displayName, setDisplayName] = useState<string | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false)
      return
    }
    const activeAuth = auth
    const activeDb = db

    const unsubscribe = onAuthStateChanged(activeAuth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const profileRef = doc(activeDb, 'users', firebaseUser.uid)
          const profileDoc = await getDoc(profileRef)
          if (profileDoc.exists()) {
            setDisplayName(profileDoc.data().name ?? firebaseUser.displayName)
          } else {
            // First sign-in (e.g. via Google): create the profile document.
            const name = firebaseUser.displayName ?? firebaseUser.email ?? 'Learner'
            const streak: Streak = { count: 0, lastActiveDate: '' }
            await setDoc(
              profileRef,
              { name, email: firebaseUser.email ?? '', streak },
              { merge: true },
            )
            setDisplayName(name)
          }
        } catch (err) {
          // A Firestore/rules hiccup must not trap a signed-in user on /login.
          console.error('Failed to load user profile', err)
          setDisplayName(firebaseUser.displayName ?? firebaseUser.email ?? null)
        }
      } else {
        setDisplayName(null)
      }
      setLoading(false)
    })

    // Complete any pending redirect-based sign-in (mobile / popup-blocked path).
    getRedirectResult(activeAuth).catch((err) => {
      console.error('Google redirect sign-in failed', err)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!auth || !db) throw new Error('Firebase not configured')
    const credential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(credential.user, { displayName: name })
    const streak: Streak = { count: 0, lastActiveDate: '' }
    await setDoc(doc(db, 'users', credential.user.uid), {
      name,
      email,
      streak,
    })
    setDisplayName(name)
  }, [])

  const logIn = useCallback(async (email: string, password: string) => {
    if (!auth) throw new Error('Firebase not configured')
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const logInWithGoogle = useCallback(async () => {
    if (!auth) throw new Error('Firebase not configured')
    const activeAuth = auth
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    // Try popup first; fall back to redirect only if the browser can't show one.
    // The profile doc is created by the onAuthStateChanged handler if missing.
    await googleSignInWithFallback(
      () => signInWithPopup(activeAuth, provider),
      () => signInWithRedirect(activeAuth, provider),
    )
  }, [])

  const logOut = useCallback(async () => {
    if (!auth) throw new Error('Firebase not configured')
    await signOut(auth)
  }, [])

  const value = useMemo(
    () => ({
      user,
      loading,
      displayName,
      signUp,
      logIn,
      logInWithGoogle,
      logOut,
      isConfigured: isFirebaseConfigured,
    }),
    [user, loading, displayName, signUp, logIn, logInWithGoogle, logOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
