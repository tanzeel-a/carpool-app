"use client";
// Client component directive - required for useState and event handlers in Next.js App Router

import { useState } from "react";
import styles from "./Header.module.css";

/**
 * Header Component
 *
 * Responsive navigation header with:
 * - Desktop: Horizontal nav links
 * - Mobile: Hamburger menu with slide-in drawer
 */
export default function Header() {
  // State to track if mobile menu is open or closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle function for mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <header className={styles.header}>
        {/* Brand/Logo */}
        <span className={styles.brand}>Carpool</span>

        {/* Desktop Navigation - Hidden on mobile via CSS */}
        <nav className={styles.nav}>
          <a href="#story">BOOK A RIDE</a>
          <a href="#login">Login</a>
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
          {/* Close menu when link is clicked */}
          <a href="#story" onClick={() => setIsMenuOpen(false)}>BOOK A RIDE</a>
          <a href="#login" onClick={() => setIsMenuOpen(false)}>Login</a>
        </div>
      </header>

      {/* Dark overlay behind mobile menu - Click to close */}
      {/* Rendered outside header to avoid stacking context issues */}
      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}
    </>
  );
}
