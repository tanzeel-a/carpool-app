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
 * - Mobile: Hamburger menu with slide-in drawer
 * - Dynamic login/dashboard link based on auth state
 */
export default function Header() {
  // State to track if mobile menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading } = useAuth();

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
        {/* Brand/Logo */}
        <Link href="/" className={styles.brand}>Carpool</Link>

        {/* Desktop Navigation - Hidden on mobile via CSS */}
        <nav className={styles.nav}>
          {!loading && (
            <Link href={authLinkHref}>{authLinkText}</Link>
          )}
        </nav>

        {/* Hamburger Menu Button - Visible only on mobile */}
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {/* Three lines that transform to X when open */}
          <span className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation Drawer - Slides in from right */}
        <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ""}`}>
          {!loading && (
            <Link href={authLinkHref} onClick={() => setIsMenuOpen(false)}>
              {authLinkText}
            </Link>
          )}
        </div>
      </header>

      {/* Dark overlay behind mobile menu - Click to close */}
      {/* Rendered outside header to avoid stacking context issues */}
      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}
    </>
  );
}
