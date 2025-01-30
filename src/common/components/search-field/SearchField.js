import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faLocationArrow, faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import './SearchField.css';
import { Draw, Modify, Snap } from 'ol/interaction';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import { MapContext } from '../../../context/MapContext';

const mockResults = [
  'Result 1',
  'Result 2',
  'Result 3',
  'Result 4',
  'Result 5',
];

const SearchField = ({ onSearch }) => {
  const { mapInstance } = useContext(MapContext);
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [draw, setDraw] = useState(null);
  const [selectedIcon, setSelectedIcon] = useState(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (onSearch) {
      onSearch(newValue);
    }
    setShowNoData(isFocused && newValue.trim().length === 0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowNoData(value.trim().length === 0);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setShowNoData(false);
  };

  const addInteraction = (type) => {
    if (draw) {
      mapInstance.removeInteraction(draw);
    }
    const newDraw = new Draw({
      source: new VectorSource(),
      type: type,
    });
    mapInstance.addInteraction(newDraw);
    setDraw(newDraw);

    newDraw.on('drawend', (event) => {
      const feature = event.feature;
      const geojson = new GeoJSON().writeFeature(feature);
      console.log(geojson);
      // You can send the geojson to your server here
    });
  };

  const handleIconClick = (icon, type) => {
    if (selectedIcon === icon) {
      setSelectedIcon(null);
      // if (draw) {
      //   mapInstance.removeInteraction(draw);
      // }
    } else {
      setSelectedIcon(icon);
      // addInteraction(type);
    }
  };

  return (
    <div className="search-field-wrapper">
      <div className="search-field-container">
        <FontAwesomeIcon icon={faBars} className="icon-left" />
        <input
          type="text"
          className="search-field"
          placeholder="Search..."
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <FontAwesomeIcon icon={faSearch} className="icon-right" />
      </div>
      <div className="icon-buttons">
        <div className='icon-button-wrapper'>
          <FontAwesomeIcon
            icon={faLocationArrow}
            className={`icon-button ${selectedIcon === 'location' ? 'selected' : ''}`}
            onClick={() => handleIconClick('location', null)}
          />
        </div>
        <div className='icon-button-wrapper'>
          <FontAwesomeIcon
            icon={faCircle}
            className={`icon-button ${selectedIcon === 'circle' ? 'selected' : ''}`}
            onClick={() => handleIconClick('circle', 'Circle')}
          />
        </div>
        <div className='icon-button-wrapper'>
          <FontAwesomeIcon
            icon={faSquare}
            className={`icon-button ${selectedIcon === 'square' ? 'selected' : ''}`}
            onClick={() => handleIconClick('square', 'Box')}
          />
        </div>
        <div className='icon-button-wrapper'>
          <FontAwesomeIcon
            icon={faDrawPolygon}
            className={`icon-button ${selectedIcon === 'polygon' ? 'selected' : ''}`}
            onClick={() => handleIconClick('polygon', 'Polygon')}
          />
        </div>
      </div>
      {isFocused && value.trim().length > 0 && (
        <div className="result-list">
          {mockResults.map((result, index) => (
            <div key={index} className="result-item">
              <h3>{result}</h3>
              <p>{result}</p>
            </div>
          ))}
        </div>
      )}
      {isFocused && showNoData && (
        <div className="no-data-container">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
};

export default SearchField;