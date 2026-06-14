"use client";

import React from "react";

const Page = () => {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
  }

  return (
    <div className="flex justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4"
      >
        <div>
          <h1 className="text-2xl font-semibold">Sign Up</h1>
          <p className="text-base-content/60">
            Create your account
          </p>
        </div>

        <input
          type="text"
          name="username"
          placeholder="Username"
          required
          className="input input-bordered w-full"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
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
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Page;