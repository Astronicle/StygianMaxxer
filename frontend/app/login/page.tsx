"use client";

import React from "react";

const Page = () => {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-semibold">Login</h1>
          <p className="text-base-content/60">
            Sign in to continue
          </p>
        </div>

        <input
          type="text"
          name="username"
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
          className="btn btn-primary w-full"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Page;