/**
 * Geocoding utility using OpenStreetMap Nominatim API (free, no API key required)
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocode an address to get latitude/longitude
 * @param address Full address or postcode
 * @param city Optional city name
 * @param country Optional country (defaults to UK)
 */
export async function geocodeAddress(
  address: string,
  city?: string,
  country: string = 'United Kingdom'
): Promise<GeocodingResult | null> {
  try {
    const searchParts = [address, city, country].filter(Boolean);
    const searchQuery = searchParts.join(', ');
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      {
        headers: {
          'User-Agent': 'EasyUK/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode a UK postcode
 * @param postcode UK postcode
 */
export async function geocodePostcode(postcode: string): Promise<GeocodingResult | null> {
  try {
    // Clean the postcode
    const cleanPostcode = postcode.trim().toUpperCase();
    
    // Use postcodes.io API for UK postcodes (free, no API key required)
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`
    );

    if (!response.ok) {
      // Fallback to Nominatim if postcode API fails
      return geocodeAddress(cleanPostcode, undefined, 'United Kingdom');
    }

    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      return {
        latitude: data.result.latitude,
        longitude: data.result.longitude,
        displayName: `${data.result.postcode}, ${data.result.admin_district || ''}, UK`,
      };
    }

    return null;
  } catch (error) {
    console.error('Postcode geocoding error:', error);
    // Fallback to Nominatim
    return geocodeAddress(postcode, undefined, 'United Kingdom');
  }
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Radius options for the filter
 */
export const RADIUS_OPTIONS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
] as const;
