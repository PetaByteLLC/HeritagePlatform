import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { Draw } from 'ol/interaction';
import { createBox } from 'ol/interaction/Draw';
import { fromCircle } from 'ol/geom/Polygon';
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

	addInteraction(type, vectorSource, setDraw, setCurrentFeature) {
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
	
		newDraw.on('drawend', (event) => {
			console.log(this);
			this.map2D.removeInteraction(newDraw);
		});
	
		this.map2D.addInteraction(newDraw);
	}

	// addInteraction(type, vectorSource, setDraw, setCurrentFeature) {
	// 	if (this.draw) {
	// 		this.map2D.removeInteraction(this.draw);
	// 	}
	// 	if (this.currentFeature) {
	// 		vectorSource.removeFeature(this.currentFeature);
	// 		setCurrentFeature(null);
	// 	}
	// 	let geometryFunction;
	// 	if (type === 'Box') {
	// 		type = 'Circle';
	// 		geometryFunction = createBox();
	// 	}
	// 	const newDraw = new Draw({
	// 		source: vectorSource,
	// 		type: type,
	// 		geometryFunction: geometryFunction,
	// 	});
	// 	this.map2D.addInteraction(newDraw);
	// 	setDraw(newDraw);

	// 	newDraw.on('drawend', (event) => {
	// 		if (this.currentFeature) {
	// 			vectorSource.removeFeature(this.currentFeature);
	// 		}
	// 		const feature = event.feature;
	// 		setCurrentFeature(feature);
	// 		let geometry = feature.getGeometry();
	// 		if (geometry.getType() === 'Circle') {
	// 			geometry = fromCircle(geometry, 64);
	// 		}
	// 		const geojson = new GeoJSON().writeGeometry(geometry);
	// 		console.log(geojson);
	// 	});
	// }

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, currentFeature, setCurrentFeature) {
		if (selectedIcon === icon) {
			setSelectedIcon(null);
			if (draw) {
				this.map2D.removeInteraction(draw);
			}
			if (currentFeature) {
				vectorSource.removeFeature(currentFeature);
				setCurrentFeature(null);
			}
		} else {
			setSelectedIcon(icon);
			this.addInteraction(type, vectorSource, setDraw, setCurrentFeature);
		}
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