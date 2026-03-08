'use client';

/**
 * PlacesAutocomplete Component
 *
 * Google Places Autocomplete input for destination search
 * Provides location suggestions as the user types
 */

import { useRef, useEffect, useState } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Location } from '@/types';
import styles from './PlacesAutocomplete.module.css';

const libraries: ("places")[] = ["places"];

interface PlacesAutocompleteProps {
  placeholder?: string;
  onPlaceSelect: (location: Location) => void;
  disabled?: boolean;
}

export default function PlacesAutocomplete({
  placeholder = "Where are you heading?",
  onPlaceSelect,
  disabled = false,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div className={styles.container}>
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
    </div>
  );
}
