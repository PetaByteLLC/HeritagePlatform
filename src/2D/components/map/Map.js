import React, { useEffect, useRef } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
import { defaults as defaultControls } from "ol/control";

const OpenLayersMap = ({ mapType }) => {
  const mapRef = useRef();
  const mapInstance = useRef();
  const viewRef = useRef();

  useEffect(() => {
    const layers = {
      OSM: new TileLayer({
        source: new OSM(),
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
      })
    };

    if (!mapInstance.current) {
      viewRef.current = new View({
        center: [0, 0],
        zoom: 2,
      });

      mapInstance.current = new Map({
        target: mapRef.current,
        layers: [layers[mapType]],
        view: viewRef.current,
        controls: defaultControls({
          zoom: false,
        }),
      });

      window.mapInstance = mapInstance.current;
    } else {
      const view = mapInstance.current.getView();
      const center = view.getCenter();
      const zoom = view.getZoom();
      mapInstance.current.setLayers([layers[mapType]]);
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