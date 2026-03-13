'use client';

/**
 * Protected App Layout
 *
 * Wraps all authenticated routes (dashboard, ride, etc.)
 * Redirects to login if user is not authenticated.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from 'lottie-react';
import { useAuth } from '@/components/AuthProvider';
import loadingDotsAnimation from '../../../public/assets/Loading Dots In Yellow.json';
import styles from './layout.module.css';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Lottie
          animationData={loadingDotsAnimation}
          loop={true}
          className={styles.lottieAnimation}
        />
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className={styles.appContainer}>
      {children}
    </div>
  );
}
