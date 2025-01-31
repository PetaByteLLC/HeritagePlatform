import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import { toLonLat } from 'ol/proj';
import { get2DBbox } from '../../../common/domain/utils/2DBbox';
import { DEFAULT_SRS } from '../../../common/constants/GeoserverConfig';

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

	_convertCoordinatesToLonLat(coordinates) {
		if (Array.isArray(coordinates[0])) {
			return coordinates.map(coord => this._convertCoordinatesToLonLat(coord));
		} else {
			return toLonLat(coordinates);
		}
	}
}