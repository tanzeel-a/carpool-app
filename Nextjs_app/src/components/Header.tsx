"use client";
// Client component directive - required for useState and event handlers in Next.js App Router

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import styles from "./Header.module.css";

/**
 * Header Component
 *
 * Responsive navigation header with:
 * - Desktop: Horizontal nav links
 * - Mobile: Hamburger menu with popup dropdown from top
 * - Dynamic login/dashboard link based on auth state
 */
export default function Header() {
  // State to track if mobile menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, signOut } = useAuth();

  // Toggle function for mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Determine auth link text and destination
  const authLinkHref = user ? "/dashboard" : "/login";
  const authLinkText = user ? "Dashboard" : "Login";

  return (
    <>
      <header className={styles.header}>
        {/* Hamburger Menu Button - Visible only on mobile */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Dropdown Menu - Popup from top */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home
            </Link>
            <Link href="/how-it-works" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              How It Works
            </Link>
            {!loading && (
              user ? (
                <>
                  <Link href="/dashboard" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                    </svg>
                    Dashboard
                  </Link>
                  <button className={styles.menuItem} onClick={() => { signOut(); setIsMenuOpen(false); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/login" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Login
                </Link>
              )
            )}
          </div>
        )}

        {/* Brand/Logo */}
        <Link href="/" className={styles.brand}>Carpool</Link>

        {/* Desktop Navigation - Hidden on mobile via CSS */}
        <nav className={styles.nav}>
          {!loading && (
            <Link href={authLinkHref}>{authLinkText}</Link>
          )}
        </nav>
      </header>

      {/* Dark overlay behind mobile menu - Click to close */}
      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}
    </>
  );
}
