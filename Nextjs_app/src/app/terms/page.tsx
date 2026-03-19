/**
 * Terms of Service Page
 * Legal document outlining terms and conditions for using Carpool
 */

import Link from 'next/link';
import Header from '@/components/Header';
import styles from './page.module.css';

export const metadata = {
  title: 'Terms of Service | Carpool',
  description: 'Terms of Service for Carpool - Read our terms and conditions for using the ride-sharing matchmaking platform.',
};

export default function TermsOfService() {
  return (
    <div className={styles.page}>
      <div className={styles.headerWrapper}>
        <Header />
      </div>

      <main className={styles.main}>
        <article className={styles.article}>
          <header className={styles.hero}>
            <span className={styles.badge}>Legal</span>
            <h1>Terms of Service</h1>
            <p className={styles.lastUpdated}>Last Updated: March 20, 2026</p>
          </header>

          <div className={styles.content}>
            {/* Agreement */}
            <section className={styles.section}>
              <h2>1. Agreement to Terms</h2>
              <p>
                By accessing or using Carpool (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of
                Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, you may not access or use the
                Service. These Terms constitute a legally binding agreement between you and Carpool.
              </p>
            </section>

            {/* Description of Service */}
            <section className={styles.section}>
              <h2>2. Description of Service</h2>
              <div className={styles.highlight}>
                <p><strong>IMPORTANT NOTICE:</strong></p>
                <p>
                  Carpool is a <strong>matchmaking platform</strong> that connects travelers heading to similar
                  destinations. We do NOT provide:
                </p>
                <ul>
                  <li>Transportation services</li>
                  <li>Vehicles or drivers</li>
                  <li>Taxi booking or dispatch</li>
                  <li>Ride-hailing services</li>
                </ul>
              </div>
              <p>
                Our Service enables users to discover other nearby individuals who are traveling in the same
                direction, facilitating the opportunity to share a taxi, auto-rickshaw, or other transportation
                and split the associated costs. The actual transportation arrangement is made independently
                between users and third-party transportation providers.
              </p>
            </section>

            {/* Eligibility */}
            <section className={styles.section}>
              <h2>3. Eligibility</h2>
              <p>To use our Service, you must:</p>
              <ul>
                <li>Be at least 16 years of age</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
                <li>Not be prohibited from using the Service under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section className={styles.section}>
              <h2>4. Account Registration</h2>
              <p>
                You must create an account to use certain features of the Service. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>
              <p>
                We use Google Sign-In for authentication. By using Google Sign-In, you also agree to
                Google&apos;s Terms of Service and Privacy Policy.
              </p>
            </section>

            {/* User Conduct */}
            <section className={styles.section}>
              <h2>5. User Conduct</h2>
              <p>When using our Service, you agree NOT to:</p>
              <ul>
                <li>Impersonate any person or entity, or misrepresent your affiliation</li>
                <li>Harass, threaten, or intimidate other users</li>
                <li>Share false or misleading information about your location or destination</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to the Service or other users&apos; accounts</li>
                <li>Interfere with or disrupt the Service or its servers</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use automated systems or software to access the Service</li>
                <li>Engage in any form of discrimination based on race, gender, religion, nationality, disability, or any other protected characteristic</li>
              </ul>
              <p>
                Violation of these conduct guidelines may result in immediate termination of your account.
              </p>
            </section>

            {/* Safety */}
            <section className={styles.section}>
              <h2>6. Safety and Responsibility</h2>
              <div className={styles.highlight}>
                <p><strong>YOUR SAFETY IS YOUR RESPONSIBILITY</strong></p>
                <p>
                  When meeting and traveling with other users, you acknowledge that:
                </p>
                <ul>
                  <li>You are meeting strangers and should exercise appropriate caution</li>
                  <li>Carpool does not verify the identity, background, or intentions of users</li>
                  <li>You should meet in public places and inform others of your plans</li>
                  <li>Any disputes with co-travelers or transportation providers are between you and them</li>
                </ul>
              </div>
              <p>
                We recommend the following safety practices:
              </p>
              <ul>
                <li>Meet matched users in well-lit, public areas</li>
                <li>Share your ride details with a trusted friend or family member</li>
                <li>Trust your instincts—if something feels wrong, do not proceed</li>
                <li>Use licensed taxis or auto-rickshaws from reputable providers</li>
                <li>Agree on fare-splitting arrangements before starting the journey</li>
              </ul>
            </section>

            {/* Communications */}
            <section className={styles.section}>
              <h2>7. User Communications</h2>
              <p>
                Our Service provides messaging functionality to facilitate coordination between matched users.
                All messages are protected by end-to-end encryption. You agree to:
              </p>
              <ul>
                <li>Use messaging only for legitimate ride coordination purposes</li>
                <li>Not send spam, solicitations, or inappropriate content</li>
                <li>Not share personal contact information until you are comfortable doing so</li>
                <li>Report any abusive or suspicious communications</li>
              </ul>
            </section>

            {/* Fees */}
            <section className={styles.section}>
              <h2>8. Fees and Payments</h2>
              <p>
                <strong>Carpool is currently free to use.</strong> We do not charge any fees for using our
                matchmaking service.
              </p>
              <p>
                Any financial transactions related to shared rides (such as fare splitting) occur directly
                between users and transportation providers. Carpool is not a party to these transactions
                and bears no responsibility for payment disputes.
              </p>
              <p>
                We reserve the right to introduce fees or premium features in the future, with appropriate
                notice to users.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className={styles.section}>
              <h2>9. Intellectual Property</h2>
              <p>
                The Service, including its original content, features, and functionality, is owned by
                Carpool and is protected by international copyright, trademark, and other intellectual
                property laws. You may not:
              </p>
              <ul>
                <li>Copy, modify, or distribute the Service without authorization</li>
                <li>Use the Carpool name, logo, or branding without written permission</li>
                <li>Reverse engineer or attempt to extract source code from the Service</li>
              </ul>
            </section>

            {/* Disclaimers */}
            <section className={styles.section}>
              <h2>10. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
                EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul>
                <li>WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE</li>
                <li>WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE</li>
                <li>WARRANTIES REGARDING THE ACCURACY OR RELIABILITY OF INFORMATION</li>
                <li>WARRANTIES REGARDING THE CONDUCT OF OTHER USERS</li>
              </ul>
              <p>
                We do not guarantee that you will find a match, that matches will be suitable, or that
                shared rides will proceed without incident.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section className={styles.section}>
              <h2>11. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, CARPOOL SHALL NOT BE LIABLE FOR:
              </p>
              <ul>
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Any loss of profits, data, or goodwill</li>
                <li>Any damages arising from your interactions with other users</li>
                <li>Any damages arising from third-party transportation services</li>
                <li>Personal injury or property damage resulting from shared rides</li>
              </ul>
              <p>
                In jurisdictions where limitations on liability are not permitted, our liability shall be
                limited to the maximum extent permitted by law.
              </p>
            </section>

            {/* Indemnification */}
            <section className={styles.section}>
              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Carpool, its officers, directors,
                employees, and agents from any claims, damages, losses, or expenses (including reasonable
                legal fees) arising from:
              </p>
              <ul>
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your interactions with other users</li>
                <li>Your violation of any third-party rights</li>
              </ul>
            </section>

            {/* Termination */}
            <section className={styles.section}>
              <h2>13. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without
                prior notice, for any reason, including but not limited to:
              </p>
              <ul>
                <li>Violation of these Terms</li>
                <li>Conduct that we believe is harmful to other users or the Service</li>
                <li>Requests from law enforcement</li>
                <li>Extended periods of inactivity</li>
              </ul>
              <p>
                You may delete your account at any time by contacting us. Upon termination, your right
                to use the Service will immediately cease.
              </p>
            </section>

            {/* Governing Law */}
            <section className={styles.section}>
              <h2>14. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India,
                without regard to conflict of law principles. Any disputes arising from these Terms or
                the Service shall be subject to the exclusive jurisdiction of the courts in New Delhi, India.
              </p>
            </section>

            {/* Changes */}
            <section className={styles.section}>
              <h2>15. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of material
                changes by updating the &ldquo;Last Updated&rdquo; date and, where appropriate, through in-app
                notifications. Your continued use of the Service after changes constitutes acceptance of
                the modified Terms.
              </p>
            </section>

            {/* Severability */}
            <section className={styles.section}>
              <h2>16. Severability</h2>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the remaining
                provisions shall continue in full force and effect. The invalid or unenforceable provision
                shall be modified to the minimum extent necessary to make it valid and enforceable.
              </p>
            </section>

            {/* Contact */}
            <section className={styles.section}>
              <h2>17. Contact Information</h2>
              <p>
                For questions or concerns about these Terms, please contact us at:
              </p>
              <div className={styles.contactInfo}>
                <p><strong>Carpool</strong></p>
                <p>Email: <a href="mailto:is.this.tanzeel@gmail.com">is.this.tanzeel@gmail.com</a></p>
              </div>
            </section>
          </div>

          <footer className={styles.articleFooter}>
            <Link href="/" className={styles.backLink}>
              &larr; Back to Home
            </Link>
            <Link href="/privacy" className={styles.termsLink}>
              Privacy Policy &rarr;
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
