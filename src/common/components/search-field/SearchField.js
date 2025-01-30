import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch } from '@fortawesome/free-solid-svg-icons';
import './SearchField.css';
import Menu from '../menu/Menu';

const mockResults = [
  'Result 1',
  'Result 2',
  'Result 3',
  'Result 4',
  'Result 5',
];

const SearchField = ({ onSearch }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showNoData, setShowNoData] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="search-field-wrapper">
      <div className="search-field-container" ref={menuRef}>
        <FontAwesomeIcon icon={faBars} className="icon-left" onClick={toggleMenu} />
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
        <Menu isOpen={isMenuOpen} onClose={closeMenu} />
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