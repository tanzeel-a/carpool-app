import styles from "./page.module.css";
import CarScene from "../components/CarScene";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Carpool</span>
        <nav className={styles.nav}>
          <a href="#benefits">Benefits</a>
          <a href="#story">Story</a>
          <button className={styles.cta}>Get early access</button>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Low-traffic mornings</p>
            <h1>Share rides with neighbors. Keep streets quieter.</h1>
            <p className={styles.subcopy}>
              A minimalist carpool experience that makes everyday commutes feel
              lighter. Schedule, match, and ride with a small trusted circle.
            </p>
            <div className={styles.actions}>
              <button className={styles.primary}>Request access</button>
              <button className={styles.secondary}>See the flow</button>
            </div>
            <div className={styles.meta}>
              <div>
                <span className={styles.metaValue}>12 min</span>
                <span className={styles.metaLabel}>avg. saved</span>
              </div>
              <div>
                <span className={styles.metaValue}>3x</span>
                <span className={styles.metaLabel}>less parking</span>
              </div>
              <div>
                <span className={styles.metaValue}>8</span>
                <span className={styles.metaLabel}>rides / week</span>
              </div>
            </div>
          </div>

          <div className={styles.sceneWrap}>
            <div className={styles.sceneFrame}>
              <CarScene className={styles.carScene} />
            </div>
            <div className={styles.sceneCaption}>
              Real low-poly fleet. Real-time three.js render.
            </div>
          </div>
        </section>

        <section id="benefits" className={styles.benefits}>
          <h2>Designed for real neighborhoods.</h2>
          <p>
            Only three steps to coordinate rides, tuned for short distances and
            trusted circles. Keep your mornings focused and your streets open.
          </p>
          <div className={styles.benefitGrid}>
            <div>
              <h3>Private pods</h3>
              <p>Invite-only circles with shared preferences and pickup zones.</p>
            </div>
            <div>
              <h3>Quiet mapping</h3>
              <p>Low-contrast UI that keeps attention on the road.</p>
            </div>
            <div>
              <h3>Schedule light</h3>
              <p>Set it once, reuse the same route across the week.</p>
            </div>
          </div>
        </section>

        <section id="story" className={styles.story}>
          <div>
            <h2>Small fleet. Big impact.</h2>
            <p>
              We built Carpool for people who want to commute together without
              the noise. Lightweight tools, friendly reminders, and a soft
              visual language that respects your time.
            </p>
          </div>
          <button className={styles.primaryAlt}>Join the pilot</button>
        </section>
      </main>

      <footer className={styles.footer}>© 2026 Carpool</footer>
    </div>
  );
}
