import Link from "next/link";
import React from "react";

function Navbar() {
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
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/signup">Sign Up</Link>
              </li>
              <li>
                <Link href="/login">Login</Link>
              </li>
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
