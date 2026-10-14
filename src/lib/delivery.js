export const DELIVERY_AREAS = [
  { name: 'Bole', fee: 50, time: '25 - 35 mins', keywords: ['bole'] },
  { name: 'Kazanchis', fee: 60, time: '30 - 40 mins', keywords: ['kazanchis', 'kasanchis'] },
  { name: 'Piassa', fee: 70, time: '35 - 45 mins', keywords: ['piassa', 'piyassa', 'arada'] },
  { name: 'Megenagna', fee: 70, time: '35 - 45 mins', keywords: ['megenagna', 'megenaga'] },
  { name: 'Saris', fee: 90, time: '45 - 55 mins', keywords: ['saris'] },
  { name: 'CMC', fee: 90, time: '45 - 60 mins', keywords: ['cmc', 'ayat'] },
  { name: 'Summit', fee: 50, time: '25 - 35 mins', keywords: ['summit'] },
  { name: 'Fiyel Bet', fee: 50, time: '25 - 35 mins', keywords: ['fiyel bet'] },
];

export const DEFAULT_DELIVERY = {
  name: 'Standard Addis Area',
  fee: 80,
  time: '40 - 55 mins',
};

/**
 * Calculate delivery fee, ETA, and recognized area for an Addis Ababa address or Table.
 */
export function calculateDeliveryEstimate(address, isTableOrder = false, tableNumber = null) {
  if (isTableOrder) {
    return {
      fee: 0,
      time: '15 - 20 mins',
      isRecognized: true,
      matchedArea: tableNumber ? `Table #${tableNumber} (Dine-In)` : 'Dine-In Table Service',
      isTableOrder: true,
      isEmpty: false,
    };
  }

  if (!address || typeof address !== 'string' || !address.trim()) {
    return {
      fee: 0,
      time: null,
      isRecognized: false,
      matchedArea: null,
      isTableOrder: false,
      isEmpty: true,
    };
  }

  const normalized = address.toLowerCase();

  const matched = DELIVERY_AREAS.find((area) =>
    area.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matched) {
    return {
      fee: matched.fee,
      time: matched.time,
      isRecognized: true,
      matchedArea: matched.name,
      isTableOrder: false,
      isEmpty: false,
    };
  }

  return {
    fee: DEFAULT_DELIVERY.fee,
    time: DEFAULT_DELIVERY.time,
    isRecognized: false,
    matchedArea: DEFAULT_DELIVERY.name,
    isTableOrder: false,
    isEmpty: false,
  };
}
