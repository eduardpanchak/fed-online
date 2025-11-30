import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ 
  onLocationSelect, 
  initialLat = 51.505, 
  initialLng = -0.09 
}) => {
  const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const provider = new OpenStreetMapProvider();

  useEffect(() => {
    // Try to get user's current location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPos);
          onLocationSelect(pos.coords.latitude, pos.coords.longitude);
        },
        (error) => {
          console.warn('Could not get current location:', error);
        }
      );
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await provider.search({ query: searchQuery });
      if (results && results.length > 0) {
        const { y: lat, x: lng, label } = results[0];
        setPosition([lat, lng]);
        onLocationSelect(lat, lng, label);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search for an address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          type="button" 
          onClick={handleSearch} 
          disabled={searching}
          variant="outline"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="h-[400px] rounded-lg overflow-hidden border">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={`${position[0]}-${position[1]}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} />
          <MapClickHandler onLocationSelect={handleMapClick} />
        </MapContainer>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Click on the map or search for an address to set your service location.
      </p>
    </div>
  );
};

export default LocationPicker;
