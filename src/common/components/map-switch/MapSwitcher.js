import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './MapSwitcher.css';

const MapSwitcher = ({ mapType, setMapType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const mapTypes = [
    "OSM",
    "Google",
    "Hybrid",
    "Terrain",
    "LightMap",
    "USGSTopo",
    "OpenTopoMap",
    "CartoDBVoyager",
    "CartoDBDarkMatter",
    "EsriWorldTopo",
    "EsriWorldImagery",
    "EsriDarkGrayCanvas"
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
    setIsOpen(false);
  };

  return (
    <div className="map-switch">
      <button className="map-switch-button" onClick={toggleDropdown}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>
      {isOpen && (
        <div className="map-type-dropdown">
          {mapTypes.map((type) => (
            <label key={type} className="map-type-option">
              <input
                type="radio"
                name="mapType"
                value={type}
                checked={mapType === type}
                onChange={() => handleMapTypeChange(type)}
              />
              {type}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapSwitcher;
