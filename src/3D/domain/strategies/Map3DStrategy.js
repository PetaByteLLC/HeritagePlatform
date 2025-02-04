import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { addGeoJSONToMap, removeLayerFromMap, moveToSingleFeature } from '../../utils/Map3DUtils';
import { POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';

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
		addGeoJSONToMap(this.map3D, geojson);
	}

	removePOILayer() {
		removeLayerFromMap(this.map3D, POI_LAYER_NAME);
	}

	moveToSingleFeature(feature) {
		moveToSingleFeature(this.map3D, feature);
	}

	createBookmark(name, color = "#c8ff00"): object {
		let camera = this.map3D.getViewCamera();
		let cameraPosition = camera.getPosition();

		return {
			"type": "Feature",
			"id": null,
			"geometry": {
				"type": "Point",
				"coordinates": [
					cameraPosition.longitude,
					cameraPosition.latitude
				]
			},
			"geometry_name": "geom",
			"properties": {
				"name": name,
				"level": camera.getMapZoomLevel(),
				"direction": camera.getDirect(),
				"tilt": camera.getTilt(),
				"fox_x": camera.videoFovX,
				"fov_y": camera.videoFovY,
				"color": color || "#c8ff00",
				"altitude": camera.getAltitude(),
				"date":  Math.floor(new Date().getTime() / 1000)
			}
		};
	}

	showBookmark(feature) {
		if (!this.layer) {
			let layerList = new this.map3D.JSLayerList(true);
			this.layer = layerList.createLayer("CCTV", this.map3D.ELT_POLYHEDRON);
		}

		if (!!this.frustum) {
			this.layer.removeAtObject(this.frustum);
		}

		this.map3D.getViewCamera().setLocation(new this.map3D.JSVector3D(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.altitude + 700.0));

		this.frustum = this.map3D.createViewFrustum("FRUSTUM");
		this.frustum.createViewFrustum(
			new this.map3D.JSVector3D(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.altitude),
			feature.properties.direction, feature.properties.tilt,
			feature.properties.fox_x, feature.properties.fov_y,
			100
		);
		let color = new this.map3D.JSColor();
		color.setHexCode(feature.properties.color+'50');
		this.frustum.setColor(color);

		this.layer.addObject(this.frustum, 0);

		this.map3D.XDRenderData();
	}

	removeBookmark() {
		if (!!this.layer && !!this.frustum) {
			this.layer.removeAtObject(this.frustum);
		}
	}
}