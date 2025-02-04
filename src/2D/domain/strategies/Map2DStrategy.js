import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Circle, Fill, Stroke } from 'ol/style';
import { fromLonLat } from 'ol/proj';
import { toLonLat } from 'ol/proj';
import { get2DBbox } from '../../../common/domain/utils/2DBbox';
import { DEFAULT_SRS, POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';
import { addGeoJSONToMap, removeLayerFromMap, moveToSingleFeature } from '../../utils/Map2DUtils';

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

	eventHandler() {
		let self = this;

		this.map2D.on('click', function (event) {
			self.coordinate = toLonLat(event.coordinate);
			self._showPoint(self.coordinate, 'red');
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
				"direction": 90,
				"tilt": 45,
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
			duration: 1500,
		});
	}

	removeBookmark() {
		let self = this;
		if (!!self.vectorLayer) {
			self.map2D.removeLayer(self.vectorLayer);
		}
	}

	_showPoint(coordinate, color){
		let self = this;
		console.log("self", self);
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