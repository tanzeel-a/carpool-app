/**
 * Carpool Landing Page
 *
 * Main landing page for the Carpool app featuring:
 * - Hero section with background image and CTA
 * - Scrolling ticker announcement
 * - Story/About section
 * - Footer with contact info and cityscape image
 */

import styles from "./page.module.css";
import Header from "../components/Header";

export default function Home() {
  return (
    <div className={styles.page}>
      {/* ============================================
          HEADER - Responsive navigation component
          ============================================ */}
      <Header />

      <main className={styles.main}>
        {/* ============================================
            HERO SECTION
            - Background image with gradient overlay
            - Main headline and subtext
            - CTA buttons
            - Statistics display
            ============================================ */}
        <section className={styles.hero}>
          {/* Background image layer */}
          <div className={styles.heroBackground} />
          {/* Dark gradient overlay for text readability */}
          <div className={styles.heroTint} />

          {/* Hero content */}
          <div className={styles.copy}>
            {/* Eyebrow text - small tagline above heading */}
            <p className={styles.eyebrow}>Your next ride is closer than you think</p>

            {/* Main headline - animated gold gradient text */}
            <h1>Share rides with people heading your way</h1>

            {/* Supporting description */}
            <p className={styles.subcopy}>
              Discover travelers nearby going to the same destination. Match instantly, split the fare, and reduce your carbon footprint together.
            </p>

            {/* Call-to-action buttons */}
            <div className={styles.actions}>
              <button className={styles.primary}>Find people nearby</button>
              <button className={styles.secondary}>How it works</button>
            </div>

            {/* Key statistics - 3 column grid */}
            <div className={styles.meta}>
              <div>
                <span className={styles.metaValue}>50%</span>
                <span className={styles.metaLabel}>less fare</span>
              </div>
              <div>
                <span className={styles.metaValue}>2x</span>
                <span className={styles.metaLabel}>less emissions</span>
              </div>
              <div>
                <span className={styles.metaValue}>100m</span>
                <span className={styles.metaLabel}>match radius</span>
              </div>
            </div>
          </div>

          {/* Tagline badge at bottom right */}
          <p className={styles.sceneCaption}>Share the ride. Split the fare. Save the planet.</p>
        </section>

        {/* ============================================
            SCROLLING TICKER
            - Announcement banner with infinite scroll
            - Gold background
            ============================================ */}
        <div className={styles.ticker}>
          {/* Track contains duplicated text for seamless loop */}
          <div className={styles.tickerTrack}>
            <span>Mobile app releasing shortly</span>
            <span>Mobile app releasing shortly</span>
          </div>
        </div>

        {/* ============================================
            STORY SECTION
            - Dark themed section
            - Mission statement and CTA
            ============================================ */}
        <section id="story" className={styles.story}>
          <div>
            <h2>Stop traveling alone. Start saving together.</h2>
            <p>
              At any bus stop, train station, or street corner, there are people heading your way.
              You just don't know it yet. We connect you with nearby travelers in real-time,
              so you can share a cab, split the cost, and cut emissions — all in seconds.
            </p>
          </div>
          <button className={styles.primaryAlt}>Get early access</button>
        </section>
      </main>

      {/* ============================================
          FOOTER
          - Dark background with cityscape image
          - Contact information grid
          - Copyright and legal links
          ============================================ */}
      <footer className={styles.footer}>
        {/* Main footer content */}
        <div className={styles.footerMain}>
          {/* Brand and tagline */}
          <div className={styles.footerBrand}>
            <h3>Carpool</h3>
            <p>Share the ride. Split the fare. Save the planet.</p>
          </div>

          {/* Contact info grid - 3 columns */}
          <div className={styles.footerGrid}>
            {/* Phone numbers */}
            <div className={styles.footerColumn}>
              <h4>Contact Us</h4>
              <p><a href="tel:+919161148033">+91 9161148033</a></p>
              <p><a href="tel:+916386148537">+91 6386148537</a></p>
            </div>

            {/* Email */}
            <div className={styles.footerColumn}>
              <h4>Write to Us</h4>
              <p><a href="mailto:tanzeel.ahmad@tifr.res.in">tanzeel.ahmad@tifr.res.in</a></p>
            </div>

            {/* Creators */}
            <div className={styles.footerColumn}>
              <h4>Creators</h4>
              <p><strong>Harish</strong> & <strong>Tanzeel</strong></p>
            </div>

          </div>
        </div>

        {/* Copyright bar */}
        <div className={styles.footerBottom}>
          <span>© 2026 Carpool. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>

        {/* Cityscape image - grayscale, positioned at bottom */}
        <div className={styles.footerImage}>
          <img src="/assets/footer_city.png" alt="City skyline" />
        </div>
      </footer>
    </div>
  );
}
