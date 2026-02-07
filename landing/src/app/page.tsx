import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Carpool</span>
        <nav className={styles.nav}>
          <a href="#story">Story</a>
          <button className={styles.cta}>Get early access</button>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroBackground} />
          <div className={styles.heroTint} />

          <div className={styles.copy}>
            <p className={styles.eyebrow}>Your next ride is closer than you think</p>
            <h1>Share rides with people heading your way</h1>
            <p className={styles.subcopy}>
              Discover travelers nearby going to the same destination. Match instantly, split the fare, and reduce your carbon footprint together.
            </p>
            <div className={styles.actions}>
              <button className={styles.primary}>Find people nearby</button>
              <button className={styles.secondary}>How it works</button>
            </div>
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
          <p className={styles.sceneCaption}>Share the ride. Split the fare. Save the planet.</p>
        </section>

        <div className={styles.ticker}>
          <div className={styles.tickerTrack}>
            <span>Mobile app releasing shortly</span>
            <span>Mobile app releasing shortly</span>
          </div>
        </div>

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

      <footer className={styles.footer}>
        <div className={styles.footerMain}>
          <div className={styles.footerBrand}>
            <h3>Carpool</h3>
            <p>Share the ride. Split the fare. Save the planet.</p>
          </div>

          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <h4>Contact Us</h4>
              <p><a href="tel:+919161148033">+91 9161148033</a></p>
              <p><a href="tel:+916386148537">+91 6386148537</a></p>
            </div>

            <div className={styles.footerColumn}>
              <h4>Write to Us</h4>
              <p><a href="mailto:tanzeel.ahmad@tifr.res.in">tanzeel.ahmad@tifr.res.in</a></p>
              <p>We'd love to hear from you</p>
            </div>

            <div className={styles.footerColumn}>
              <h4>Creators</h4>
              <p>Built with care by</p>
              <p><strong>Harish</strong> & <strong>Tanzeel</strong></p>
            </div>

            <div className={styles.footerColumn}>
              <h4>Coming Soon</h4>
              <p>Mobile App for iOS & Android</p>
              <p>Stay tuned for updates</p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© 2026 Carpool. All rights reserved.</span>
          <div className={styles.footerLinks}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>

        <div className={styles.footerImage}>
          <img src="/assets/footer_city.png" alt="City skyline" />
        </div>
      </footer>
    </div>
  );
}
