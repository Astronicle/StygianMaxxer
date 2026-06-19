"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getToken, AUTH_CHANGE_EVENT } from "../lib/api";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Set initial state on mount (client-only, since localStorage isn't
    // available during SSR).
    setIsLoggedIn(!!getToken());

    // Keep in sync if the token changes anywhere in the app (login,
    // logout, or 401-triggered clearToken on the dashboard).
    function syncAuth() {
      setIsLoggedIn(!!getToken());
    }

    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth); // cross-tab sync

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  return (
    <>
      <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
        <div className="navbar bg-base-200/80 backdrop-blur-md shadow-lg rounded-2xl px-6">
          {/* Left */}
          <div className="navbar-start">
            <Link href="/" className="font-bold text-lg">
              StygianMaxxer
            </Link>
          </div>

          {/* Center (desktop) */}
          <div className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal px-1 gap-2">
              <li>
                <Link href="/stygian">Stygians</Link>
              </li>
              <li>
                <Link href="/boss">Bosses</Link>
              </li>
              <li>
                <Link href="/post">Posts</Link>
              </li>
              <li>
                <Link href="/user">Users</Link>
              </li>
              {isLoggedIn ? (
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link href="/login">Login</Link>
                  </li>
                  <li>
                    <Link href="/signup">Sign Up</Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Right */}
          <div className="navbar-end">
            <Link href="/about">
              <button className="btn btn-primary btn-sm rounded-full">
                About
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
