import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { addGeoJSONToMap, removeLayerFromMap, moveToSingleFeature } from '../../utils/Map3DUtils';
import { POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';

export class Map3DStrategy extends MapStrategy {
	constructor(map3D) {
		super();
		this.map3D = map3D;
		console.log("Map3DStrategy initialized");
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

	createBookmark(name, distance, color): object {
		let camera = this.map3D.getViewCamera();
		let cameraLocation = camera.getLocation();

		return {
			"type": "Feature",
			"id": null,
			"geometry": {
				"type": "Point",
				"coordinates": [
					cameraLocation.longitude,
					cameraLocation.latitude
				]
			},
			"geometry_name": "geom",
			"properties": {
				"name": name,
				"level": camera.getMapZoomLevel(),
				"direction": camera.getDirect(),
				"tilt": camera.getTilt(),
				"fov_x": camera.videoFovX,
				"fov_y": camera.videoFovY,
				"color": color || "#c8ff00",
				"altitude": camera.getAltitude(),
				"distance": distance,
				"date":  Math.floor(new Date().getTime() / 1000)
			}
		};
	}

	showBookmark(feature) {
		if (!this.layer) {
			let layerList = new this.map3D.JSLayerList(true);
			this.layer = layerList.createLayer("CCTV", this.map3D.ELT_POLYHEDRON);
		}
		else if (!!this.frustum) {
			this.layer.removeAll();
		}

		this.map3D.getViewCamera().setLocation(new this.map3D.JSVector3D(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.altitude + 700.0));
		this.map3D.getViewCamera().setTilt(85);

		let color = new this.map3D.JSColor();
		color.setHexCode(feature.properties.color.replace('#', '#CC'));

		let lineColor = new this.map3D.JSColor();
		lineColor.setHexCode(feature.properties.color);

		this.frustum = this._createViewFrustum({
			position: new this.map3D.JSVector3D(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.altitude),
			pan: feature.properties.direction,
			tilt: feature.properties.tilt,
			fov_x: feature.properties.fov_x,
			fov_y: feature.properties.fov_y,
			distance: feature.properties.distance,
			color: color
		});

		// Create a line object perpendicular to the ground from the frustum starting position
		this._createVerticalLine(this.frustum.getEyepos(), lineColor);

		this.layer.addObject(this.frustum, 0);

		this.map3D.XDRenderData();
	}

	viewBookmark(feature) {
		this.removeBookmark();
		this.map3D.getViewCamera().setLocation(new this.map3D.JSVector3D(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.altitude));
		this.map3D.getViewCamera().setTilt(feature.properties.tilt);
		this.map3D.getViewCamera().setDirect(feature.properties.direction);
	}

	removeBookmark() {
		if (!!this.layer && !!this.frustum) {
			this.layer.removeAll();
		}
		if (!!this.lineLayer && !!this.line) {
			this.lineLayer.removeAll();
		}
	}

	_createViewFrustum(_options) {

		let frustum = this.map3D.createViewFrustum("FRUSTUM");
		frustum.createViewFrustum(
			_options.position,
			_options.pan, _options.tilt,
			_options.fov_x, _options.fov_y,
			_options.distance
		);
		frustum.setColor(_options.color);

		return frustum;
	}

	_createVerticalLine(_position, color) {

		if (!this.lineLayer) {
			// Create line layer
			let layerList = new this.map3D.JSLayerList(true);
			this.lineLayer = layerList.createLayer("FRUSTUM_LINE_LAYER", this.map3D.ELT_3DLINE);
		}
		else if (!!this.line) {
			this.lineLayer.removeAll();
		}

		this.line = this.map3D.createLineString("FRUSTUM_LINE");

		let vertices = new this.map3D.JSVec3Array();
		vertices.push(_position);
		_position.Altitude = 0.0;
		vertices.push(_position);

		let part = new this.map3D.Collection();
		part.add(2);

		this.line.setPartCoordinates(vertices, part);
		this.line.setUnionMode(false);

		// Set line color
		let lineStyle = new this.map3D.JSPolyLineStyle();
		lineStyle.setColor(color);
		lineStyle.setWidth(2.0);
		this.line.setStyle(lineStyle);

		this.lineLayer.addObject(this.line, 0);
	}
}