import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { toLonLat } from 'ol/proj';
import { get2DBbox } from '../../../common/domain/utils/2DBbox';
import { DEFAULT_SRS, POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';
import { addGeoJSONToMap, removeLayerFromMap, moveToSingleFeature } from '../../utils/Map2DUtils';
import Overlay from 'ol/Overlay';

export class Map2DStrategy extends MapStrategy {
	constructor(map2D) {
		super();
		this.map2D = map2D;
	}

	createVectorLayer() {
		const vectorSource = new VectorSource();
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			zIndex: 100,
		});
		this.map2D.addLayer(vectorLayer);
		return { vectorSource, vectorLayer };
	}

	addInteraction(type, vectorSource, setDraw, setCurrentSpatial) {
		let geometryFunction;

		if (type === 'Box') {
			type = 'Circle';
			geometryFunction = createBox();
		}

		const newDraw = new Draw({
			source: vectorSource,
			type: type,
			geometryFunction: geometryFunction,
		});

		setDraw(newDraw);

		newDraw.on('drawstart', function () {
			setCurrentSpatial(null);
			vectorSource.clear();
		});

		newDraw.on('drawend', (event) => {
			const feature = event.feature;
			let geometry = feature.getGeometry();
			if (geometry.getType() === 'Circle') {
				const center = toLonLat(geometry.getCenter());
				const radius = geometry.getRadius();
				setCurrentSpatial({ center: center, radius: radius });
			} else {
				let newFeature = feature.clone();;
				newFeature.setGeometry(newFeature.getGeometry().transform(this.map2D.getView().getProjection().getCode(), DEFAULT_SRS));
				setCurrentSpatial(newFeature);
			}
		});

		this.map2D.addInteraction(newDraw);
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial) {
		setCurrentSpatial(null);
		vectorSource.clear();
		if (draw) {
			this.map2D.removeInteraction(draw);
			setDraw(null);
		}
		if (selectedIcon === icon) {
			setSelectedIcon(null);
			return;
		}
		setSelectedIcon(icon);
		if (icon === 'location') {
			setCurrentSpatial({bbox: get2DBbox(this.map2D)});
			return;
		}
		this.addInteraction(type, vectorSource, setDraw, setCurrentSpatial);
	}

	handleZoomIn() {
		const view = window.mapInstance.getView();
		view.setZoom(view.getZoom() + 1);
	}

	handleZoomOut() {
		const view = window.mapInstance.getView();
		view.setZoom(view.getZoom() - 1);
	}

	handleCurrentLocation() {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			const view = window.mapInstance.getView();
			const coords = fromLonLat([longitude, latitude]);
			view.animate({
				center: coords,
				zoom: 18,
				duration: 1500,
			});
		});
	}

	getBbox() {
		return get2DBbox(this.map2D);
	}

	addGeoJSONToMap(geojson) {
		addGeoJSONToMap(this.map2D, geojson);
	}

	removePOILayer() {
		removeLayerFromMap(this.map2D, POI_LAYER_NAME);
	}

	moveToSingleFeature(feature) {
		moveToSingleFeature(this.map2D, feature);
	}

	_convertCoordinatesToLonLat(coordinates) {
		if (Array.isArray(coordinates[0])) {
			return coordinates.map(coord => this._convertCoordinatesToLonLat(coord));
		} else {
			return toLonLat(coordinates);
		}
	}

	handleMeasureArea() {
		this.map2D.getLayers().forEach(layer => {
			if (layer instanceof VectorLayer) {
				layer.getSource().clear();
			}
		});
		this.map2D.getInteractions().forEach(interaction => {
			if (interaction instanceof Draw) {
				this.map2D.removeInteraction(interaction);
			}
		});
		this.map2D.getOverlays().clear(); // Clear overlays when switching tools
		const vectorSource = new VectorSource();
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			zIndex: 100,
		});
		this.map2D.addLayer(vectorLayer);

		const draw = new Draw({
			source: vectorSource,
			type: 'Polygon',
		});

		draw.on('drawstart', () => {
			vectorSource.clear();
			this.map2D.getOverlays().clear(); // Clear overlays on redraw
		});

		draw.on('drawend', (event) => {
			const feature = event.feature;
			const geometry = feature.getGeometry();
			const area = geometry.getArea();
			console.log('Measured Area:', area);

			// Display the measured area on the screen
			const coordinates = geometry.getInteriorPoint().getCoordinates();
			const overlay = new Overlay({
				position: coordinates,
				element: document.createElement('div'),
				offset: [0, -15],
				positioning: 'center-center'
			});
			overlay.getElement().innerHTML = `
				<div style="background: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 4px; border: 1px solid black; font-size: 12px;">
					${area.toFixed(2)} m²
				</div>`;
			this.map2D.addOverlay(overlay);
		});

		this.map2D.addInteraction(draw);
	}

	handleMeasureDistance() {
		this.map2D.getLayers().forEach(layer => {
			if (layer instanceof VectorLayer) {
				layer.getSource().clear();
			}
		});
		this.map2D.getInteractions().forEach(interaction => {
			if (interaction instanceof Draw) {
				this.map2D.removeInteraction(interaction);
			}
		});
		this.map2D.getOverlays().clear(); // Clear overlays when switching tools
		const vectorSource = new VectorSource();
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			zIndex: 100,
		});
		this.map2D.addLayer(vectorLayer);

		const draw = new Draw({
			source: vectorSource,
			type: 'LineString',
		});

		draw.on('drawstart', () => {
			vectorSource.clear();
			this.map2D.getOverlays().clear(); // Clear overlays on redraw
		});

		draw.on('drawend', (event) => {
			const feature = event.feature;
			const geometry = feature.getGeometry();
			const length = geometry.getLength();
			console.log('Measured Distance:', length);

			// Display the measured distance on the screen
			const coordinates = geometry.getLastCoordinate();
			const overlay = new Overlay({
				position: coordinates,
				element: document.createElement('div'),
				offset: [0, -15],
				positioning: 'center-center'
			});
			overlay.getElement().innerHTML = `
				<div style="background: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 4px; border: 1px solid black; font-size: 12px;">
					${length.toFixed(2)} m
				</div>`;
			this.map2D.addOverlay(overlay);
		});

		this.map2D.addInteraction(draw);
	}

	handleMeasureRadius() {
		this.map2D.getLayers().forEach(layer => {
			if (layer instanceof VectorLayer) {
				layer.getSource().clear();
			}
		});
		this.map2D.getInteractions().forEach(interaction => {
			if (interaction instanceof Draw) {
				this.map2D.removeInteraction(interaction);
			}
		});
		this.map2D.getOverlays().clear(); // Clear overlays when switching tools
		const vectorSource = new VectorSource();
		const vectorLayer = new VectorLayer({
			source: vectorSource,
			zIndex: 100,
		});
		this.map2D.addLayer(vectorLayer);

		const draw = new Draw({
			source: vectorSource,
			type: 'Circle',
		});

		draw.on('drawstart', () => {
			vectorSource.clear(); // Clear old figures on redraw
			this.map2D.getOverlays().clear(); // Clear overlays on redraw
		});

		draw.on('drawend', (event) => {
			const feature = event.feature;
			const geometry = feature.getGeometry();
			const radius = geometry.getRadius();
			console.log('Measured Radius:', radius);

			// Display the measured radius on the screen
			const coordinates = geometry.getCenter();
			const overlay = new Overlay({
				position: coordinates,
				element: document.createElement('div'),
				offset: [0, -15],
				positioning: 'center-center'
			});
			overlay.getElement().innerHTML = `
				<div style="background: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 4px; border: 1px solid black; font-size: 12px;">
					${radius.toFixed(2)} m
				</div>`;
			this.map2D.addOverlay(overlay);
		});

		this.map2D.addInteraction(draw);
	}

    handleMeasureAltitude() {
        console.log('Measure Altitude');
    }
}