import React, { useEffect, useContext, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import { MapContext } from '../../../context/MapContext';
import { transform } from 'ol/proj';

const OpenLayersMap = () => {
  const { currentLocation, setCurrentLocation, mode } = useContext(MapContext);
  const mapRef = useRef();
  const mapInstance = useRef();
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (mode !== '2D') {
      return;
    }
    if (isMapInitialized.current) {
      const view = mapInstance.current.getView();
      view.animate({
        center: transform([currentLocation.longitude, currentLocation.latitude], 'EPSG:4326', view.getProjection().getCode()),
        zoom: currentLocation.zoomLevel2D,
        duration: 800,
      });
      return;
    }

    mapInstance.current = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [currentLocation.longitude, currentLocation.latitude],
        zoom: currentLocation.zoomLevel2D,
      }),
      controls: defaultControls({
        zoom: false,
      }),
    });

    window.mapInstance = mapInstance.current;
    isMapInitialized.current = true;

    window.mapInstance = mapInstance.current;

    mapInstance.current.on('moveend', function(e) {
      const coords = transform(mapInstance.current.getView().getCenter(), mapInstance.current.getView().getProjection().getCode(), 'EPSG:4326');
      const zoomLevel = mapInstance.current.getView().getZoom();
      setCurrentLocation({
        longitude: coords[0],
        latitude: coords[1],
        zoomLevel2D: zoomLevel,
        zoomLevel3D: zoomLevel - 3
      });
    });

  }, [mode, setCurrentLocation]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
    </div>
  );
};

export default OpenLayersMap;