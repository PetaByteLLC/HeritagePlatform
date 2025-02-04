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
    const { handleZoomIn, handleZoomOut, handleCurrentLocation, handleMeasureArea,
        handleMeasureDistance, handleMeasureAltitude, handleMeasureRadius, setActiveButton } = useToolbarActions();
    const [activeButton, setActiveButtonState] = useState(null);

    const handleButtonClick = (buttonName, action) => {
        if (activeButton === buttonName) {
            setActiveButtonState(null);
            setActiveButton(null);
            action(null);
        } else {
            setActiveButtonState(buttonName);
            setActiveButton(buttonName);
            action(buttonName);
        }
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
            <button className={`toolbar-button ${activeButton === 'measureArea' ? 'active' : ''}`} onClick={() => handleButtonClick('measureArea', handleMeasureArea)}>
                <FontAwesomeIcon icon={faRoute}/>
            </button>
            <button className={`toolbar-button ${activeButton === 'measureDistance' ? 'active' : ''}`} onClick={() => handleButtonClick('measureDistance', handleMeasureDistance)}>
                <FontAwesomeIcon icon={faRulerHorizontal}/>
            </button>
            <button className={`toolbar-button ${activeButton === 'measureRadius' ? 'active' : ''}`} onClick={() => handleButtonClick('measureRadius', handleMeasureRadius)}>
                <FontAwesomeIcon icon={faCircle}/>
            </button>
            <button className={`toolbar-button ${activeButton === 'measureAltitude' ? 'active' : ''}`} onClick={() => handleButtonClick('measureAltitude', handleMeasureAltitude)}>
                <FontAwesomeIcon icon={faRulerVertical}/>
            </button>
        </div>
    );
};

export default Toolbar;