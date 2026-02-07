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

      <footer className={styles.footer}>© 2026 Carpool</footer>
    </div>
  );
}
