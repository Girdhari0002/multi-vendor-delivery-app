import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getSocket } from '../api/socket';

// Vite doesn't resolve Leaflet's default marker image paths, so use a plain CSS-drawn pin instead.
const agentIcon = L.divIcon({
  className: '',
  html: '<div style="font-size:28px;line-height:28px;transform:translate(-50%,-100%)">🛵</div>',
  iconSize: [28, 28],
});

const Recenter = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

// Shows a live-updating delivery agent marker for a given order, listening for `locationUpdated` socket events.
const LiveTrackingMap = ({ orderId, initialLocation }) => {
  const [location, setLocation] = useState(
    initialLocation?.lat && initialLocation?.lng ? initialLocation : null
  );

  useEffect(() => {
    const socket = getSocket();
    socket.emit('join_room', `order_${orderId}`);

    const handleUpdate = (data) => {
      if (data.orderId === orderId) {
        setLocation({ lat: data.lat, lng: data.lng });
      }
    };

    socket.on('locationUpdated', handleUpdate);
    return () => socket.off('locationUpdated', handleUpdate);
  }, [orderId]);

  if (!location) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 text-sm">
        Waiting for delivery partner's live location...
      </div>
    );
  }

  const position = [location.lat, location.lng];

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden">
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={agentIcon}>
          <Popup>Your delivery partner is here</Popup>
        </Marker>
        <Recenter position={position} />
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
