import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj'; 
import { defaults as defaultControls } from 'ol/control';
import Toolbar from '../toolbar/Toolbar';

const OpenLayersMap = () => {
  const mapRef = useRef();
  const mapInstance = useRef();

  useEffect(() => {
    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
      controls: defaultControls({
        zoom: false,
      }),
    });

    return () => mapInstance.current.setTarget(null);
  }, []);

  const handleZoomIn = () => {
    const view = mapInstance.current.getView();
    view.animate({
      zoom: view.getZoom() + 0.5,
      duration: 300,
    });
  };

  const handleZoomOut = () => {
    const view = mapInstance.current.getView();
    view.animate({
      zoom: view.getZoom() - 0.5,
      duration: 300,
    });
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const view = mapInstance.current.getView();
        const coords = fromLonLat([longitude, latitude]);
        view.animate({
          center: coords,
          zoom: 14,
          duration: 1500,
        });
      });
    }
  };

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
      <Toolbar onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} onCurrentLocation={handleCurrentLocation} />
    </div>
  );
};

export default OpenLayersMap;