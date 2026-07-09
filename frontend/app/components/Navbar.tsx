"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { getToken, AUTH_CHANGE_EVENT } from "../lib/api";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const links = (
    <>
      <li>
        <Link href="/stygian" onClick={() => setMobileOpen(false)}>Stygians</Link>
      </li>
      <li>
        <Link href="/boss" onClick={() => setMobileOpen(false)}>Bosses</Link>
      </li>
      <li>
        <Link href="/post" onClick={() => setMobileOpen(false)}>Posts</Link>
      </li>
      <li>
        <Link href="/user" onClick={() => setMobileOpen(false)}>Users</Link>
      </li>
      {isLoggedIn ? (
        <li>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
        </li>
      ) : (
        <>
          <li>
            <Link href="/login" onClick={() => setMobileOpen(false)}>Login</Link>
          </li>
          <li>
            <Link href="/signup" onClick={() => setMobileOpen(false)}>Sign Up</Link>
          </li>
        </>
      )}
      <li className="lg:hidden">
        <Link href="/about" onClick={() => setMobileOpen(false)}>About</Link>
      </li>
    </>
  );

  return (
    <>
      <div className="fixed top-0 sm:top-4 left-0 sm:left-1/2 right-0 sm:right-auto z-50 sm:-translate-x-1/2 px-3 sm:px-0 pt-3 sm:pt-0">
        <div className="bg-base-200/90 backdrop-blur-md shadow-lg rounded-2xl max-w-full sm:max-w-none mx-auto sm:w-auto">
          <div className="navbar px-4 sm:px-6">
            {/* Left */}
            <div className="navbar-start">
              <Link href="/" className="font-bold text-base sm:text-lg whitespace-nowrap">
                StygianMaxxer
              </Link>
            </div>

            {/* Center (desktop) */}
            <div className="navbar-center hidden lg:flex">
              <ul className="menu menu-horizontal px-1 gap-2">{links}</ul>
            </div>

            {/* Right */}
            <div className="navbar-end gap-2">
              <Link href="/about" className="hidden lg:inline-flex">
                <button className="btn btn-primary btn-sm rounded-full">
                  About
                </button>
              </Link>
              <button
                className="btn btn-ghost btn-sm btn-circle lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          {mobileOpen && (
            <div className="lg:hidden px-4 pb-4 pt-2 border-t border-base-300">
              <ul className="menu menu-vertical w-full gap-1">{links}</ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Navbar;
