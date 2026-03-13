'use client';

/**
 * MatchRequestModal Component
 *
 * Two modes:
 * 1. Send mode: Click on someone → show their profile → "Send Request" button
 * 2. Receive mode: Incoming request notification → Accept/Decline buttons
 *
 * Design:
 * - Slide-up modal (same pattern as ChatPopup)
 * - Profile photo with bounce-in animation
 * - Optional message input for send mode
 * - 30-second auto-dismiss for receive mode
 */

import { useState, useEffect, useRef } from 'react';
import { NearbyPerson, MatchRequest } from '@/types';
import styles from './MatchRequestModal.module.css';

interface MatchRequestModalProps {
  // Send mode
  targetPerson?: NearbyPerson | null;
  onSendRequest?: (message: string) => void;
  onCancelSend?: () => void;

  // Receive mode
  incomingRequest?: MatchRequest | null;
  onAcceptRequest?: () => void;
  onDeclineRequest?: () => void;

  // Common
  loading?: boolean;
}

export default function MatchRequestModal({
  targetPerson,
  onSendRequest,
  onCancelSend,
  incomingRequest,
  onAcceptRequest,
  onDeclineRequest,
  loading = false,
}: MatchRequestModalProps) {
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(30);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isSendMode = !!targetPerson;
  const isReceiveMode = !!incomingRequest;
  const isOpen = isSendMode || isReceiveMode;

  // Auto-dismiss for receive mode
  useEffect(() => {
    if (isReceiveMode) {
      setCountdown(30);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onDeclineRequest?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isReceiveMode, incomingRequest?.id, onDeclineRequest]);

  // Play sound on incoming request
  useEffect(() => {
    if (isReceiveMode) {
      playNotificationSound();
    }
  }, [isReceiveMode, incomingRequest?.id]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Two-tone notification
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.15); // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.3); // G5

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.45);
    } catch {
      // Ignore audio errors
    }
  };

  const handleSend = () => {
    onSendRequest?.(message);
    setMessage('');
  };

  const handleClose = () => {
    if (isSendMode) {
      onCancelSend?.();
    } else if (isReceiveMode) {
      onDeclineRequest?.();
    }
    setMessage('');
  };

  if (!isOpen) return null;

  const person = isSendMode
    ? targetPerson
    : incomingRequest
    ? {
        displayName: incomingRequest.fromUser.displayName,
        photoURL: incomingRequest.fromUser.photoURL,
        distance: 0, // We don't have distance for incoming requests
      }
    : null;

  if (!person) return null;

  const distanceText =
    isSendMode && targetPerson
      ? targetPerson.distance < 1000
        ? `${Math.round(targetPerson.distance)}m away`
        : `${(targetPerson.distance / 1000).toFixed(1)}km away`
      : '';

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className={styles.closeBtn} onClick={handleClose}>
          ×
        </button>

        {/* Countdown for receive mode */}
        {isReceiveMode && (
          <div className={styles.countdown}>
            <svg viewBox="0 0 36 36" className={styles.countdownRing}>
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#e8e4de"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#d4af37"
                strokeWidth="2"
                strokeDasharray={`${(countdown / 30) * 100} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span>{countdown}s</span>
          </div>
        )}

        {/* Profile section */}
        <div className={styles.profileSection}>
          <div className={styles.photoWrapper}>
            {person.photoURL ? (
              <img
                src={person.photoURL}
                alt={person.displayName}
                className={styles.photo}
              />
            ) : (
              <div className={styles.photoFallback}>
                {person.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className={styles.name}>{person.displayName}</h2>

          {distanceText && <p className={styles.distance}>{distanceText}</p>}

          {/* Broadcast info if available */}
          {isSendMode && targetPerson?.broadcast && (
            <div className={styles.broadcastInfo}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span>
                Heading to {targetPerson.broadcast.destinationAddress}
              </span>
            </div>
          )}

          {/* Incoming request message */}
          {isReceiveMode && incomingRequest?.message && (
            <div className={styles.requestMessage}>
              <p>"{incomingRequest.message}"</p>
            </div>
          )}
        </div>

        {/* Send mode actions */}
        {isSendMode && (
          <div className={styles.sendSection}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message (optional)..."
              className={styles.messageInput}
              maxLength={200}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  Send Match Request
                </>
              )}
            </button>
          </div>
        )}

        {/* Receive mode actions */}
        {isReceiveMode && (
          <div className={styles.receiveSection}>
            <p className={styles.requestText}>
              wants to match with you for a ride!
            </p>
            <div className={styles.actionButtons}>
              <button
                className={styles.declineBtn}
                onClick={onDeclineRequest}
                disabled={loading}
              >
                Decline
              </button>
              <button
                className={styles.acceptBtn}
                onClick={onAcceptRequest}
                disabled={loading}
              >
                {loading ? <span className={styles.spinner} /> : 'Accept'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
