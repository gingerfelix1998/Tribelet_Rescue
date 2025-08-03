import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import TribeletLogo from "../assets/Logos/Tribelet_Logo.png";
import { Outlet, Link } from "react-router-dom";
import { Mail, Instagram, Linkedin } from "lucide-react";

const Layout = () => {
  const { username, setUsername } = useContext(UserContext)

  const handleLogout = () => {
    localStorage.clear();
    setUsername("");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col items-center p-6 font-sans">

      {/* Top strip (logo ticker + user panel) */}
      <div className="sticky top-0 z-50 w-full bg-[#1A1A1A] overflow-hidden h-16 border-b border-gray-700 flex justify-between items-center px-6">
        {/* Logo ticker */}
        <div className="overflow-hidden flex-1">
          <div className="marquee">
            <div className="marquee-content">
              {Array(20).fill(0).map((_, i) => (
                <img
                  key={i}
                  src={TribeletLogo}
                  alt="Tribelet Logo"
                  className="h-10 mx-6 inline-block"
                />
              ))}
            </div>
          </div>
        </div>

        {/* User panel */}
        {username ? (
        <div className="flex items-center gap-3 bg-gray-800 text-white px-3 py-1.5 rounded-full shadow-inner">
          <div className="w-8 h-8 bg-[#A461F9] text-white rounded-full flex items-center justify-center font-bold text-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{username}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-red-400 hover:underline"
          >
            Log out
          </button>
        </div>
      ) : (
        <Link to="/account" className="text-sm text-blue-400 hover:underline">
          Not signed in
        </Link>
      )}
      </div>

      {/* Navigation */}
      <nav className="my-6 space-x-6 text-white font-semibold text-lg">
        <Link to="/">Home</Link>
        <Link to="/account">Login</Link>
        <Link to="/my-teams">My Teams</Link>
        <Link to="/create">Create Team</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/create-kit">Create Kit</Link>
      </nav>

      {/* Page content */}
      <div className="w-full max-w-6xl">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="mt-12 text-gray-500 text-sm w-full flex flex-col items-center">
        <div className="flex space-x-6 mb-2">
          <a href="mailto:hello@tribelet.com" target="_blank" rel="noreferrer">
            <Mail className="w-5 h-5 hover:text-white transition" />
          </a>
          <a href="https://www.instagram.com/tribeletco" target="_blank" rel="noreferrer">
            <Instagram className="w-5 h-5 hover:text-white transition" />
          </a>
          <a href="https://linkedin.com/company/tribelet" target="_blank" rel="noreferrer">
            <Linkedin className="w-5 h-5 hover:text-white transition" />
          </a>
        </div>
        <p className="text-xs">© {new Date().getFullYear()} Tribelet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
