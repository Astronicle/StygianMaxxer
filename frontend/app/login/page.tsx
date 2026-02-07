"use client";

import React from "react";

const page = () => {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
  }

  return (
    <>
      <div>Login</div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" required />
        <input type="email" name="email" placeholder="Email" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
      </form>
    </>
  );
};

export default page;
