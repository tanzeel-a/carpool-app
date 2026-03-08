'use client';

/**
 * ChatPopup Component
 *
 * Minimal chat interface that:
 * - Opens when match is accepted
 * - Plays pop sound on open
 * - Local-only messages (no persistence)
 * - Location sharing with proximity indicator
 */

import { useState, useEffect, useRef } from 'react';
import styles from './ChatPopup.module.css';

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text?: string;
  location?: { lat: number; lng: number };
  timestamp: Date;
}

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  matchedRider: {
    displayName: string;
    photoURL: string;
  };
  myLocation: { lat: number; lng: number } | null;
  theirLocation: { lat: number; lng: number } | null;
  onLocationShare: () => void;
}

// Calculate distance between two points in meters
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ChatPopup({
  isOpen,
  onClose,
  matchedRider,
  myLocation,
  theirLocation,
  onLocationShare,
}: ChatPopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [prevDistance, setPrevDistance] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play pop sound using Web Audio API
  const playPopSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.15);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch {
      // Ignore audio errors
    }
  };

  // Play sound when chat opens
  useEffect(() => {
    if (isOpen) {
      playPopSound();

      // Add welcome message from matched rider
      setMessages([{
        id: 'welcome',
        sender: 'them',
        text: `Hey! I'm heading the same way. Let's meet up!`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen]);

  // Calculate distance when locations change
  useEffect(() => {
    if (myLocation && theirLocation) {
      const newDistance = calculateDistance(
        myLocation.lat, myLocation.lng,
        theirLocation.lat, theirLocation.lng
      );
      setPrevDistance(distance);
      setDistance(newDistance);
    }
  }, [myLocation, theirLocation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate reply after a short delay
    setTimeout(() => {
      const replies = [
        "Got it! On my way.",
        "See you soon!",
        "Almost there!",
        "Great, let's split the fare 50-50?",
      ];
      const reply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'them',
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1000 + Math.random() * 2000);
  };

  const shareLocation = () => {
    if (!myLocation) return;

    const locationMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'me',
      location: myLocation,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, locationMessage]);
    onLocationShare();

    // Simulate them sharing location back
    setTimeout(() => {
      if (theirLocation) {
        const theirLocationMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'them',
          location: theirLocation,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, theirLocationMessage]);
      }
    }, 1500);
  };

  const getDistanceText = () => {
    if (distance === null) return null;

    const isGettingCloser = prevDistance !== null && distance < prevDistance;
    const distanceStr = distance < 1000
      ? `${Math.round(distance)}m`
      : `${(distance / 1000).toFixed(1)}km`;

    return (
      <div className={`${styles.proximity} ${isGettingCloser ? styles.closer : ''}`}>
        <span className={styles.distanceIcon}>
          {isGettingCloser ? '↓' : '○'}
        </span>
        <span>{distanceStr} away</span>
        {isGettingCloser && <span className={styles.closerText}>Getting closer!</span>}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.riderInfo}>
            {matchedRider.photoURL ? (
              <img src={matchedRider.photoURL} alt="" className={styles.avatar} />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {matchedRider.displayName.charAt(0)}
              </div>
            )}
            <div>
              <h3>{matchedRider.displayName}</h3>
              {getDistanceText()}
            </div>
          </div>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>

        {/* Messages */}
        <div className={styles.messages}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${msg.sender === 'me' ? styles.myMessage : styles.theirMessage}`}
            >
              {msg.text && <p>{msg.text}</p>}
              {msg.location && (
                <div className={styles.locationMessage}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span>
                    {msg.sender === 'me' ? 'My location' : 'Their location'}:
                    {msg.location.lat.toFixed(4)}, {msg.location.lng.toFixed(4)}
                  </span>
                </div>
              )}
              <span className={styles.time}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className={styles.inputArea}>
          <button
            type="button"
            onClick={shareLocation}
            className={styles.locationBtn}
            title="Share location"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className={styles.input}
          />
          <button type="submit" className={styles.sendBtn}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
