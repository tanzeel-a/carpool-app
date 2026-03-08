'use client';

/**
 * MatchCompleteModal Component
 *
 * Farewell modal shown after chat/ride is complete
 * Shows a thank you message with a car animation
 */

import { useEffect, useState } from 'react';
import styles from './MatchCompleteModal.module.css';

interface MatchCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MatchCompleteModal({ isOpen, onClose }: MatchCompleteModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`${styles.modal} ${isVisible ? styles.visible : ''}`} onClick={(e) => e.stopPropagation()}>
        {/* Road with moving dashes */}
        <div className={styles.road}>
          <div className={styles.roadLine} />
          <div className={styles.roadLine} />
          <div className={styles.roadLine} />
        </div>

        {/* Animated Car */}
        <div className={styles.carContainer}>
          <div className={styles.car}>
            {/* Car Body */}
            <svg viewBox="0 0 120 60" className={styles.carSvg}>
              {/* Car shadow */}
              <ellipse cx="60" cy="55" rx="45" ry="5" fill="rgba(0,0,0,0.1)" />

              {/* Car body */}
              <path
                d="M15 35 L20 20 Q25 10 40 10 L80 10 Q95 10 100 20 L105 35"
                fill="#d4af37"
                stroke="#aa8a2e"
                strokeWidth="2"
              />

              {/* Car bottom/base */}
              <rect x="10" y="35" width="100" height="12" rx="3" fill="#d4af37" stroke="#aa8a2e" strokeWidth="2" />

              {/* Windows */}
              <path
                d="M25 18 L30 12 Q32 10 38 10 L55 10 L55 22 L25 22 Z"
                fill="#87CEEB"
                stroke="#5fa8c7"
                strokeWidth="1"
              />
              <path
                d="M58 10 L82 10 Q88 10 90 12 L95 18 L95 22 L58 22 Z"
                fill="#87CEEB"
                stroke="#5fa8c7"
                strokeWidth="1"
              />

              {/* Window shine */}
              <path d="M30 14 L35 11" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />
              <path d="M65 14 L70 11" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" />

              {/* Headlights */}
              <rect x="100" y="36" width="8" height="5" rx="2" fill="#fff9c4" />
              <rect x="12" y="36" width="8" height="5" rx="2" fill="#ffcdd2" />

              {/* Door handle */}
              <rect x="55" y="30" width="8" height="2" rx="1" fill="#aa8a2e" />

              {/* Wheels */}
              <g className={styles.wheel}>
                <circle cx="30" cy="47" r="10" fill="#333" />
                <circle cx="30" cy="47" r="6" fill="#666" />
                <circle cx="30" cy="47" r="3" fill="#999" />
              </g>
              <g className={styles.wheel}>
                <circle cx="90" cy="47" r="10" fill="#333" />
                <circle cx="90" cy="47" r="6" fill="#666" />
                <circle cx="90" cy="47" r="3" fill="#999" />
              </g>

              {/* Exhaust smoke */}
              <g className={styles.smoke}>
                <circle cx="5" cy="42" r="3" fill="rgba(200,200,200,0.6)" />
                <circle cx="0" cy="40" r="4" fill="rgba(200,200,200,0.4)" />
                <circle cx="-6" cy="38" r="5" fill="rgba(200,200,200,0.2)" />
              </g>
            </svg>
          </div>
        </div>

        {/* Trees/scenery passing by */}
        <div className={styles.scenery}>
          <div className={styles.tree}>
            <div className={styles.treeTop} />
            <div className={styles.treeTrunk} />
          </div>
          <div className={styles.tree} style={{ animationDelay: '0.5s' }}>
            <div className={styles.treeTop} />
            <div className={styles.treeTrunk} />
          </div>
          <div className={styles.tree} style={{ animationDelay: '1s' }}>
            <div className={styles.treeTop} />
            <div className={styles.treeTrunk} />
          </div>
        </div>

        {/* Message */}
        <div className={styles.content}>
          <h2>Happy to help!</h2>
          <p>Visit us for your next ride</p>
          <div className={styles.sparkles}>
            <span>✨</span>
            <span>🚗</span>
            <span>✨</span>
          </div>
        </div>

        {/* Tap to close hint */}
        <p className={styles.hint}>Tap anywhere to close</p>
      </div>
    </div>
  );
}
