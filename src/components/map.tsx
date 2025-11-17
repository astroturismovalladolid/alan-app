'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchObservations, type Observation } from '@/lib/observations-fetch';
import { ObservationPopup } from './observation-popup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

// Create colored icons based on rating
function getIconForRating(rating: number): L.Icon {
  const colors: { [key: number]: string } = {
    1: '#ef4444', // red
    2: '#f97316', // orange
    3: '#eab308', // yellow
    4: '#84cc16', // lime
    5: '#22c55e', // green
  };

  const color = colors[rating] || colors[3]; // default to yellow

  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 9.375 12.5 28.125 12.5 28.125S25 21.875 25 12.5C25 5.596 19.404 0 12.5 0z" fill="${color}" stroke="#000" stroke-width="1"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
    </svg>
  `;

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
}

function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize map
  useEffect(() => {
    if (isClient && mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView([51.505, -0.09], 13); // Default view
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

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

  // Load observations
  useEffect(() => {
    const loadObservations = async () => {
      const obs = await fetchObservations();
      setObservations(obs);
    };

    if (isClient) {
      loadObservations();
      // Reload every 30 seconds to get new observations
      const interval = setInterval(loadObservations, 30000);
      return () => clearInterval(interval);
    }
  }, [isClient]);

  // Add markers for observations
  useEffect(() => {
    if (!mapRef.current || observations.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    observations.forEach((observation) => {
      const marker = L.marker([observation.latitude, observation.longitude], {
        icon: getIconForRating(observation.rating),
      }).addTo(mapRef.current!);

      // Open modal on click
      marker.on('click', () => {
        setSelectedObservation(observation);
        setIsModalOpen(true);
      });

      markersRef.current.push(marker);
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Observation Details</DialogTitle>
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
}

export default MapComponent;
