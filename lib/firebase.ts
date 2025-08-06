import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, connectAuthEmulator, type Auth } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore"
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyAEvPBMq5wdHMTS-zL2075A8rAThrNSWf4",
  authDomain: "tutorium-a994f.firebaseapp.com",
  projectId: "tutorium-a994f",
  storageBucket: "tutorium-a994f.appspot.com",
  messagingSenderId: "80649296627",
  appId: "1:80649296627:web:982006ca3968340e023586"
}

// Initialize Firebase app (singleton pattern)
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApp()
}

// Initialize services
export const auth: Auth = getAuth(app)
export const db: Firestore = getFirestore(app)
export const storage: FirebaseStorage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// Configure Google Auth Provider
googleProvider.addScope("email")
googleProvider.addScope("profile")
googleProvider.setCustomParameters({
  prompt: "select_account",
})

// Connect to emulators in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    // Only connect if not already connected
    if (!auth.config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    }
    // @ts-ignore - _delegate is internal but needed for emulator check
    if (!db._delegate._databaseId.projectId.includes("demo-")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }
    // @ts-ignore - similar internal check for storage
    if (!storage._location.bucket.includes("demo-")) {
      connectStorageEmulator(storage, "localhost", 9199)
    }
  } catch (error) {
    console.warn("Firebase emulator connection failed:", error)
  }
}

export default app
