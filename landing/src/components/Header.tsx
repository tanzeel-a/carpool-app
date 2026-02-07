"use client";

import { useState } from "react";
import styles from "./Header.module.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.header}>
      <span className={styles.brand}>Carpool</span>

      <nav className={styles.nav}>
        <a href="#story">BOOK A RIDE</a>
        <a href="#login">Login</a>
      </nav>

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

      <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ""}`}>
        <a href="#story" onClick={() => setIsMenuOpen(false)}>BOOK A RIDE</a>
        <a href="#login" onClick={() => setIsMenuOpen(false)}>Login</a>
      </div>

      {isMenuOpen && <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />}
    </header>
  );
}
