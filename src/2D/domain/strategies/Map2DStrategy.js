import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { toLonLat } from 'ol/proj';
import { get2DBbox } from '../../../common/domain/utils/2DBbox';
import { DEFAULT_SRS, POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';
import { addGeoJSONToMap, removeLayerFromMap, moveToSingleFeature } from '../../utils/Map2DUtils';
import Overlay from 'ol/Overlay';
import { Feature } from 'ol';
import { LineString, Point } from "ol/geom";

export class Map2DStrategy extends MapStrategy {
	constructor(map2D) {
		super();
		this.map2D = map2D;
		this.eventHandler();
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
		this.clearPreviousMeasurements();
		this.removeExistingDrawInteractions();
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
		this.clearPreviousMeasurements();
		this.removeExistingDrawInteractions();
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

    handleToolIconClick(icon, selectedIcon, setSelectedIcon) {
        this.removeExistingDrawInteractions();
        if (selectedIcon === icon) {
            setSelectedIcon(null);
            this.clearPreviousMeasurements();
            this.map2D.getTargetElement().style.cursor = 'default';
            return;
        }
        setSelectedIcon(icon);
        this.handleToolAction(icon);
    }

    handleToolAction(icon) {
        if (icon === 'area') {
            this.handleMeasureArea();
        } else if (icon === 'distance') {
            this.handleMeasureDistance();
        } else if (icon === 'radius') {
            this.handleMeasureRadius();
        } else if (icon === 'altitude') {
            this.handleMeasureAltitude();
        }
    }

    clearPreviousMeasurements() {
        this.map2D.getLayers().forEach(layer => {
            if (layer instanceof VectorLayer) layer.getSource().clear();
        });
        this.map2D.getOverlays().clear();
        document.querySelectorAll('.measurement-popup').forEach(popup => popup.remove());
    }

    removeExistingDrawInteractions() {
        this.map2D.getInteractions().forEach(interaction => {
            if (interaction instanceof Draw) this.map2D.removeInteraction(interaction);
        });
    }

    displayMeasurement(coordinates, value, unit) {
        const popup = document.createElement('div');
        popup.className = 'measurement-popup';
        popup.style.color = 'red';
        popup.innerHTML = `<strong>${value.toFixed(2)} ${unit}</strong>`;
        document.body.appendChild(popup);

        const overlay = new Overlay({ position: coordinates, element: popup, offset: [0, -15], positioning: 'center-center' });
        this.map2D.addOverlay(overlay);
    }

    handleMeasureDistance() {
        this.clearPreviousMeasurements();
        this.removeExistingDrawInteractions();
        const { vectorSource } = this.createVectorLayer();

        const draw = new Draw({ source: vectorSource, type: 'LineString' });
        draw.on('drawstart', () => {
            vectorSource.clear();
            this.map2D.getOverlays().clear();
        });
        draw.on('drawend', (event) => {
            const length = event.feature.getGeometry().getLength();
            this.displayMeasurement(event.feature.getGeometry().getLastCoordinate(), length, 'm');
        });

        this.map2D.addInteraction(draw);
    }

    handleMeasureArea() {
        this.clearPreviousMeasurements();
        this.removeExistingDrawInteractions();
        const { vectorSource } = this.createVectorLayer();

        const draw = new Draw({ source: vectorSource, type: 'Polygon' });
        draw.on('drawstart', () => {
            vectorSource.clear();
            this.map2D.getOverlays().clear();
        });
        draw.on('drawend', (event) => {
            const area = event.feature.getGeometry().getArea();
            this.displayMeasurement(event.feature.getGeometry().getInteriorPoint().getCoordinates(), area, 'm²');
        });

        this.map2D.addInteraction(draw);
    }

    handleMeasureRadius() {
        this.clearPreviousMeasurements();
        this.removeExistingDrawInteractions();
        const { vectorSource } = this.createVectorLayer();

        const draw = new Draw({ source: vectorSource, type: 'Circle' });
        draw.on('drawstart', () => {
            vectorSource.clear();
            this.map2D.getOverlays().clear();
        });
        draw.on('drawend', (event) => {
            const feature = event.feature;
            const geometry = feature.getGeometry();
            const radius = geometry.getRadius();
            const center = geometry.getCenter();
            const radiusLine = new Feature(new LineString([center, [center[0] + radius, center[1]]]));
            vectorSource.addFeature(radiusLine);
            const centerPoint = new Feature(new Point(center));
            vectorSource.addFeature(centerPoint);
            const midPoint = [(center[0] + (center[0] + radius)) / 2, center[1]];
            this.displayMeasurement(midPoint, radius, 'm');
        });

        this.map2D.addInteraction(draw);
    }

    handleMeasureAltitude() {
        this.clearPreviousMeasurements();
        alert('Height measurement is not possible on a 2D map. Use a 3D map or external height services.');
        console.log('Measuring height on a 2D map is not possible.');
    }

	eventHandler() {
		let self = this;

		self.map2D.on('click', function (event) {
			var coordinate = toLonLat(event.coordinate);
			// console.log(self.coordinate);
			self._showPoint(coordinate, 'red');
			self.coordinate = coordinate;
		});
	}

	createBookmark(name, distance, color) : object {
		let view = this.map2D.getView();
		return {
			"type": "Feature",
			"id": null,
			"geometry": {
				"type": "Point",
				"coordinates": this.coordinate
			},
			"geometry_name": "geom",
			"properties": {
				"name": name,
				"level": Math.floor(view.getZoom()),
				"direction":0,
				"tilt": 90,
				"fov_x": 88,
				"fov_y": 88,
				"color": color || "#c8ff00",
				"altitude": this._getZoomHeightMeters(),
				"distance": distance,
				"date":  Math.floor(new Date().getTime() / 1000)
			}
		};
	}

	showBookmark(feature) {
		this._showPoint(feature.geometry.coordinates, feature.properties.color);

		const view = this.map2D.getView();
		view.animate({
			center: fromLonLat(feature.geometry.coordinates),
			zoom: feature.properties.level,
			duration: 500,
		});
	}

	viewBookmark(feature) {
		this.showBookmark(feature);
	}

	removeBookmark() {
		let self = this;
		if (!!self.vectorLayer) {
			self.map2D.removeLayer(self.vectorLayer);
		}
	}

	_showPoint(coordinate, color){
		let self = this;
		this.coordinate = null;
		// console.log("self", self);
		if (!!self.vectorLayer) {
			self.map2D.removeLayer(self.vectorLayer);
		}

		const vectorSource = new VectorSource();
		self.vectorLayer = new VectorLayer({
			source: vectorSource,
			style: new Style({
				image: new Circle({
					radius: 10,
					fill: new Fill({ color: color }),
					stroke: new Stroke({ color: 'white', width: 2 })
				})
			})
		});
		self.vectorLayer.setZIndex(100);

		self.map2D.addLayer(self.vectorLayer);

		let pointFeature = new Feature({
			geometry: new Point(fromLonLat(coordinate))
		});

		vectorSource.addFeature(pointFeature);
	}

	_getZoomHeightMeters() {
		const view = this.map2D.getView();
		const resolution = view.getResolution();
		const heightPixels = this.map2D.getSize()[1]; // Количество пикселей по высоте
		return resolution * heightPixels;
	}
}