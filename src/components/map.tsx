'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchObservations, type Observation } from '@/lib/observations-fetch';
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
  };
}

const MapComponent = forwardRef<MapRef>((props, ref) => {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to reload observations from Firestore
  const reloadObservations = async () => {
    const obs = await fetchObservations();
    setObservations(obs);
  };

  // Expose reloadObservations method to parent component
  useImperativeHandle(ref, () => ({
    reloadObservations,
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

      // Get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 13);
          },
          () => {
            console.log("Unable to retrieve your location. Defaulting to London.");
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

  // Load observations
  useEffect(() => {
    if (isClient) {
      reloadObservations();
      // Reload every 30 seconds to get new observations
      const interval = setInterval(reloadObservations, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Add markers for observations
  useEffect(() => {
    if (!mapRef.current || observations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new circle markers
    observations.forEach((observation) => {
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
                // Reload observations after rating is added
                fetchObservations().then((newObservations) => {
                  setObservations(newObservations);
                  // Update the selected observation with fresh data
                  const updated = newObservations.find(obs => obs.id === selectedObservation.id);
                  if (updated) {
                    setSelectedObservation(updated);
                  }
                });
              }}
              onReported={() => {
                // Reload observations after report is submitted
                fetchObservations().then((newObservations) => {
                  setObservations(newObservations);
                  // Update the selected observation with fresh data
                  const updated = newObservations.find(obs => obs.id === selectedObservation.id);
                  if (updated) {
                    setSelectedObservation(updated);
                  }
                });
              }}
              onDeleted={() => {
                // Close modal and reload observations after deletion
                setIsModalOpen(false);
                setSelectedObservation(null);
                fetchObservations().then(setObservations);
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
