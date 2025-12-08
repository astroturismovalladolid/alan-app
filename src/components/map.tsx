'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Observation } from '@/lib/observations-fetch';
import { useObservations } from '@/hooks/use-observations';
import { ObservationPopup } from './observation-popup';
import { useLanguage } from '@/context/language-context';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface MapRef {
  reloadObservations: () => Promise<void>;
}

// Fix for default icon path in Leaflet with webpack
// This should be done once, outside the component
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl:
      'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

// Create colored circle markers based on rating
function getCircleMarkerOptions(rating: number): L.CircleMarkerOptions {
  const colors: { [key: number]: string } = {
    1: '#ef4444', // red
    2: '#f97316', // orange
    3: '#eab308', // yellow
    4: '#84cc16', // lime
    5: '#22c55e', // green
  };

  const color = colors[rating] || colors[3]; // default to yellow

  return {
    radius: 8,
    fillColor: color,
    color: '#000',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8,
    pane: 'markerPane', // Ensure markers are in the correct pane
  };
}

const MapComponent = forwardRef<MapRef>((props, ref) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use React Query to fetch observations with caching
  const { data: observations = [], refetch, isLoading, error } = useObservations();

  // Log observations data for debugging
  useEffect(() => {
    console.log('Observations data updated:', {
      count: observations.length,
      isLoading,
      error: error?.message,
      observations: observations.slice(0, 3) // Log first 3 for debugging
    });
  }, [observations, isLoading, error]);

  // Expose reloadObservations method to parent component
  useImperativeHandle(ref, () => ({
    reloadObservations: async () => {
      await refetch();
    },
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get tile layer based on theme
  const getTileLayer = (theme: string) => {
    if (theme === 'light') {
      // Light mode: standard OpenStreetMap
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      });
    } else if (theme === 'night') {
      // Night mode: Dark red-tinted tiles
      return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        className: 'map-tiles-night',
      });
    } else {
      // Dark mode: Dark tiles
      return L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      });
    }
  };

  // Initialize map
  useEffect(() => {
    if (isClient && mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([51.505, -0.09], 13); // Default view
      mapRef.current = map;

      // Get initial theme and add appropriate tile layer
      const initialTheme = localStorage.getItem('theme') || 'dark';
      const tileLayer = getTileLayer(initialTheme);
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Get user's current location with iOS-specific options
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Geolocation success:', latitude, longitude);
            map.setView([latitude, longitude], 13);
          },
          (error) => {
            console.error('Geolocation error:', error.code, error.message);
            console.log("Unable to retrieve your location. Defaulting to London.");
            // Stay at default London coordinates
          },
          {
            enableHighAccuracy: false, // iOS Safari works better with false
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          }
        );
      }
    }
  }, [isClient]);

  // Watch for theme changes and update map tiles
  useEffect(() => {
    if (!mapRef.current || !isClient) return;

    const handleThemeChange = () => {
      const currentTheme = document.documentElement.className || localStorage.getItem('theme') || 'dark';

      if (tileLayerRef.current) {
        mapRef.current?.removeLayer(tileLayerRef.current);
      }

      const newTileLayer = getTileLayer(currentTheme);
      newTileLayer.addTo(mapRef.current!);
      tileLayerRef.current = newTileLayer;
    };

    // Create a MutationObserver to watch for class changes on documentElement
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, [isClient]);

  // React Query handles fetching automatically
  // No need for manual interval polling - React Query will refetch on window focus
  // and use cached data otherwise

  // Add markers for observations
  useEffect(() => {
    console.log('Map markers effect - observations count:', observations.length);
    console.log('Map ref exists:', !!mapRef.current);

    if (!mapRef.current) {
      console.warn('Map ref not ready');
      return;
    }

    if (observations.length === 0) {
      console.warn('No observations to display');
      return;
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new circle markers
    observations.forEach((observation, index) => {
      console.log(`Adding marker ${index}:`, observation.latitude, observation.longitude, 'rating:', observation.rating);

      const circleMarker = L.circleMarker(
        [observation.latitude, observation.longitude],
        getCircleMarkerOptions(observation.rating)
      ).addTo(mapRef.current!);

      // Open modal on click
      circleMarker.on('click', () => {
        setSelectedObservation(observation);
        setIsModalOpen(true);
      });

      markersRef.current.push(circleMarker);
    });

    console.log('Total markers added:', markersRef.current.length);

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [observations]);

  // The div container for the map
  return (
    <>
      <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />

      {/* Observation Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('observationDetails')}</DialogTitle>
          </DialogHeader>
          {selectedObservation && (
            <ObservationPopup
              observation={selectedObservation}
              authorName={selectedObservation.authorName}
              onRatingAdded={() => {
                // React Query will automatically refetch and update
                refetch().then(({ data }) => {
                  // Update the selected observation with fresh data
                  if (data) {
                    const updated = data.find(obs => obs.id === selectedObservation.id);
                    if (updated) {
                      setSelectedObservation(updated);
                    }
                  }
                });
              }}
              onReported={() => {
                // React Query will automatically refetch and update
                refetch().then(({ data }) => {
                  // Update the selected observation with fresh data
                  if (data) {
                    const updated = data.find(obs => obs.id === selectedObservation.id);
                    if (updated) {
                      setSelectedObservation(updated);
                    }
                  }
                });
              }}
              onDeleted={() => {
                // Close modal and refetch observations after deletion
                setIsModalOpen(false);
                setSelectedObservation(null);
                refetch();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;
