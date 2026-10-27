import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithEmailLink,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

async function ensurePersistence(): Promise<void> {
  await setPersistence(
    firebaseAuth,
    browserLocalPersistence,
  );
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  await ensurePersistence();

  const credential =
    await signInWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    );

  return credential.user;
}

export async function createFirebaseAccount(
  email: string,
  password: string,
): Promise<User> {
  await ensurePersistence();

  const credential =
    await createUserWithEmailAndPassword(
      firebaseAuth,
      email.trim(),
      password,
    );

  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  await ensurePersistence();

  const provider =
    new GoogleAuthProvider();

  provider.setCustomParameters({
    prompt: "select_account",
  });

  const credential =
    await signInWithPopup(
      firebaseAuth,
      provider,
    );

  return credential.user;
}

export async function sendFirebaseEmailLink(
  email: string,
): Promise<void> {
  const actionCodeSettings = {
    url: `${window.location.origin}/auth/email-link`,
    handleCodeInApp: true,
  };

  await sendSignInLinkToEmail(
    firebaseAuth,
    email.trim(),
    actionCodeSettings,
  );

  window.localStorage.setItem(
    "photoos_email_for_signin",
    email.trim(),
  );
}

export function isFirebaseEmailLink(
  url: string,
): boolean {
  return isSignInWithEmailLink(
    firebaseAuth,
    url,
  );
}

export async function completeFirebaseEmailLink(
  email: string,
  url: string,
): Promise<User> {
  await ensurePersistence();

  const credential =
    await signInWithEmailLink(
      firebaseAuth,
      email.trim(),
      url,
    );

  window.localStorage.removeItem(
    "photoos_email_for_signin",
  );

  return credential.user;
}

export async function sendFirebasePasswordReset(
  email: string,
): Promise<void> {
  await sendPasswordResetEmail(
    firebaseAuth,
    email.trim(),
  );
}

export async function getFirebaseIdToken(
  forceRefresh = false,
): Promise<string | null> {
  const user =
    firebaseAuth.currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken(forceRefresh);
}

export function subscribeToFirebaseAuth(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(
    firebaseAuth,
    callback,
  );
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(firebaseAuth);
}

export function getFirebaseCurrentUser(): User | null {
  return firebaseAuth.currentUser;
}
