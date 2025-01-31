import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faLocationArrow, faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import './SearchField.css';
import { MapContext } from '../../../MapContext';
import { Map2DStrategy } from '../../../2D/domain/strategies/Map2DStrategy';
import Menu from '../menu/Menu';
import { searchPOIBySpatial } from '../../domain/usecases/SearchPOIUseCase';

const mockResults = [
    'Result 1',
    'Result 2',
    'Result 3',
    'Result 4',
    'Result 5',
];

const SearchField = () => {
    const { strategy } = useContext(MapContext);
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showNoData, setShowNoData] = useState(false);
    const [draw, setDraw] = useState(null);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentSpatial, setCurrentSpatial] = useState(null);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (strategy instanceof Map2DStrategy) {
            const { vectorSource } = strategy.createVectorLayer();
            setVectorSource(vectorSource);
        }
    }, [strategy]);

    const handleChange = (e) => {
        setValue(e.target.value);
    };

    const handleFocus = () => {
        setIsFocused(true);
        setShowNoData(value.trim().length === 0);
    };

    const handleBlur = () => {
        setIsFocused(false);
        setShowNoData(false);
    };

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };

    const handleSearchClick = async () => {
        let spatial = currentSpatial;
        if (selectedIcon === 'location') {
            spatial.bbox = strategy.getBbox();
            setCurrentSpatial(spatial);
        }
        try {
            const searchResults = await searchPOIBySpatial(value, selectedIcon, spatial);
            setResults(searchResults);
        } catch (error) {
            console.error('Failed to search POI:', error);
        }
    };

    return (
        <div className="search-field-wrapper">
            <div className="search-field-container">
                <FontAwesomeIcon
                    icon={faBars}
                    className="icon-left"
                    onClick={() => setIsMenuOpen(true)}
                />
                <input
                    type="text"
                    className="search-field"
                    placeholder="Search..."
                    value={value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <FontAwesomeIcon icon={faSearch} className="icon-right" onClick={handleSearchClick} />
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
                        onClick={() => strategy.handleIconClick('location', null, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial)}
                    />
                </div>
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faCircle}
                        className={`icon-button ${selectedIcon === 'circle' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('circle', 'Circle', selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial)}
                    />
                </div>
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faSquare}
                        className={`icon-button ${selectedIcon === 'square' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('square', 'Box', selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial)}
                    />
                </div>
                <div className='icon-button-wrapper'>
                    <FontAwesomeIcon
                        icon={faDrawPolygon}
                        className={`icon-button ${selectedIcon === 'polygon' ? 'selected' : ''}`}
                        onClick={() => strategy.handleIconClick('polygon', 'Polygon', selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial)}
                    />
                </div>
            </div>
            <Menu isOpen={isMenuOpen} onClose={handleCloseMenu} />
        </div>
    );
};

export default SearchField;