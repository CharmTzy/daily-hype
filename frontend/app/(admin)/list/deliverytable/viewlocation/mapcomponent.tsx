"use client";

// Name: Ang Wei Liang
// Admin No: 2227791
// Class: DIT/FT/2B/02
// DeliveryVer: 2.4

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

interface MapProps {
  latitude: any;
  longitude: any;
}

function MapComponent({ latitude, longitude }: MapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={10}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]}>
        <Popup>Delivery Location</Popup>
      </Marker>
    </MapContainer>
  );
}

export default MapComponent;
