import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './TileSwitcher.css';
import { MapContext } from '../../../MapContext';
import layers2D from '../../constants/Tiles2D';
import layers3D from '../../constants/Tiles3D';

const TileSwitcher = () => {
  const { map2DType, setMap2DType, map3DType, setMap3DType, mode } = useContext(MapContext);
  const [isOpen, setIsOpen] = useState(false);
  const mapTypes = mode === '2D' ? Object.keys(layers2D) : Object.keys(layers3D);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMapTypeChange = (type) => {
    mode === '2D' ? setMap2DType(type) : setMap3DType(type)
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
                checked={(mode === '2D' ? map2DType : map3DType) === type}
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