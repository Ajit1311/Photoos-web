"use client";

import { useEffect, useState } from "react";

import { getAccessToken } from "@/lib/auth/session";

export default function DebugSessionPage() {

  const [token, setToken] =
    useState("");

  useEffect(() => {

    getAccessToken()
      .then((value) => {

        setToken(
          value ?? "",
        );

      });

  }, []);

  return (

    <main className="p-10">

      <h1 className="text-3xl font-bold">

        Access Token

      </h1>

      <textarea
        readOnly
        value={token}
        className="mt-6 h-96 w-full rounded border p-4 font-mono text-xs"
      />

    </main>

  );

}