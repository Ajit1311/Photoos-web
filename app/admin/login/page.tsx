"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  loginPlatformAdmin,
} from "@/lib/api/platform-admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [
    userId,
    setUserId,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result =
        await loginPlatformAdmin(
          userId,
          password,
        );

      if (
        result.data?.must_change_password
      ) {
        router.replace(
          "/admin/change-password",
        );
        return;
      }

      router.replace("/admin");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Admin login failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0F589B] shadow-lg">
            <img
              src="/PhotoOS-brand-master.png"
              alt="PhotoOS"
              className="h-[78%] w-[78%] object-contain"
            />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900">
            PhotoOS Admin
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Sign in with your administrator credentials.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Admin User ID
            </label>

            <input
              type="text"
              value={userId}
              onChange={(event) =>
                setUserId(
                  event.target.value.toUpperCase(),
                )
              }
              required
              autoFocus
              autoComplete="username"
              placeholder="PX-ADMIN-000001"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 uppercase outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-12 outline-none transition focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((value) => !value)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0A3F61] px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-400">
          PhotoOS Platform Administration
        </div>
      </div>
    </main>
  );
}
