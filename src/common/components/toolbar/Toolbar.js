import { React, useContext } from 'react';
import VerticalSwitch from '../vertical-switch/VerticalSwitch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { fromLonLat } from 'ol/proj'; 
import { MapContext } from '../../../context/MapContext';
import './Toolbar.css';

const Toolbar = () => {
  const { mode } = useContext(MapContext);

  const handleZoomIn = () => {
    if (mode === '2D') {
      const view = window.mapInstance.getView();
      view.setZoom(view.getZoom() + 1);
    } else {
      // Handle 3D zoom in
    }
  };

  const handleZoomOut = () => {
    if (mode === '2D') {
      const view = window.mapInstance.getView();
      view.setZoom(view.getZoom() - 1);
    } else {
      // Handle 3D zoom out
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        if (mode === '2D') {
          const view = window.mapInstance.getView();
          const coords = fromLonLat([longitude, latitude]);
          view.animate({
            center: coords,
            zoom: 14,
            duration: 1500,
          });
        } else {
          window.Module.getViewCamera().setAnimationSpeed(2.0);
          window.Module.getViewCamera().moveLonLatAlt(longitude, latitude, 500, true);
          window.Module.getViewCamera().setTilt(90);
          window.Module.getViewCamera().setDirect(0);
        }
      });
    }
  };

  return (
    <div className="toolbar">
      <button className="toolbar-button" onClick={handleZoomIn}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
      <button className="toolbar-button" onClick={handleZoomOut}>
        <FontAwesomeIcon icon={faMinus} />
      </button>
      <button className="toolbar-button" onClick={handleCurrentLocation}>
        <FontAwesomeIcon icon={faLocationArrow} />
      </button>
      <VerticalSwitch />
    </div>
  );
};

export default Toolbar;