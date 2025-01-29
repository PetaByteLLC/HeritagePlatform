import { React, useContext } from 'react';
import VerticalSwitch from '../vertical-switch/VerticalSwitch';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faLocationArrow } from '@fortawesome/free-solid-svg-icons';
import { fromLonLat } from 'ol/proj'; 
import { MapContext } from '../../../context/MapContext';
import MapTypeSwitcher from '../map-type/MapTypeSwitcher';
import './Toolbar.css';

const Toolbar = ({ mapType, setMapType }) => {
  const { mode } = useContext(MapContext);

  const handleZoomIn = () => {
    if (mode === '2D') {
      const view = window.mapInstance.getView();
      view.setZoom(view.getZoom() + 1);
    } else {
      window.Module.getViewCamera().ZoomIn();
      window.Module.getViewCamera().ZoomIn();
      window.Module.getViewCamera().ZoomIn();
      window.Module.getViewCamera().ZoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mode === '2D') {
      const view = window.mapInstance.getView();
      view.setZoom(view.getZoom() - 1);
    } else {
      window.Module.getViewCamera().ZoomOut();
      window.Module.getViewCamera().ZoomOut();
      window.Module.getViewCamera().ZoomOut();
      window.Module.getViewCamera().ZoomOut();
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
            zoom: 18,
            duration: 1500,
          });
        } else {
          window.Module.getViewCamera().moveOval(new window.Module.JSVector3D(longitude, latitude, 500.0), 90, 0, 0.1);
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
      {mode !== '3D' && <MapTypeSwitcher mapType={mapType} setMapType={setMapType} />}
      <VerticalSwitch />
    </div>
  );
};

export default Toolbar;