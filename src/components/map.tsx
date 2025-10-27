'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
            L.marker([latitude, longitude]).addTo(map)
              .bindPopup('Your current location.')
              .openPopup();
          },
          () => {
            console.log("Unable to retrieve your location. Defaulting to London.");
            // Keep default view if location is denied
            L.marker([51.505, -0.09]).addTo(map)
              .bindPopup('A pretty CSS3 popup. <br> Easily customizable.');
          }
        );
      } else {
        console.log("Geolocation is not supported by this browser.");
        L.marker([51.505, -0.09]).addTo(map)
              .bindPopup('A pretty CSS3 popup. <br> Easily customizable.');
      }
    }
  }, [isClient]);

  // The div container for the map
  return (
    <div ref={mapContainerRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
  );
}

export default MapComponent;
