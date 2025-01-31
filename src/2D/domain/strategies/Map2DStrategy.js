import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';

export class Map2DStrategy extends MapStrategy {
	constructor(map2D) {
		super();
		this.map2D = map2D;
	}

	createVectorLayer() {
		const vectorSource = new VectorSource();
		const vectorLayer = new VectorLayer({
			source: vectorSource,
		});
		this.map2D.addLayer(vectorLayer);
		return { vectorSource, vectorLayer };
	}

	addInteraction(type, vectorSource, setDraw) {
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
			vectorSource.clear();
		});

		newDraw.on('drawend', (event) => {
			const feature = event.feature;
			let geometry = feature.getGeometry();
			if (geometry.getType() === 'Circle') {
				const center = geometry.getCenter();
				const radius = geometry.getRadius();
				const circumferencePoint = [center[0] + radius, center[1]];
				const points = {
					center: center,
					circumferencePoint: circumferencePoint,
				};
				console.log(points);
			} else {
				const geojson = new GeoJSON().writeFeature(feature);
				console.log(geojson);
			}
		});

		this.map2D.addInteraction(newDraw);
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource) {
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
		this.addInteraction(type, vectorSource, setDraw);
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
}