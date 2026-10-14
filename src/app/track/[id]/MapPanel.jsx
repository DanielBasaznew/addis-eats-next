'use client';

import dynamic from 'next/dynamic';
import { Component } from 'react';

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="status"
          className="flex h-[340px] sm:h-[400px] w-full items-center justify-center rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/40 p-6 text-center text-sm text-stone-600 dark:text-stone-400"
        >
          <div>
            <svg className="w-9 h-9 mx-auto mb-2 text-stone-400 dark:text-stone-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              <line x1="9" x2="9" y1="3" y2="18" />
              <line x1="15" x2="15" y1="6" y2="21" />
            </svg>
            <p className="font-semibold text-stone-800 dark:text-stone-200">
              Interactive map view currently unavailable.
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Please refer to the written delivery address and courier timeline beside the map.
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamic import with ssr: false ensures Leaflet never runs on the server (Day 47 principle)
const DeliveryMap = dynamic(() => import('./DeliveryMap'), {
  ssr: false,
  loading: () => (
    <div
      className="h-[340px] sm:h-[400px] w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 flex items-center justify-center"
      aria-label="Loading delivery route map"
      role="status"
    >
      <div className="text-center text-stone-400 dark:text-stone-500">
        <svg className="w-6 h-6 mx-auto mb-2 text-amber-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-xs font-medium">Initializing Addis Ababa delivery map...</p>
      </div>
    </div>
  ),
});

export default function MapPanel(props) {
  return (
    <MapErrorBoundary>
      <DeliveryMap {...props} />
    </MapErrorBoundary>
  );
}
