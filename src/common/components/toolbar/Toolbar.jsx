import React, { useContext, useState } from 'react';
import VerticalSwitch from './VerticalSwitch';
import TileSwitcher from './TileSwitcher';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faLocationArrow, faRoute, faRulerHorizontal, faRulerVertical } from '@fortawesome/free-solid-svg-icons';
import { MapContext } from '../../../MapContext';
import { useToolbarActions } from '../../domain/usecases/ToolbarUseCase';
import './Toolbar.css';
import { faCircle } from "@fortawesome/free-regular-svg-icons";

const Toolbar = () => {
    const { map2DType, setMap2DType } = useContext(MapContext);
    const { handleZoomIn, handleZoomOut, handleCurrentLocation, handleToolIconClick} = useToolbarActions();
    const [ selectedIcon, setSelectedIcon ] = useState(null);

    const handleToolClick = (icon) => {
        handleToolIconClick(icon, selectedIcon, setSelectedIcon);
    };

    return (
        <div className="toolbar">
            <button className="toolbar-button" onClick={handleZoomIn}>
                <FontAwesomeIcon icon={faPlus}/>
            </button>
            <button className="toolbar-button" onClick={handleZoomOut}>
                <FontAwesomeIcon icon={faMinus}/>
            </button>
            <button className="toolbar-button" onClick={handleCurrentLocation}>
                <FontAwesomeIcon icon={faLocationArrow}/>
            </button>
            <TileSwitcher map2DType={map2DType} setMap2DType={setMap2DType}/>
            <VerticalSwitch/>
            <button className={`toolbar-button ${selectedIcon === 'area' ? 'active' : ''}`} onClick={() => handleToolClick('area')}>
                <FontAwesomeIcon icon={faRoute}/>
            </button>
            <button className={`toolbar-button ${selectedIcon === 'distance' ? 'active' : ''}`} onClick={() => handleToolClick('distance')}>
                <FontAwesomeIcon icon={faRulerHorizontal}/>
            </button>
            <button className={`toolbar-button ${selectedIcon === 'radius' ? 'active' : ''}`} onClick={() => handleToolClick('radius')}>
                <FontAwesomeIcon icon={faCircle}/>
            </button>
            <button className={`toolbar-button ${selectedIcon === 'altitude' ? 'active' : ''}`} onClick={() => handleToolClick('altitude')}>
                <FontAwesomeIcon icon={faRulerVertical}/>
            </button>
        </div>
    );
};

export default Toolbar;