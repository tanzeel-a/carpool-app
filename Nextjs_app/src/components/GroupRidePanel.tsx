'use client';

/**
 * GroupRidePanel Component
 *
 * Horizontal panel at bottom showing ride members:
 * - Horizontal scroll of participant avatars
 * - "+" button to invite nearby people
 * - Status indicators (pending/confirmed)
 * - "Start Ride" button (host only, 2+ confirmed)
 */

import { useState, useCallback } from 'react';
import { GroupRide, NearbyPerson } from '@/types';
import styles from './GroupRidePanel.module.css';

interface GroupRidePanelProps {
  groupRide: GroupRide | null;
  isHost: boolean;
  nearbyPeople: NearbyPerson[];
  onInvitePerson: (person: NearbyPerson) => void;
  onStartRide: () => void;
  onCancelRide: () => void;
  onLeaveRide: () => void;
}

export default function GroupRidePanel({
  groupRide,
  isHost,
  nearbyPeople,
  onInvitePerson,
  onStartRide,
  onCancelRide,
  onLeaveRide,
}: GroupRidePanelProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  if (!groupRide) return null;

  const confirmedCount = groupRide.participants.filter(
    (p) => p.status === 'confirmed'
  ).length;
  const canStartRide = isHost && confirmedCount >= 2;

  const handleInvite = (person: NearbyPerson) => {
    onInvitePerson(person);
    setShowInviteModal(false);
  };

  // Filter out already invited people
  const availableToInvite = nearbyPeople.filter(
    (person) => !groupRide.participants.some((p) => p.uid === person.uid)
  );

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>Group Ride</h3>
          <span className={styles.memberCount}>
            {confirmedCount} confirmed
          </span>
        </div>

        <div className={styles.participantsScroll}>
          <div className={styles.participants}>
            {groupRide.participants.map((participant) => (
              <div
                key={participant.uid}
                className={`${styles.participant} ${
                  participant.status === 'confirmed'
                    ? styles.confirmed
                    : participant.status === 'pending'
                    ? styles.pending
                    : styles.declined
                }`}
              >
                {participant.photoURL ? (
                  <img
                    src={participant.photoURL}
                    alt={participant.displayName}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {participant.displayName.charAt(0)}
                  </div>
                )}
                <span className={styles.participantName}>
                  {participant.displayName.split(' ')[0]}
                </span>
                <div className={styles.statusIndicator}>
                  {participant.status === 'confirmed' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  )}
                  {participant.status === 'pending' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  )}
                  {participant.status === 'declined' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                  )}
                </div>
              </div>
            ))}

            {/* Add button */}
            {groupRide.participants.length < 4 && availableToInvite.length > 0 && (
              <button
                className={styles.addBtn}
                onClick={() => setShowInviteModal(true)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className={styles.destination}>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>{groupRide.destination.address.split(',')[0]}</span>
        </div>

        <div className={styles.actions}>
          {isHost ? (
            <>
              <button
                className={styles.cancelBtn}
                onClick={onCancelRide}
              >
                Cancel Ride
              </button>
              <button
                className={`${styles.startBtn} ${!canStartRide ? styles.disabled : ''}`}
                onClick={onStartRide}
                disabled={!canStartRide}
              >
                {canStartRide ? 'Start Ride' : 'Need 2+ riders'}
              </button>
            </>
          ) : (
            <button
              className={styles.leaveBtn}
              onClick={onLeaveRide}
            >
              Leave Group
            </button>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowInviteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Invite to Group</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowInviteModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.inviteList}>
              {availableToInvite.length === 0 ? (
                <p className={styles.emptyText}>No nearby people to invite</p>
              ) : (
                availableToInvite.map((person) => (
                  <div key={person.uid} className={styles.inviteItem}>
                    {person.photoURL ? (
                      <img
                        src={person.photoURL}
                        alt={person.displayName}
                        className={styles.inviteAvatar}
                      />
                    ) : (
                      <div className={styles.inviteAvatarFallback}>
                        {person.displayName.charAt(0)}
                      </div>
                    )}
                    <div className={styles.inviteInfo}>
                      <span className={styles.inviteName}>{person.displayName}</span>
                      <span className={styles.inviteDistance}>
                        {person.distance < 1000
                          ? `${Math.round(person.distance)}m away`
                          : `${(person.distance / 1000).toFixed(1)}km away`}
                      </span>
                    </div>
                    <button
                      className={styles.inviteBtn}
                      onClick={() => handleInvite(person)}
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
