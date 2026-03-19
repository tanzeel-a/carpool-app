/**
 * Privacy Policy Page
 * Legal document outlining data collection, usage, and user rights
 */

import Link from 'next/link';
import Header from '@/components/Header';
import styles from './page.module.css';

export const metadata = {
  title: 'Privacy Policy | Carpool',
  description: 'Privacy Policy for Carpool - Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicy() {
  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <span className={styles.badge}>Legal</span>
            <h1>Privacy Policy</h1>
            <p className={styles.lastUpdated}>Last Updated: March 20, 2026</p>
          </header>

          <div className={styles.content}>
            {/* Introduction */}
            <section className={styles.section}>
              <h2>1. Introduction</h2>
              <p>
                Welcome to Carpool (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you use our mobile application and website
                (collectively, the &ldquo;Service&rdquo;). Please read this Privacy Policy carefully. By accessing or using
                the Service, you acknowledge that you have read, understood, and agree to be bound by this
                Privacy Policy.
              </p>
              <p>
                Carpool is a ride-sharing matchmaking platform that connects travelers heading to similar
                destinations. We do not provide transportation services, vehicles, or drivers. We facilitate
                connections between users who wish to share rides and split fares.
              </p>
            </section>

            {/* Information We Collect */}
            <section className={styles.section}>
              <h2>2. Information We Collect</h2>

              <h3>2.1 Personal Information</h3>
              <p>When you create an account or use our Service, we may collect the following information:</p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, profile photograph (via Google Sign-In)</li>
                <li><strong>Location Data:</strong> Real-time geographic location to match you with nearby travelers</li>
                <li><strong>Destination Information:</strong> Places you search for and travel to</li>
                <li><strong>Communication Data:</strong> Messages exchanged with other users through our platform</li>
              </ul>

              <h3>2.2 Automatically Collected Information</h3>
              <p>When you access our Service, we automatically collect:</p>
              <ul>
                <li>Device information (device type, operating system, unique device identifiers)</li>
                <li>Log data (access times, pages viewed, app crashes)</li>
                <li>Usage patterns and preferences</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className={styles.section}>
              <h2>3. How We Use Your Information</h2>
              <p>We use the collected information for the following purposes:</p>
              <ul>
                <li><strong>Matchmaking:</strong> To connect you with other users traveling to similar destinations within your specified radius (50m to 1km)</li>
                <li><strong>Communication:</strong> To facilitate secure messaging between matched users</li>
                <li><strong>Service Improvement:</strong> To analyze usage patterns and improve our platform</li>
                <li><strong>Safety:</strong> To detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </section>

            {/* End-to-End Encryption */}
            <section className={styles.section}>
              <h2>4. Message Security &amp; End-to-End Encryption</h2>
              <div className={styles.highlight}>
                <p>
                  <strong>Your conversations are protected.</strong> All messages exchanged between users on the
                  Carpool platform are secured using end-to-end encryption (E2EE). This means:
                </p>
                <ul>
                  <li>Only you and the person you are communicating with can read your messages</li>
                  <li>Carpool cannot access the content of your encrypted messages</li>
                  <li>Messages are encrypted on your device before transmission and can only be decrypted by the intended recipient</li>
                  <li>Even if our servers were compromised, your message content would remain protected</li>
                </ul>
              </div>
              <p>
                Location sharing within chats is optional and requires explicit user action. When you choose
                to share your location with another user, this information is transmitted securely.
              </p>
            </section>

            {/* Location Data */}
            <section className={styles.section}>
              <h2>5. Location Data</h2>
              <p>
                Location data is essential to our Service. We use your location to:
              </p>
              <ul>
                <li>Display your position on the map</li>
                <li>Find other users within your selected search radius</li>
                <li>Calculate distances between users</li>
                <li>Show nearby people heading to similar destinations</li>
              </ul>
              <p>
                <strong>Your location is only shared with other users when you are actively using the app
                and have the app open.</strong> We use geohashing technology to efficiently query nearby
                users while minimizing data exposure. Your precise location is only visible to users
                within your immediate vicinity.
              </p>
              <p>
                Presence data (your online status and location) is automatically cleared when you close
                the app or after 2 minutes of inactivity.
              </p>
            </section>

            {/* Data Sharing */}
            <section className={styles.section}>
              <h2>6. Information Sharing and Disclosure</h2>
              <p>We do not sell your personal information. We may share your information in the following circumstances:</p>

              <h3>6.1 With Other Users</h3>
              <ul>
                <li>Your display name and profile photo are visible to nearby users</li>
                <li>Your approximate location is shown on the map to users within your search radius</li>
                <li>Your destination (if broadcast) is visible to help others identify matching routes</li>
              </ul>

              <h3>6.2 Service Providers</h3>
              <p>
                We use third-party services to operate our platform, including:
              </p>
              <ul>
                <li><strong>Google Firebase:</strong> Authentication, database, and hosting services</li>
                <li><strong>Google Maps Platform:</strong> Map display and location services</li>
              </ul>
              <p>These providers are bound by their own privacy policies and data protection obligations.</p>

              <h3>6.3 Legal Requirements</h3>
              <p>
                We may disclose your information if required by law, court order, or governmental authority,
                or when we believe disclosure is necessary to protect our rights, your safety, or the
                safety of others.
              </p>
            </section>

            {/* Data Retention */}
            <section className={styles.section}>
              <h2>7. Data Retention</h2>
              <p>We retain your information as follows:</p>
              <ul>
                <li><strong>Account Data:</strong> Retained until you delete your account</li>
                <li><strong>Chat Messages:</strong> Retained until the chat is ended by either participant</li>
                <li><strong>Location Data:</strong> Real-time only; cleared after 2 minutes of inactivity</li>
                <li><strong>Match Requests:</strong> Automatically expire after 30 seconds if not accepted</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className={styles.section}>
              <h2>8. Your Rights and Choices</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                <li><strong>Location Control:</strong> Disable location services through your device settings</li>
                <li><strong>Block Users:</strong> Block specific users from seeing your profile or contacting you</li>
              </ul>
              <p>
                To exercise these rights, please contact us at <a href="mailto:privacy@carpool.app">privacy@carpool.app</a>.
              </p>
            </section>

            {/* Security */}
            <section className={styles.section}>
              <h2>9. Security Measures</h2>
              <p>We implement appropriate technical and organizational measures to protect your information:</p>
              <ul>
                <li>End-to-end encryption for all user communications</li>
                <li>Secure HTTPS connections for all data transmission</li>
                <li>Firebase Security Rules to control data access</li>
                <li>Regular security audits and updates</li>
                <li>Automatic session expiration</li>
              </ul>
              <p>
                While we strive to protect your information, no method of electronic transmission or
                storage is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            {/* Children */}
            <section className={styles.section}>
              <h2>10. Children&apos;s Privacy</h2>
              <p>
                Our Service is not intended for children under the age of 18. We do not knowingly collect
                personal information from children. If you are a parent or guardian and believe your child
                has provided us with personal information, please contact us immediately.
              </p>
            </section>

            {/* International */}
            <section className={styles.section}>
              <h2>11. International Data Transfers</h2>
              <p>
                Our Service is primarily operated in India. If you access our Service from outside India,
                please be aware that your information may be transferred to, stored, and processed in India
                where our servers are located. By using our Service, you consent to such transfer.
              </p>
            </section>

            {/* Changes */}
            <section className={styles.section}>
              <h2>12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material
                changes by posting the new Privacy Policy on this page and updating the &ldquo;Last Updated&rdquo;
                date. Your continued use of the Service after any changes constitutes acceptance of the
                updated Privacy Policy.
              </p>
            </section>

            {/* Contact */}
            <section className={styles.section}>
              <h2>13. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our data
                practices, please contact us at:
              </p>
              <div className={styles.contactInfo}>
                <p><strong>Carpool</strong></p>
                <p>Email: <a href="mailto:privacy@carpool.app">privacy@carpool.app</a></p>
                <p>General Inquiries: <a href="mailto:gitpushscience@gmail.com">gitpushscience@gmail.com</a></p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className={styles.section}>
              <h2>14. Acknowledgment</h2>
              <p>
                By using Carpool, you acknowledge that:
              </p>
              <ul>
                <li>Carpool is a matchmaking service that connects travelers; we do not provide transportation</li>
                <li>You are responsible for your own safety when meeting and traveling with other users</li>
                <li>Fare splitting arrangements are made directly between users and taxi/auto drivers</li>
                <li>We do not guarantee successful matches or the conduct of other users</li>
              </ul>
            </section>
          </div>

          <footer className={styles.articleFooter}>
            <Link href="/" className={styles.backLink}>
              &larr; Back to Home
            </Link>
            <Link href="/terms" className={styles.termsLink}>
              Terms of Service &rarr;
            </Link>
          </footer>
        </article>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 Carpool. All rights reserved.</p>
      </footer>
    </div>
  );
}
