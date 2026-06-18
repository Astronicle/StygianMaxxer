"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiLogin, setToken } from "../lib/api";

const Page = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const usernameOrEmail = formData.get("usernameOrEmail") as string;
    const password = formData.get("password") as string;

    try {
      const res = await apiLogin(usernameOrEmail, password);
      setToken(res.token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-base-content/60">Sign in to continue</p>
        </div>

        {error && (
          <div className="alert alert-error text-sm">{error}</div>
        )}

        <input
          type="text"
          name="usernameOrEmail"
          placeholder="Username or Email"
          required
          className="input input-bordered w-full"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="input input-bordered w-full"
        />

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Page;