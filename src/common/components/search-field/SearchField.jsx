import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSearch, faLocationArrow, faDrawPolygon, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { faCircle, faSquare } from '@fortawesome/free-regular-svg-icons';
import './SearchField.css';
import { MapContext } from '../../../MapContext';
import { Map2DStrategy } from '../../../2D/domain/strategies/Map2DStrategy';
import Menu from '../menu/Menu';
import { searchPOIBySpatial } from '../../domain/usecases/SearchPOIUseCase';


const SearchField = () => {
    const { strategy, selectedPOI, setSelectedPOI } = useContext(MapContext);
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [showNoData, setShowNoData] = useState(false);
    const [draw, setDraw] = useState(null);
    const [selectedIcon, setSelectedIcon] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [currentSpatial, setCurrentSpatial] = useState(null);
    const [result, setResult] = useState(null);

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
        strategy.removePOILayer();
        setSelectedPOI(null);
        setResult(null);
        let spatial = currentSpatial;
        if (selectedIcon === 'location') {
            spatial.bbox = strategy.getBbox();
            setCurrentSpatial(spatial);
        }
        try {
            const searchResult = await searchPOIBySpatial(value, selectedIcon, spatial);
            setResult(searchResult);
            setShowNoData(searchResult?.totalFeatures === 0);
            if (searchResult?.totalFeatures > 0) strategy.addGeoJSONToMap(searchResult);
        } catch (error) {
            console.error('Failed to search POI:', error);
        }
    };

    const handleResultClick = (feature) => {
        strategy.moveToSingleFeature(feature);
        setSelectedPOI(feature.properties);
    };

    const handleInfoClick = (e, feature) => {
        e.stopPropagation();
        setSelectedPOI(feature.properties);
    };
    
    const handleLocationClick = (e, feature) => {
        e.stopPropagation();
        strategy.moveToSingleFeature(feature);
        setSelectedPOI(null);
    };

    return (
        <div className="search-field-wrapper">
            <div className="menu-container">
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
                    <FontAwesomeIcon icon={faSearch} className="icon-right" onClick={handleSearchClick}/>
                </div>

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

                {result?.totalFeatures > 0 && (
                    <div className="result-list">
                        {result.features.map((feature, index) => (
                            <div key={index} className="result-item" onClick={() => handleResultClick(feature)}>
                                <div className='result-item-text'>
                                    <h3>{feature.properties.title}</h3>
                                    <p>{feature.properties.address}</p>
                                    <p>Level: {feature.properties.level}</p>
                                </div>
                                <div className='result-item-buttons'>
                                    <FontAwesomeIcon
                                        icon={faInfoCircle}
                                        className="result-item-icon"
                                        onClick={(e) => handleInfoClick(e, feature)}
                                    />

                                    <FontAwesomeIcon
                                        icon={faLocationArrow}
                                        className="result-item-icon"
                                        onClick={(e) => handleLocationClick(e, feature)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {showNoData && (
                    <div className="no-data-container">
                        <p>No data available...</p>
                    </div>
                )}

                {selectedPOI && (
                    <div className="poi-details-sidebar">
                        <button className="close-btn" onClick={() => setSelectedPOI(null)}>x</button>
                        <h2>{selectedPOI.title}</h2>
                        <p><strong>Address:</strong> {selectedPOI.address}</p>
                        {Object.entries(selectedPOI)
                            .filter(([key]) => key !== 'title' && key !== 'address')
                            .map(([key, value], index) => (
                                <p key={index}>
                                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value || 'No data available.'}
                                </p>
                            ))
                        }
                    </div>
                )}

                <Menu isOpen={isMenuOpen} onClose={handleCloseMenu}/>
            </div>
        </div>
    );
};

export default SearchField;