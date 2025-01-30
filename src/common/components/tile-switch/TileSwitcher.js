import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './TileSwitcher.css';
import layers2D from '../../constants/Tiles2D';

const TileSwitcher = ({ map2DType, setMap2DType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const map2DTypes = Object.keys(layers2D);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMapTypeChange = (type) => {
    setMap2DType(type);
    setIsOpen(false);
  };

  return (
    <div className="tile-switch">
      <button className="tile-switch-button" onClick={toggleDropdown}>
        <FontAwesomeIcon icon={faLayerGroup} />
      </button>
      {isOpen && (
        <div className="tile-type-dropdown">
          {map2DTypes.map((type) => (
            <label key={type} className="tile-type-option">
              <input
                type="radio"
                name="mapType"
                value={type}
                checked={map2DType === type}
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