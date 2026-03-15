'use client';

/**
 * PageLoader Component
 *
 * Lottie animation-based loading screen for the website
 */

import { useEffect, useRef, useState } from 'react';
import Lottie from 'lottie-react';
import loadingDotsAnimation from '../../public/assets/Loading Dots In Yellow.json';
import styles from './PageLoader.module.css';

interface PageLoaderProps {
  /** Minimum display time in ms */
  minDisplayTime?: number;
}

export default function PageLoader({ minDisplayTime = 800 }: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const startTimeRef = useRef<number>(Date.now());

  // Handle page load completion
  useEffect(() => {
    const handleLoad = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsLoading(false);
        }, 500); // Match CSS transition duration
      }, remaining);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [minDisplayTime]);

  if (!isLoading) return null;

  return (
    <div className={`${styles.loader} ${isFading ? styles.fading : ''}`}>
      <div className={styles.content}>
        <div className={styles.lottieContainer}>
          <Lottie
            animationData={loadingDotsAnimation}
            loop={true}
            className={styles.lottieAnimation}
          />
        </div>
      </div>
    </div>
  );
}
