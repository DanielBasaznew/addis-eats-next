'use client';

import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fixed restaurant origin location in Bole, Addis Ababa (Bole Medhanialem area)
const RESTAURANT_COORDINATES = [8.995, 38.7896];

// Coordinates for destination neighbourhoods across Addis Ababa [lat, lng] (EAT, UTC+3)
const AREA_COORDINATES = {
  // If destination is in Bole, offset slightly to east Bole so restaurant and customer are distinct points
  Bole: [8.9995, 38.7955],
  Kazanchis: [9.015, 38.765],
  Sarbet: [8.992, 38.732],
  Piassa: [9.035, 38.752],
  'Arat Kilo': [9.034, 38.762],
  Mexico: [9.01, 38.745],
  CMC: [9.02, 38.83],
  Gerji: [8.985, 38.81],
  Default: [9.018, 38.758],
};

// 1. Restaurant Origin Marker (Bole Kitchen)
const restaurantIcon = L.divIcon({
  className: 'custom-restaurant-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #78350f;
      color: #ffffff;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      font-size: 19px;
    ">
      🏪
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -22],
});

// 2. Courier Rider Marker (En route)
const courierIcon = L.divIcon({
  className: 'custom-courier-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #047857;
      color: #ffffff;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(4,120,87,0.45);
      font-size: 19px;
    ">
      🛵
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -22],
});

// 3. Customer Destination Marker
const destinationIcon = L.divIcon({
  className: 'custom-destination-marker',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background: #b45309;
      color: #ffffff;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      font-size: 19px;
    ">
      📍
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -22],
});

/**
 * Automatically adjusts map camera view to fit the Restaurant, Courier, and Destination markers.
 */
function FitBoundsHelper({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (!positions || positions.length < 2) return;
    try {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, {
        padding: [60, 60],
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

  // Calculate live courier position along route from Bole Restaurant to Destination
  const courierCoords = useMemo(() => {
    if (status === 'Preparing' || status === 'Cooking') {
      // Parked outside restaurant in Bole waiting for order to finish cooking
      return [RESTAURANT_COORDINATES[0] + 0.001, RESTAURANT_COORDINATES[1] + 0.001];
    }
    if (status === 'Delivered') {
      // Arrived at destination
      return destCoords;
    }
    // 'Ready' (Out for delivery): Courier is 65% of the way along the route from Bole to destination
    return [
      RESTAURANT_COORDINATES[0] + (destCoords[0] - RESTAURANT_COORDINATES[0]) * 0.65,
      RESTAURANT_COORDINATES[1] + (destCoords[1] - RESTAURANT_COORDINATES[1]) * 0.65,
    ];
  }, [destCoords, status]);

  const markerPositions = useMemo(
    () => [RESTAURANT_COORDINATES, courierCoords, destCoords],
    [courierCoords, destCoords]
  );

  const isDelivered = status === 'Delivered';
  const isInTransit = status === 'Ready';

  return (
    <div className="space-y-3">
      {/* Visual Route Legend Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-900 text-white flex items-center justify-center text-[10px]">
            🏪
          </span>
          <span className="font-bold text-stone-900 dark:text-stone-100">
            Origin: Addis Eats (Bole)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-stone-400">
          <span>&rarr;</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            🛵 {isInTransit ? 'In Transit' : isDelivered ? 'Arrived' : 'Kitchen Prepping'}
          </span>
          <span>&rarr;</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">
            📍
          </span>
          <span className="font-bold text-stone-900 dark:text-stone-100">
            Destination: {area}
          </span>
        </div>
      </div>

      {/* Leaflet Interactive Map View */}
      <div className="relative w-full h-[360px] sm:h-[420px] overflow-hidden rounded-3xl border border-stone-200/90 dark:border-stone-800 shadow-sm">
        <MapContainer
          center={RESTAURANT_COORDINATES}
          zoom={13}
          scrollWheelZoom={false}
          className="w-full h-full z-0"
          aria-label={`Delivery route map starting from Bole kitchen to ${area}`}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          />

          {/* 1. Restaurant Origin Marker (Bole) */}
          <Marker position={RESTAURANT_COORDINATES} icon={restaurantIcon}>
            <Popup>
              <div className="text-xs p-1">
                <strong className="block text-stone-900 font-bold">Addis Eats Restaurant</strong>
                <span className="text-stone-600">Main Kitchen Origin · Bole, Addis Ababa</span>
                <br />
                <span className="text-amber-800 font-semibold">Order Departure Hub</span>
              </div>
            </Popup>
          </Marker>

          {/* 2. Customer Destination Marker */}
          <Marker position={destCoords} icon={destinationIcon}>
            <Popup>
              <div className="text-xs p-1">
                <strong className="block text-stone-900 font-bold">Delivery Destination</strong>
                <span className="text-stone-600">{area}, Addis Ababa</span>
                <br />
                <span className="text-amber-800 font-semibold">Order #{orderId}</span>
              </div>
            </Popup>
          </Marker>

          {/* 3. Live Courier Rider Marker */}
          {status !== 'Cancelled' && (
            <Marker position={courierCoords} icon={courierIcon}>
              <Popup>
                <div className="text-xs p-1">
                  <strong className="block text-stone-900 font-bold">Addis Courier Motorbike</strong>
                  <span className="text-emerald-700 font-semibold block mt-0.5">
                    {isDelivered
                      ? 'Arrived at delivery address'
                      : isInTransit
                      ? `En route from Bole to ${area}`
                      : 'Parked at Bole Kitchen · Waiting for dishes'}
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Traveled Route Segment (Solid Emerald Line) */}
          <Polyline
            positions={[RESTAURANT_COORDINATES, courierCoords]}
            pathOptions={{
              color: '#059669',
              weight: 4,
              opacity: 0.9,
              lineCap: 'round',
            }}
          />

          {/* Remaining Route Segment (Dashed Amber Line) */}
          {!isDelivered && (
            <Polyline
              positions={[courierCoords, destCoords]}
              pathOptions={{
                color: '#d97706',
                weight: 3,
                dashArray: '6, 8',
                opacity: 0.8,
              }}
            />
          )}

          <FitBoundsHelper positions={markerPositions} />
        </MapContainer>
      </div>
    </div>
  );
}
