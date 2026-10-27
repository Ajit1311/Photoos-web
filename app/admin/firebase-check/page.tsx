"use client";

import { useEffect, useState } from "react";

import {
  getFirebaseCurrentUser,
  subscribeToFirebaseAuth,
} from "@/lib/auth/firebase-auth.service";

export default function FirebaseCheckPage() {
  const [user, setUser] = useState<{
    uid: string;
    email: string | null;
    emailVerified: boolean;
  } | null>(null);

  useEffect(() => {
    const update = (
      currentUser: ReturnType<
        typeof getFirebaseCurrentUser
      >,
    ) => {
      setUser(
        currentUser
          ? {
              uid: currentUser.uid,
              email: currentUser.email,
              emailVerified:
                currentUser.emailVerified,
            }
          : null,
      );
    };

    update(getFirebaseCurrentUser());

    return subscribeToFirebaseAuth(update);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
      <pre className="rounded-xl bg-white p-8 shadow">
        {JSON.stringify(user, null, 2)}
      </pre>
    </main>
  );
}
