import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';

export class Map3DStrategy extends MapStrategy {
	constructor(map3D) {
		super();
		this.map3D = map3D;
	}

	addInteraction(type, vectorSource, setDraw, setCurrentFeature) {
		console.log('3D interaction logic not implemented yet');
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, vectorSource, currentFeature, setCurrentFeature, addInteraction) {
		console.log('3D icon click logic not implemented yet');
	}

	handleZoomIn() {
		this.map3D.getViewCamera().ZoomIn();
		this.map3D.getViewCamera().ZoomIn();
		this.map3D.getViewCamera().ZoomIn();
		this.map3D.getViewCamera().ZoomIn();
	}

	handleZoomOut() {
		this.map3D.getViewCamera().ZoomOut();
		this.map3D.getViewCamera().ZoomOut();
		this.map3D.getViewCamera().ZoomOut();
		this.map3D.getViewCamera().ZoomOut();
	}

	handleCurrentLocation() {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			this.map3D.getViewCamera().moveOval(new this.map3D.JSVector3D(longitude, latitude, 500.0), 90, 0, 0.1);
		});
	}

	getBbox() {
		console.log('Not implemented yet');
	}

	addGeoJSONToMap(geojson) {
		console.log('Not implemented yet');
	}

	removePOILayer() {
		console.log('Not implemented yet');
	}

	moveToSingleFeature(feature) {
		console.log('Not implemented yet');
	}
}