'use client';

/**
 * NotificationToast Component
 *
 * Slide-in notifications from the right side of the screen
 * - Auto-dismisses after a timeout
 * - Shows profile photo, message, and action buttons
 * - Stacks multiple notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { MatchRequest } from '@/types';
import styles from './NotificationToast.module.css';

interface Toast {
  id: string;
  type: 'match_request' | 'match_accepted' | 'message' | 'info';
  title: string;
  message: string;
  photoURL?: string;
  duration?: number; // in ms, default 8000
  actions?: {
    primary?: { label: string; onClick: () => void };
    secondary?: { label: string; onClick: () => void };
  };
  data?: MatchRequest;
}

interface NotificationToastProps {
  incomingRequests: MatchRequest[];
  onAccept: (request: MatchRequest) => void;
  onDecline: (request: MatchRequest) => void;
}

// Track which requests have been shown as toasts
const shownRequestIds = new Set<string>();

export default function NotificationToast({
  incomingRequests,
  onAccept,
  onDecline,
}: NotificationToastProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());

  // Convert new incoming requests to toasts
  useEffect(() => {
    console.log('[NotificationToast] Incoming requests:', incomingRequests.length);

    const newToasts: Toast[] = [];

    incomingRequests.forEach((request) => {
      console.log('[NotificationToast] Processing request:', {
        id: request.id,
        from: request.fromUser.displayName,
        alreadyShown: shownRequestIds.has(request.id),
      });

      if (!shownRequestIds.has(request.id)) {
        shownRequestIds.add(request.id);
        newToasts.push({
          id: request.id,
          type: 'match_request',
          title: 'New Match Request',
          message: `${request.fromUser.displayName} wants to ride with you`,
          photoURL: request.fromUser.photoURL,
          duration: 30000, // 30 seconds for match requests
          data: request,
        });
        console.log('[NotificationToast] Created toast for:', request.fromUser.displayName);
      }
    });

    if (newToasts.length > 0) {
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch {}

      setToasts((prev) => [...prev, ...newToasts]);
    }
  }, [incomingRequests]);

  // Remove toast with exit animation
  const removeToast = useCallback((id: string) => {
    setExiting((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 300); // Match animation duration
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach((toast) => {
      if (!exiting.has(toast.id)) {
        const timer = setTimeout(() => {
          removeToast(toast.id);
        }, toast.duration || 8000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, exiting, removeToast]);

  const handleAccept = (toast: Toast) => {
    if (toast.data) {
      onAccept(toast.data);
    }
    removeToast(toast.id);
  };

  const handleDecline = (toast: Toast) => {
    if (toast.data) {
      onDecline(toast.data);
    }
    removeToast(toast.id);
  };

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${exiting.has(toast.id) ? styles.exiting : ''}`}
          style={{ '--index': index } as React.CSSProperties}
        >
          {/* Close button */}
          <button
            className={styles.closeBtn}
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Content */}
          <div className={styles.content}>
            {/* Avatar */}
            <div className={styles.avatar}>
              {toast.photoURL ? (
                <img src={toast.photoURL} alt="" />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
              <span className={styles.typeIndicator}>
                {toast.type === 'match_request' && (
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                  </svg>
                )}
              </span>
            </div>

            {/* Text */}
            <div className={styles.textContent}>
              <p className={styles.title}>{toast.title}</p>
              <p className={styles.message}>{toast.message}</p>
            </div>
          </div>

          {/* Actions for match requests */}
          {toast.type === 'match_request' && (
            <div className={styles.actions}>
              <button
                className={styles.declineBtn}
                onClick={() => handleDecline(toast)}
              >
                Decline
              </button>
              <button
                className={styles.acceptBtn}
                onClick={() => handleAccept(toast)}
              >
                Accept
              </button>
            </div>
          )}

          {/* Progress bar for auto-dismiss */}
          <div
            className={styles.progressBar}
            style={{ animationDuration: `${toast.duration || 8000}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
