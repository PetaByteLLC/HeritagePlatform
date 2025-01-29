import React from 'react';
import './MapSwitcher.css';

const MapSwitcher = ({ mapType, setMapType }) => {
  const mapTypes = [
    "OSM",
    "Google",
    "Hybrid",
    "Terrain",
    "LightMap",
    "USGSTopo",
    "OpenTopoMap"
  ];

  const handleMapTypeChange = (type) => {
    setMapType(type);
  };

  return (
    <div className="map-switcher">
      {mapTypes.map((type) => (
        <button
          key={type}
          className={`map-switcher-button ${mapType === type ? 'active' : ''}`}
          onClick={() => handleMapTypeChange(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

export default MapSwitcher;
