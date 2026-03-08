'use client';

/**
 * PlacesAutocomplete Component
 *
 * Google Places Autocomplete input for destination search
 * Includes a radius selector for co-rider search range
 */

import { useRef, useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Location } from '@/types';
import styles from './PlacesAutocomplete.module.css';

const libraries: ("places")[] = ["places"];

// Radius options in meters
const RADIUS_OPTIONS = [
  { value: 50, label: '50m' },
  { value: 100, label: '100m' },
  { value: 200, label: '200m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
];

interface PlacesAutocompleteProps {
  placeholder?: string;
  onPlaceSelect: (location: Location) => void;
  disabled?: boolean;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  showRadiusSelector?: boolean;
}

export default function PlacesAutocomplete({
  placeholder = "Where are you heading?",
  onPlaceSelect,
  disabled = false,
  radius = 100,
  onRadiusChange,
  showRadiusSelector = true,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isRadiusOpen, setIsRadiusOpen] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'in' }, // Restrict to India
      fields: ['formatted_address', 'geometry', 'name'],
    });

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();

      if (place?.geometry?.location) {
        const location: Location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.name || place.formatted_address || '',
        };
        setInputValue(location.address);
        onPlaceSelect(location);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onPlaceSelect]);

  // Close radius dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${styles.radiusSelector}`)) {
        setIsRadiusOpen(false);
      }
    };

    if (isRadiusOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isRadiusOpen]);

  const handleRadiusSelect = (value: number) => {
    onRadiusChange?.(value);
    setIsRadiusOpen(false);
  };

  const currentRadiusLabel = RADIUS_OPTIONS.find(r => r.value === radius)?.label || '100m';

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        <div className={styles.searchIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.input}
          disabled={disabled || !isLoaded}
        />
        {!isLoaded && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner} />
          </div>
        )}

        {/* Radius Selector */}
        {showRadiusSelector && isLoaded && (
          <div className={styles.radiusSelector}>
            <button
              className={styles.radiusBtn}
              onClick={(e) => {
                e.stopPropagation();
                setIsRadiusOpen(!isRadiusOpen);
              }}
              disabled={disabled}
              aria-label="Select search radius"
              title="Search radius"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="4" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
              </svg>
              <span className={styles.radiusValue}>{currentRadiusLabel}</span>
            </button>

            {isRadiusOpen && (
              <div className={styles.radiusDropdown}>
                <div className={styles.radiusHeader}>Search Radius</div>
                {RADIUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className={`${styles.radiusOption} ${radius === option.value ? styles.radiusOptionActive : ''}`}
                    onClick={() => handleRadiusSelect(option.value)}
                  >
                    <span className={styles.radiusCircle}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r={4 + (option.value / 200)} />
                      </svg>
                    </span>
                    {option.label}
                    {radius === option.value && (
                      <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
