import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faLocationArrow, faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import './SearchField.css';
import { MapContext } from '../../../MapContext';
import { handleSearch } from '../../domain/usecases/HandleSearch';
import { Map2DStrategy } from '../../../2D/domain/strategies/Map2DStrategy';

const mockResults = [
    'Result 1',
    'Result 2',
    'Result 3',
    'Result 4',
    'Result 5',
];

const SearchField = ({ onSearch }) => {
    const { strategy, mode } = useContext(MapContext);
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showNoData, setShowNoData] = useState(false);
    const [draw, setDraw] = useState(null);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [currentFeature, setCurrentFeature] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);

    useEffect(() => {
        if (strategy instanceof Map2DStrategy) {
            const { vectorSource } = strategy.createVectorLayer();
            setVectorSource(vectorSource);
        }
    }, [strategy]);

    const handleChange = (e) => {
        handleSearch(e.target.value, setValue, onSearch, setShowNoData, isFocused);
    };

    const handleFocus = () => {
        setIsFocused(true);
        setShowNoData(value.trim().length === 0);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setShowNoData(false);
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
            <div className="icon-buttons">
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faLocationArrow}
                        className={`icon-button ${selectedIcon === 'location' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('location', null, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, currentFeature, setCurrentFeature)}
                    />
                </div>
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faCircle}
                        className={`icon-button ${selectedIcon === 'circle' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('circle', 'Circle', selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, currentFeature, setCurrentFeature)}
                    />
                </div>
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faSquare}
                        className={`icon-button ${selectedIcon === 'square' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('square', 'Box', selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, currentFeature, setCurrentFeature)}
                    />
                </div>
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faDrawPolygon}
                        className={`icon-button ${selectedIcon === 'polygon' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('polygon', 'Polygon', selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, currentFeature, setCurrentFeature)}
                    />
                </div>
            </div>
        </div>
    );
};

export default SearchField;