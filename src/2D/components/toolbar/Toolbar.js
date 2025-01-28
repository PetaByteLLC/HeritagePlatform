import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import './Toolbar.css';

const Toolbar = ({ onZoomIn, onZoomOut, onCurrentLocation }) => {
  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={onZoomIn}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <button className="toolbar-button" onClick={onZoomOut}>
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <button className="toolbar-button" onClick={onCurrentLocation}>
        <FontAwesomeIcon icon={faLocationArrow} />
      </button>
    </div>
  );
};

export default Toolbar;