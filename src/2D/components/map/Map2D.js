import React, { useEffect, useContext, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { MapContext } from '../../../MapContext';
import { transform } from 'ol/proj';
import layers2D from '../../../common/constants/Tiles2D';
import { POI_LAYER_NAME, TILE_LAYER_NAME } from '../../../common/constants/GeoserverConfig';
import { moveToFeature, setSelectedPOIOnMap, removeLayerFromMap, updateWmsLayers, updateWfsLayers } from '../../utils/Map2DUtils';

const Map2D = () => {
	const { currentLocation, setCurrentLocation, mode, map2DType, setMap2D, setSelectedPOI, wmsLayers, wfsLayers, setHoveredPOI } = useContext(MapContext);
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
			view: new View({
				center: [currentLocation.longitude, currentLocation.latitude],
				zoom: currentLocation.zoomLevel2D,
			}),
			controls: defaultControls({
				zoom: false,
			}),
		});

		// TODO вынести в модуль
		mapInstance.current.on('click', (event) => {
			mapInstance.current.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
				if (!layer || !feature) return;
				// TODO click registering
				if (layer.get('name') === POI_LAYER_NAME) {
					const features = feature.get('features');
					moveToFeature(mapInstance.current, features);
					setSelectedPOIOnMap(features, setSelectedPOI);
				}
			});
		});

		mapInstance.current.on("pointermove", function (evt) {
			setHoveredPOI(null);
			var hit = this.forEachFeatureAtPixel(evt.pixel, (feature, layer) => true); 
			if (hit) {
				this.getTargetElement().style.cursor = 'pointer';
			} else {
				this.getTargetElement().style.cursor = '';
			}
			mapInstance.current.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
				if (!layer || !feature) return;
				for (const e of wfsLayers) {
					if (layer.get('name') !== e.layerName) continue;

					var properties = feature.getProperties();
					delete properties.geometry;
					setHoveredPOI({ properties: properties, position: evt.originalEvent });
					return;
				}
			});
		});

		window.mapInstance = mapInstance.current;
		setMap2D(mapInstance.current);
		isMapInitialized.current = true;

		mapInstance.current.on('moveend', function (e) {
			const coords = transform(mapInstance.current.getView().getCenter(), mapInstance.current.getView().getProjection().getCode(), 'EPSG:4326');
			const zoomLevel = mapInstance.current.getView().getZoom();
			setCurrentLocation({
				longitude: coords[0],
				latitude: coords[1],
				zoomLevel2D: zoomLevel,
				zoomLevel3D: zoomLevel - 3
			});
		});

	}, [mode, setCurrentLocation, setMap2D]);

	useEffect(() => {
		if (isMapInitialized.current) {
			const view = mapInstance.current.getView();
			const center = view.getCenter();
			const zoom = view.getZoom();

			removeLayerFromMap(mapInstance.current, TILE_LAYER_NAME);
			const tileLayer = layers2D[map2DType] || layers2D.OSM;
			tileLayer.set('name', TILE_LAYER_NAME);
			
			mapInstance.current.addLayer(tileLayer);
			view.setCenter(center);
			view.setZoom(zoom);
		}
	}, [map2DType]);

	useEffect(() => {
		updateWmsLayers(mapInstance.current, wmsLayers);
	}, [wmsLayers])

	useEffect(() => {
		updateWfsLayers(mapInstance.current, wfsLayers);
	}, [wfsLayers]);

	return (
		<div className="map-container">
			<div ref={mapRef} className="map" />
		</div>
	);
};

export default Map2D;