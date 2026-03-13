'use client';

/**
 * PhoneVerification Component
 *
 * Modal for phone number verification using Firebase Phone Auth.
 * Required before users can create ride requests.
 */

import { useState, useEffect, useRef } from 'react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  linkWithCredential,
  ConfirmationResult
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import styles from './PhoneVerification.module.css';

interface PhoneVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export default function PhoneVerification({ isOpen, onClose, onVerified }: PhoneVerificationProps) {
  const { user } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);

  // Initialize reCAPTCHA when component mounts
  useEffect(() => {
    if (isOpen && !recaptchaVerifierRef.current && auth && recaptchaContainerRef.current) {
      try {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: 'invisible',
          callback: () => {
            // reCAPTCHA solved
          },
          'expired-callback': () => {
            setError('reCAPTCHA expired. Please try again.');
          }
        });
      } catch (err) {
        console.error('Error initializing reCAPTCHA:', err);
      }
    }

    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, [isOpen]);

  const formatPhoneNumber = (value: string) => {
    // Remove non-digits
    const digits = value.replace(/\D/g, '');

    // Format as Indian phone number
    if (digits.length <= 10) {
      return digits;
    }
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
    setError(null);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth || !recaptchaVerifierRef.current) {
      setError('Authentication not initialized');
      return;
    }

    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fullPhoneNumber = `+91${phoneNumber}`; // Indian country code
      const result = await signInWithPhoneNumber(auth, fullPhoneNumber, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setStep('code');
    } catch (err: unknown) {
      console.error('Error sending verification code:', err);
      const firebaseError = err as { code?: string; message?: string };

      if (firebaseError.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and try again.');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again later.');
      } else {
        setError('Failed to send verification code. Please try again.');
      }

      // Reset reCAPTCHA on error
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult || !user || !db || !auth?.currentUser) {
      setError('Verification session expired. Please try again.');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the credential from the confirmation result
      const credential = PhoneAuthProvider.credential(
        confirmationResult.verificationId,
        verificationCode
      );

      // Link phone number to existing Google account
      await linkWithCredential(auth.currentUser, credential);

      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        phoneNumber: `+91${phoneNumber}`,
        phoneVerified: true,
      });

      onVerified();
    } catch (err: unknown) {
      console.error('Error verifying code:', err);
      const firebaseError = err as { code?: string };

      if (firebaseError.code === 'auth/invalid-verification-code') {
        setError('Invalid code. Please check and try again.');
      } else if (firebaseError.code === 'auth/code-expired') {
        setError('Code expired. Please request a new one.');
        setStep('phone');
      } else if (firebaseError.code === 'auth/credential-already-in-use') {
        setError('This phone number is already linked to another account.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setStep('phone');
    setVerificationCode('');
    setConfirmationResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.header}>
          <div className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
          <h2>Verify Your Phone</h2>
          <p>For your safety, we require phone verification before you can request rides.</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Phone Number</label>
              <div className={styles.phoneInput}>
                <span className={styles.countryCode}>+91</span>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="Enter 10-digit number"
                  maxLength={10}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading || phoneNumber.length !== 10}>
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                'Send Verification Code'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="code">Verification Code</label>
              <p className={styles.hint}>Enter the 6-digit code sent to +91 {phoneNumber}</p>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                disabled={loading}
                className={styles.codeInput}
                autoFocus
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.submitBtn} disabled={loading || verificationCode.length !== 6}>
              {loading ? (
                <span className={styles.spinner} />
              ) : (
                'Verify'
              )}
            </button>

            <button type="button" onClick={handleResendCode} className={styles.resendBtn} disabled={loading}>
              Didn't receive code? Resend
            </button>
          </form>
        )}

        {/* Hidden reCAPTCHA container */}
        <div ref={recaptchaContainerRef} id="recaptcha-container" />
      </div>
    </div>
  );
}
