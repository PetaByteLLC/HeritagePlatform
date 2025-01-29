import React, { useEffect, useContext, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { MapContext } from '../../../context/MapContext';
import { transform } from 'ol/proj';
import layers from '../../../common/constants/Tiles2D';

const OpenLayersMap = ({ mapType }) => {
  const { currentLocation, setCurrentLocation, mode } = useContext(MapContext);
  const mapRef = useRef();
  const mapInstance = useRef();
  const viewRef = useRef();
  const isMapInitialized = useRef(false);

  useEffect(() => {
    if (mode !== '2D') {
      return;
    }

    if (!isMapInitialized.current) {
      viewRef.current = new View({
        center: transform([currentLocation.longitude, currentLocation.latitude], 'EPSG:4326', 'EPSG:3857'),
        zoom: currentLocation.zoomLevel2D,
      });

      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [layers[mapType] || layers.OSM],
        view: viewRef.current,
        controls: defaultControls({ zoom: false }),
      });

      mapInstance.current.on('moveend', function () {
        const coords = transform(mapInstance.current.getView().getCenter(), 'EPSG:3857', 'EPSG:4326');
        const zoomLevel = mapInstance.current.getView().getZoom();
        setCurrentLocation({
          longitude: coords[0],
          latitude: coords[1],
          zoomLevel2D: zoomLevel,
          zoomLevel3D: zoomLevel - 3,
        });
      });

      isMapInitialized.current = true;
      window.mapInstance = mapInstance.current;
    } else {
      const view = mapInstance.current.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      mapInstance.current.setLayers([layers[mapType] || layers.OSM]);
      view.setCenter(center);
      view.setZoom(zoom);
    }
  }, [mapType, mode, currentLocation, setCurrentLocation]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
    </div>
  );
};

export default OpenLayersMap;