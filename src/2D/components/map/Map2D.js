import React, { useEffect, useContext, useRef } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { defaults as defaultControls } from 'ol/control';
import { MapContext } from '../../../MapContext';
import { transform } from 'ol/proj';
import layers2D from '../../../common/constants/Tiles2D';
import { POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';
import { moveToFeature } from '../../utils/Map2DUtils';

const Map2D = () => {
	const { currentLocation, setCurrentLocation, mode, map2DType, setMap2D } = useContext(MapContext);
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
			layers: [layers2D[map2DType] || layers2D.OSM],
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
				// TODO click registering
				if (layer.get('name') === POI_LAYER_NAME) {
					const features = feature.get('features');
					moveToFeature(mapInstance.current, features);
				}
			});
		});

		mapInstance.current.on("pointermove", function (evt) {
			var hit = this.forEachFeatureAtPixel(evt.pixel, (feature, layer) => true); 
			if (hit) {
				this.getTargetElement().style.cursor = 'pointer';
				return;
			}
			this.getTargetElement().style.cursor = '';
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
			mapInstance.current.setLayers([layers2D[map2DType] || layers2D.OSM]);
			view.setCenter(center);
			view.setZoom(zoom);
		}
	}, [map2DType]);

	return (
		<div className="map-container">
			<div ref={mapRef} className="map" />
		</div>
	);
};

export default Map2D;