'use client';

/**
 * Login Page
 *
 * Google sign-in page with design matching the landing page.
 * Redirects to dashboard on successful authentication.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import styles from './page.module.css';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brandLogo}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.logoIcon}>
            <circle cx="12" cy="12" r="10" stroke="#d4af37" strokeWidth="2"/>
            <path d="M8 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="#d4af37" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="10" r="1.5" fill="#d4af37"/>
            <circle cx="15" cy="10" r="1.5" fill="#d4af37"/>
          </svg>
          <span className={styles.brand}>Carpool</span>
        </div>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to find riders heading your way
        </p>

        <button className={styles.loginButton} onClick={handleSignIn}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.carpoolIcon}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 14c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
          </svg>
          Login to Carpool
        </button>

        <p className={styles.terms}>
          By signing in, you agree to our{' '}
          <a href="#">Terms of Service</a> and{' '}
          <a href="#">Privacy Policy</a>
        </p>

        <a href="/" className={styles.backLink}>
          ← Back to home
        </a>
      </div>

      <div className={styles.tagline}>
        Share the ride. Split the fare. Save the planet.
      </div>
    </div>
  );
}
