'use client';

/**
 * MinimizableChat Component
 *
 * Enhances ChatPopup with:
 * - Minimized state: Floating bubble (56x56px) with unread count badge
 * - Expanded state: Full chat UI
 * - Persistent messages via useChat hook
 * - Support for multiple chats (show bubbles for each)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/hooks/useChat';
import { Chat } from '@/types';
import styles from './MinimizableChat.module.css';

interface MinimizableChatProps {
  chatId: string;
  otherParticipant: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
  isInitiallyExpanded?: boolean;
  onClose: () => void;
  onEndChat?: () => void;
  onViewLocation?: (location: { lat: number; lng: number }, isMe: boolean) => void;
  myLocation?: { lat: number; lng: number } | null;
}

export default function MinimizableChat({
  chatId,
  otherParticipant,
  isInitiallyExpanded = true,
  onClose,
  onEndChat,
  onViewLocation,
  myLocation,
}: MinimizableChatProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);
  const [inputText, setInputText] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    loading,
    unreadCount,
    sendMessage,
    sendLocation,
    markAsRead,
    loadMore,
    hasMore,
    loadingMore,
    endChat,
  } = useChat({ chatId, enabled: true });

  // Handle ending chat
  const handleEndChat = async () => {
    setIsEnding(true);
    await endChat();
    onEndChat?.();
    onClose();
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isExpanded) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Mark messages as read when expanded
  useEffect(() => {
    if (isExpanded && unreadCount > 0) {
      markAsRead();
    }
  }, [isExpanded, unreadCount, markAsRead]);

  // Play sound on new message
  useEffect(() => {
    if (!isExpanded && unreadCount > 0) {
      playMessageSound();
    }
  }, [unreadCount, isExpanded]);

  const playMessageSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Ignore audio errors
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleShareLocation = () => {
    if (myLocation) {
      sendLocation(myLocation);
    }
  };

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || loadingMore || !hasMore) return;

    // Load more when scrolled near the top
    if (container.scrollTop < 100) {
      loadMore();
    }
  }, [loadMore, loadingMore, hasMore]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Minimized bubble view
  if (!isExpanded) {
    return (
      <div className={styles.minimizedBubble} onClick={toggleExpand}>
        {otherParticipant.photoURL ? (
          <img
            src={otherParticipant.photoURL}
            alt={otherParticipant.displayName}
            className={styles.bubblePhoto}
          />
        ) : (
          <div className={styles.bubblePhotoFallback}>
            {otherParticipant.displayName.charAt(0)}
          </div>
        )}
        {unreadCount > 0 && (
          <div className={styles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </div>
    );
  }

  // Expanded chat view
  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.minimizeBtn} onClick={toggleExpand}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        <div className={styles.headerInfo}>
          {otherParticipant.photoURL ? (
            <img
              src={otherParticipant.photoURL}
              alt=""
              className={styles.headerAvatar}
            />
          ) : (
            <div className={styles.headerAvatarFallback}>
              {otherParticipant.displayName.charAt(0)}
            </div>
          )}
          <div>
            <h3>{otherParticipant.displayName}</h3>
          </div>
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className={styles.messages}
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className={styles.loadingMore}>
            <span className={styles.loadingSpinner} />
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <span className={styles.loadingSpinner} />
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.message} ${
                msg.senderId === otherParticipant.uid
                  ? styles.theirMessage
                  : msg.type === 'system'
                  ? styles.systemMessage
                  : styles.myMessage
              }`}
            >
              {msg.text && <p>{msg.text}</p>}
              {msg.location && (
                <button
                  className={styles.locationMessage}
                  onClick={() =>
                    onViewLocation?.(
                      msg.location!,
                      msg.senderId !== otherParticipant.uid
                    )
                  }
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <span>
                    {msg.senderId === otherParticipant.uid
                      ? `View ${otherParticipant.displayName.split(' ')[0]}'s location`
                      : 'View my location'}
                  </span>
                </button>
              )}
              <span className={styles.time}>
                {msg.timestamp?.toDate?.()?.toLocaleTimeString?.([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }) || ''}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className={styles.inputArea}>
        <button
          type="button"
          onClick={handleShareLocation}
          className={styles.locationBtn}
          title="Share location"
          disabled={!myLocation}
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
        <button type="submit" className={styles.sendBtn} disabled={!inputText.trim()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>

      {/* End Chat Button */}
      <button
        className={styles.endChatBtn}
        onClick={handleEndChat}
        disabled={isEnding}
      >
        {isEnding ? 'Ending...' : 'End Chat'}
      </button>
    </div>
  );
}

/**
 * ChatBubbles Component
 *
 * Renders multiple minimized chat bubbles
 */
interface ChatBubblesProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatClick: (chatId: string) => void;
  currentUserId: string;
}

export function ChatBubbles({
  chats,
  activeChatId,
  onChatClick,
  currentUserId,
}: ChatBubblesProps) {
  // Filter out active chat and get other participant info
  const minimizedChats = chats.filter((chat) => chat.id !== activeChatId);

  if (minimizedChats.length === 0) return null;

  return (
    <div className={styles.bubblesContainer}>
      {minimizedChats.map((chat, index) => {
        const otherParticipantId = chat.participants.find(
          (p) => p !== currentUserId
        );
        const otherParticipant = otherParticipantId
          ? chat.participantDetails[otherParticipantId]
          : null;

        if (!otherParticipant) return null;

        return (
          <div
            key={chat.id}
            className={styles.bubbleItem}
            style={{ bottom: `${20 + index * 70}px` }}
            onClick={() => onChatClick(chat.id)}
          >
            {otherParticipant.photoURL ? (
              <img
                src={otherParticipant.photoURL}
                alt={otherParticipant.displayName}
                className={styles.bubblePhoto}
              />
            ) : (
              <div className={styles.bubblePhotoFallback}>
                {otherParticipant.displayName.charAt(0)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
