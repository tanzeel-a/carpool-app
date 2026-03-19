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
import AnimatedStats from "../components/AnimatedStats";

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
              <a href="/dashboard" className={styles.primary}>Find people nearby</a>
              <a href="/how-it-works" className={styles.secondary}>How it works</a>
            </div>

            {/* Key statistics - animated counters */}
            <AnimatedStats />
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
          <a href="/dashboard" className={styles.primaryAlt}>Go to Dashboard</a>
        </section>
      </main>

      {/* ============================================
          FOOTER
          - Dark background with cityscape image
          - Social links and feedback
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

          {/* Footer content grid */}
          <div className={styles.footerContent}>
            {/* Social Links */}
            <div className={styles.footerSocials}>
              <h4>Connect With Us</h4>
              <div className={styles.socialIcons}>
                <a
                  href="https://github.com/tanzeel-a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="GitHub"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/tanzeel-ahmad-993460212/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/Tanzeel_x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label="X (Twitter)"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Creator */}
            <div className={styles.footerCreators}>
              <h4>Created By</h4>
              <p className={styles.creatorName}>Tanzeel</p>
              <p className={styles.creatorTagline}>Building the future, one ride at a time.</p>
            </div>

            {/* Feedback */}
            <div className={styles.footerFeedback}>
              <h4>We&apos;d Love Your Feedback</h4>
              <a
                href="mailto:gitpushscience@gmail.com?subject=Carpool%20Feedback&body=Hi%20Carpool%20Team%2C%0A%0AI%20would%20like%20to%20share%20some%20feedback%3A%0A%0A"
                className={styles.feedbackBtn}
              >
                Send Feedback
              </a>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className={styles.footerBottom}>
          <span>© 2026 Carpool. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
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
