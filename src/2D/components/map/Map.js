import React, { useEffect, useContext, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { defaults as defaultControls } from 'ol/control';
import { MapContext } from '../../../context/MapContext';
import { transform } from 'ol/proj';
import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";

const OpenLayersMap = () => {
  const { currentLocation, setCurrentLocation, mode } = useContext(MapContext);
const OpenLayersMap = ({ mapType }) => {
  const mapRef = useRef();
  const mapInstance = useRef();
  const isMapInitialized = useRef(false);
  const viewRef = useRef();

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
    const layers = {
      OSM: new TileLayer({
        source: new OSM()
      }),
      Google: new TileLayer({
        source: new XYZ({
          url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        }),
      }),
      Hybrid: new TileLayer({
        source: new XYZ({
          url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        }),
      }),
      Terrain: new TileLayer({
        source: new XYZ({
          url: "https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
        }),
      }),
      LightMap: new TileLayer({
        source: new XYZ({
          url: "https://mt1.google.com/vt/lyrs=r&x={x}&y={y}&z={z}",
        }),
      }),
      USGSTopo: new TileLayer({
        source: new XYZ({
          url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
        }),
      }),
      OpenTopoMap: new TileLayer({
        source: new XYZ({
          url: "https://tile.opentopomap.org/{z}/{x}/{y}.png",
        }),
      }),
      CartoDBVoyager: new TileLayer({
        source: new XYZ({
          url: "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        }),
      }),
      CartoDBDarkMatter: new TileLayer({
        source: new XYZ({
          url: "https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png",
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
      }),
      EsriWorldTopo: new TileLayer({
        source: new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        }),
      }),
      EsriWorldImagery: new TileLayer({
        source: new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        }),
      }),
      EsriDarkGrayCanvas: new TileLayer({
        source: new XYZ({
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        }),
      }),
    };

    if (!mapInstance.current) {
      viewRef.current = new View({
        center: [0, 0],
        zoom: 2,
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
      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [layers[mapType] || layers.OSM],
        view: viewRef.current,
        controls: defaultControls({ zoom: false }),
      });
    } else {
      const view = mapInstance.current.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      mapInstance.current.setLayers([layers[mapType] || layers.OSM]);
      view.setCenter(center);
      view.setZoom(zoom);
    }
  }, [mapType]);

  return (
    <div className="map-container">
      <div ref={mapRef} className="map" />
    </div>
  );
};

export default OpenLayersMap;