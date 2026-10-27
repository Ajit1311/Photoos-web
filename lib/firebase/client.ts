import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCSglk_MkcIID1I_iQZlyNhTmb0Xh9VEjs",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "photoos-e7ae5.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "photoos-e7ae5",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "photoos-e7ae5.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "67532382291",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:67532382291:web:25309fa56b117d67e1a6a6",
};

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

const firebaseApp = getFirebaseApp();

export const firebaseAuth = getAuth(firebaseApp);

export { firebaseApp };
