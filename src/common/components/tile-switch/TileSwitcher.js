import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './TileSwitcher.css';
import layers from '../../constants/Tiles2D';

const TileSwitcher = ({ mapType, setMapType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const mapTypes = Object.keys(layers);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMapTypeChange = (type) => {
    setMapType(type);
    setIsOpen(false);
  };

  return (
    <div className="tile-switch">
      <button className="tile-switch-button" onClick={toggleDropdown}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>
      {isOpen && (
        <div className="tile-type-dropdown">
          {mapTypes.map((type) => (
            <label key={type} className="tile-type-option">
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

export default TileSwitcher;