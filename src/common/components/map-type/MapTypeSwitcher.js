import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './MapTypeSwitcher.css';

const MapTypeSwitcher = ({ mapType, setMapType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const mapTypes = [
    "OSM",
    "Google",
    "Hybrid",
    "Terrain",
    "LightMap",
    "USGSTopo",
    "OpenTopoMap"
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
    setIsOpen(false);
  };

  return (
    <div className="map-type-switcher">
      <button className="map-type-button" onClick={toggleDropdown}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>
      {isOpen && (
        <div className="map-type-dropdown">
          {mapTypes.map((type) => (
            <button key={type} onClick={() => handleMapTypeChange(type)}>
              {type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapTypeSwitcher;
