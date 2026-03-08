/**
 * How It Works Page
 *
 * Blog-style explanation of the Carpool app
 * Simple language for everyone to understand
 */

import Link from 'next/link';
import Header from '@/components/Header';
import styles from './page.module.css';

export const metadata = {
  title: 'How It Works | Carpool',
  description: 'Learn how Carpool helps you share rides with people heading your way.',
};

export default function HowItWorks() {
  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      <main className={styles.main}>
        {/* Hero */}
        <section className={styles.hero}>
          <span className={styles.badge}>Understanding Carpool</span>
          <h1>How It Works</h1>
          <p className={styles.subtitle}>
            A simple guide to sharing rides and saving money together.
          </p>
        </section>

        {/* Blog Content */}
        <article className={styles.article}>

          {/* Important Disclaimer */}
          <div className={styles.disclaimer}>
            <div className={styles.disclaimerIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <div>
              <h3>Important: We Are Not a Cab Booking App</h3>
              <p>
                Carpool does not provide taxis, drivers, or vehicles. We simply connect people
                who are already going to the same place so they can share a ride together.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section className={styles.section}>
            <h2>What is Carpool?</h2>
            <p>
              Imagine you are standing at a bus stop, waiting to go to the train station.
              There are ten other people standing with you. Some of them might be going to
              the exact same place as you. But you do not know that, and neither do they.
            </p>
            <p>
              Now, what if all of you could share one taxi instead of taking separate ones?
              You would all save money, the roads would have fewer cars, and the air would
              be a little cleaner. That is exactly what Carpool helps you do.
            </p>
            <p>
              <strong>Carpool is a matchmaker for travellers.</strong> It finds people near you
              who are heading in the same direction, so you can share the journey together.
            </p>
          </section>

          {/* Section 2 */}
          <section className={styles.section}>
            <h2>How Does It Work?</h2>
            <p>
              Using Carpool is as simple as ordering food online. Here is what happens:
            </p>

            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <h3>Open the App</h3>
                  <p>
                    When you open Carpool, it shows you a map with your current location.
                    You will see a small, friendly avatar showing where you are standing.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <h3>Enter Your Destination</h3>
                  <p>
                    Type in where you want to go. It could be a railway station, an airport,
                    a shopping mall, or your office. The app will understand and mark it on the map.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <h3>Find People Nearby</h3>
                  <p>
                    Press the &quot;Find Ride&quot; button. The app will look for other people within
                    100 metres of you who are also looking for a ride to a similar destination.
                  </p>
                </div>
              </div>

              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <h3>Match and Meet</h3>
                  <p>
                    When someone nearby matches with you, both of you get notified. You can
                    then meet up, hail a taxi together, and split the fare equally.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className={styles.section}>
            <h2>Why Share a Ride?</h2>
            <p>
              There are three wonderful reasons to share your journey with others:
            </p>

            <div className={styles.benefits}>
              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3>Save Money</h3>
                <p>
                  When two people share a taxi, each person pays only half the fare.
                  When four people share, each pays only a quarter. Your wallet will thank you.
                </p>
              </div>

              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3>Help the Planet</h3>
                <p>
                  Fewer cars on the road means less pollution. By sharing rides, you are
                  doing your small part to keep the air clean and the Earth healthy.
                </p>
              </div>

              <div className={styles.benefit}>
                <div className={styles.benefitIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <h3>Meet New People</h3>
                <p>
                  You might meet someone interesting on your journey. A student, an artist,
                  a scientist, or just a friendly neighbour. Every ride is a chance to connect.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className={styles.section}>
            <h2>What Carpool Does Not Do</h2>
            <p>
              To avoid any confusion, here is what Carpool is <em>not</em>:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>We do not send a car to you.</strong> You will still need to hail
                a taxi, auto-rickshaw, or any other vehicle yourself.
              </li>
              <li>
                <strong>We do not charge for rides.</strong> The fare is between you and
                the taxi driver. We just help you find co-travellers.
              </li>
              <li>
                <strong>We do not guarantee a match.</strong> If no one nearby is going
                your way, you might need to travel alone this time.
              </li>
              <li>
                <strong>We are not responsible for the journey.</strong> Once you match
                with someone, it is your shared adventure.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className={styles.section}>
            <h2>A Real-Life Example</h2>
            <div className={styles.example}>
              <p>
                Let us say you are standing outside a metro station. You want to go to
                the airport, which is 15 kilometres away. A taxi would cost you around
                &#8377;400.
              </p>
              <p>
                You open Carpool and tap &quot;Find Ride to Airport.&quot; The app searches for
                people nearby. It finds Priya, who is just 50 metres away from you, also
                heading to the same airport.
              </p>
              <p>
                You both match. You walk towards each other, wave hello, and together you
                hail a taxi. At the airport, you split the fare. Instead of &#8377;400 each,
                you both pay just &#8377;200.
              </p>
              <p>
                <strong>You saved &#8377;200. Priya saved &#8377;200. The road had one less car.
                Everyone wins.</strong>
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className={styles.cta}>
            <h2>Ready to Start Sharing?</h2>
            <p>
              Join thousands of smart travellers who are saving money and helping
              the environment, one shared ride at a time.
            </p>
            <Link href="/dashboard" className={styles.ctaButton}>
              Try Carpool Now
            </Link>
          </section>

        </article>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2026 Carpool. Share the ride. Split the fare. Save the planet.</p>
        <Link href="/">Back to Home</Link>
      </footer>
    </div>
  );
}
