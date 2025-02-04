import React, { useContext } from 'react';
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
    const { handleZoomIn, handleZoomOut, handleCurrentLocation, handleAltitude } = useToolbarActions();

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
            <button className="toolbar-button">
                <FontAwesomeIcon icon={faRoute}/>
            </button>
            <button className="toolbar-button">
                <FontAwesomeIcon icon={faRulerHorizontal}/>
            </button>
            <button className="toolbar-button">
                <FontAwesomeIcon icon={faCircle}/>
            </button>
            <button className="toolbar-button" onClick={handleAltitude}>
                <FontAwesomeIcon icon={faRulerVertical}/>
            </button>
        </div>
    );
};

export default Toolbar;