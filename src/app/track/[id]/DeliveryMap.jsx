'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Coordinates for key Addis Ababa neighbourhoods [lat, lng] (EAT, UTC+3)
const AREA_COORDINATES = {
  Bole: [8.995, 38.7896],
  Kazanchis: [9.015, 38.765],
  Sarbet: [8.992, 38.732],
  Piassa: [9.035, 38.752],
  'Arat Kilo': [9.034, 38.762],
  Mexico: [9.01, 38.745],
  CMC: [9.02, 38.83],
  Gerji: [8.985, 38.81],
  Default: [9.005, 38.775],
};

// Custom Courier Icon (Scooter / Delivery Rider)
const courierIcon = L.divIcon({
  className: 'custom-courier-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #047857;
      color: #ffffff;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      font-size: 18px;
    ">
      🛵
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

// Custom Destination Icon (Customer Delivery Address)
const destinationIcon = L.divIcon({
  className: 'custom-destination-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: #b45309;
      color: #ffffff;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      font-size: 18px;
    ">
      📍
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -20],
});

/**
 * Helper component to automatically fit the map viewport to include both markers.
 */
function FitBoundsHelper({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length < 2) return;
    try {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
      });
    } catch {
      // ignore
    }
  }, [map, positions]);

  return null;
}

export default function DeliveryMap({
  area = 'Bole',
  orderId = '',
  status = 'Preparing',
}) {
  const destCoords = AREA_COORDINATES[area] || AREA_COORDINATES.Default;

  // Courier position calculation based on status
  // When 'Delivered', courier is at destination; otherwise slightly offset on route
  const courierCoords = useMemo(() => {
    if (status === 'Delivered') {
      return destCoords;
    }
    // Offset slightly (~1.2 km south-west) representing incoming courier path
    return [destCoords[0] - 0.009, destCoords[1] - 0.012];
  }, [destCoords, status]);

  const markerPositions = useMemo(
    () => [courierCoords, destCoords],
    [courierCoords, destCoords]
  );

  return (
    <div className="relative w-full h-[340px] sm:h-[400px] overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
      <MapContainer
        center={destCoords}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        aria-label={`Live delivery route map for order ${orderId} in ${area}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        />

        {/* Destination Marker */}
        <Marker position={destCoords} icon={destinationIcon}>
          <Popup>
            <div className="text-xs p-1">
              <strong className="block text-stone-900 font-bold">Delivery Destination</strong>
              <span className="text-stone-600">{area}, Addis Ababa</span>
              <br />
              <span className="text-amber-800 font-medium">Order #{orderId}</span>
            </div>
          </Popup>
        </Marker>

        {/* Courier Marker */}
        {status !== 'Cancelled' && (
          <Marker position={courierCoords} icon={courierIcon}>
            <Popup>
              <div className="text-xs p-1">
                <strong className="block text-stone-900 font-bold">Addis Courier</strong>
                <span className="text-emerald-700 font-semibold">
                  {status === 'Delivered' ? 'Delivered to address' : 'En route on motorbike'}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        <FitBoundsHelper positions={markerPositions} />
      </MapContainer>
    </div>
  );
}
