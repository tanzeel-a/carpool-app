'use client';

/**
 * NotificationBell Component
 *
 * Bell icon in header that shows:
 * - Badge with unread notification count
 * - Dropdown with recent notifications and active chats
 * - Click handler to view full notifications
 */

import { useState, useRef, useEffect } from 'react';
import { MatchRequest, Chat } from '@/types';
import styles from './NotificationBell.module.css';

interface Notification {
  id: string;
  type: 'match_request' | 'match_accepted' | 'message' | 'group_invite' | 'chat';
  title: string;
  message: string;
  photoURL?: string;
  timestamp: Date;
  read: boolean;
  data?: MatchRequest;
  chatData?: {
    chatId: string;
    participantId: string;
    participantName: string;
    participantPhoto: string;
  };
}

interface NotificationBellProps {
  incomingRequests: MatchRequest[];
  onRequestClick: (request: MatchRequest) => void;
  chats?: Chat[];
  currentUserId?: string;
  onChatClick?: (chatId: string, participant: { uid: string; displayName: string; photoURL: string }) => void;
  onDeleteChat?: (chatId: string) => void;
}

export default function NotificationBell({
  incomingRequests,
  onRequestClick,
  chats = [],
  currentUserId,
  onChatClick,
  onDeleteChat,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Convert incoming requests to notifications
  const requestNotifications: Notification[] = incomingRequests.map((request) => ({
    id: request.id,
    type: 'match_request' as const,
    title: 'New Match Request',
    message: `${request.fromUser.displayName} wants to ride with you`,
    photoURL: request.fromUser.photoURL,
    timestamp: request.createdAt.toDate(),
    read: false,
    data: request,
  }));

  // Convert active chats to notifications
  const chatNotifications: Notification[] = chats.map((chat) => {
    const otherParticipantId = chat.participants.find(p => p !== currentUserId) || '';
    const otherParticipant = chat.participantDetails[otherParticipantId];
    const timestamp = chat.lastMessage?.timestamp?.toDate?.() || chat.createdAt?.toDate?.() || new Date();
    return {
      id: `chat-${chat.id}`,
      type: 'chat' as const,
      title: 'Active Chat',
      message: otherParticipant?.displayName || 'Chat',
      photoURL: otherParticipant?.photoURL,
      timestamp,
      read: true,
      chatData: {
        chatId: chat.id,
        participantId: otherParticipantId,
        participantName: otherParticipant?.displayName || 'User',
        participantPhoto: otherParticipant?.photoURL || '',
      },
    };
  });

  const notifications = [...requestNotifications, ...chatNotifications];
  const unreadCount = requestNotifications.filter((n) => !n.read).length + chats.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'match_request' && notification.data) {
      onRequestClick(notification.data);
      setIsOpen(false);
    } else if (notification.type === 'chat' && notification.chatData && onChatClick) {
      onChatClick(notification.chatData.chatId, {
        uid: notification.chatData.participantId,
        displayName: notification.chatData.participantName,
        photoURL: notification.chatData.participantPhoto,
      });
      setIsOpen(false);
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent opening the chat
    if (onDeleteChat) {
      onDeleteChat(chatId);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button
        className={styles.bellButton}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {unreadCount > 0 && <span className={styles.pingAnimation} />}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <span className={styles.unreadBadge}>{unreadCount} new</span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className={styles.emptyState}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className={styles.notificationList}>
              {notifications.map((notification) => (
                <div key={notification.id} className={styles.notificationItemWrapper}>
                  <button
                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={styles.notificationAvatar}>
                      {notification.photoURL ? (
                        <img src={notification.photoURL} alt="" />
                      ) : (
                        <div className={styles.avatarPlaceholder}>
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                          </svg>
                        </div>
                      )}
                      <span className={styles.typeIcon}>
                        {notification.type === 'match_request' && (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                        )}
                        {notification.type === 'chat' && (
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
                          </svg>
                        )}
                      </span>
                    </div>
                    <div className={styles.notificationContent}>
                      <p className={styles.notificationTitle}>{notification.title}</p>
                      <p className={styles.notificationMessage}>{notification.message}</p>
                      <span className={styles.notificationTime}>
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                    </div>
                    {!notification.read && <span className={styles.unreadDot} />}
                  </button>
                  {notification.type === 'chat' && notification.chatData && onDeleteChat && (
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeleteChat(e, notification.chatData!.chatId)}
                      aria-label="Remove chat"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
