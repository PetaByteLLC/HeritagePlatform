import {MapStrategy} from '../../../common/domain/strategies/MapStrategy';
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";

export class Map3DStrategy extends MapStrategy {
	constructor(map3D) {
		super();
		this.map3D = map3D;
		this.m_mercount = 0;
		this.m_objcount = 0;
	}

	addInteraction(icon, setCurrentSpatial) {
		console.log('draw');
		this.clearMeasurements();
		this.clearPreviousShapes();
		let coordinate = null;
		switch (icon) {
			case 'circle':
				this.initRadiusEvent(this.map3D.canvas, setCurrentSpatial);
				return;
			case 'polygon':
				this.initAreaEvent(setCurrentSpatial);
				return;
			case 'square':
				this.initRectangleEvent(setCurrentSpatial);
				return;
			default:
				coordinate = this.getBbox();
		}
		setCurrentSpatial(coordinate);
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial) {
		this.clearPreviousShapes();
		setCurrentSpatial(null);
		if (selectedIcon === icon) {
			setSelectedIcon(null);
			this.clearMeasurements();
			return;
		}
		setSelectedIcon(icon);
		if (icon === 'location') {
			setCurrentSpatial({bbox: this.getBbox()});
			return;
		}
		this.addInteraction(icon, setCurrentSpatial);
	}

	initRadiusEvent(canvas, setCurrentSpatial) {
		this.setMouseState('circle');

		let layerList = new this.map3D.JSLayerList(true);
		let POILayer = layerList.createLayer("MEASURE_POI", this.map3D.ELT_3DPOINT);
		POILayer.setMaxDistance(20000.0);
		POILayer.setSelectable(false);

		let WallLayer = layerList.createLayer("MEASURE_WALL", this.map3D.ELT_POLYHEDRON);
		WallLayer.setMaxDistance(20000.0);
		WallLayer.setSelectable(false);
		WallLayer.setEditable(true);

		canvas.addEventListener("Fire_EventAddRadius", function (e) {
			if (e.dTotalDistance > 0) {
				setCurrentSpatial({
					center: [e.dLon, e.dLat],
					radius: e.dTotalDistance
				});
			}
		});
	}

	initAreaEvent(setCurrentSpatial) {
		this.setMouseState('polygon');
		this.createMeasureLayer();
		this.map3D.getOption().callBackAddPoint((e) => {
			this.clearPreviousShapes();
			this.addPoint(e);
		});

		this.map3D.getOption().callBackCompletePoint(() => {
			const polygonCoords = this.endPoint();
			setCurrentSpatial(polygonCoords);
		});
	}

	createMeasureLayer() {
		let layerList = new this.map3D.JSLayerList(true);
		let layer = layerList.createLayer("MEASURE_POI", this.map3D.ELT_3DPOINT);
		layer.setMaxDistance(20000.0);
		layer.setSelectable(false);
	}

	clearPreviousShapes() {
		this.m_mercount = 0;
		this.m_objcount = 0;
		let layerList = new this.map3D.JSLayerList(true);

		this.clearLayer(layerList, "POLYGON_LAYER");
		this.clearLayer(layerList, "MEASURE_POI");
		this.clearLayer(layerList, "MEASURE_WALL");
	}

	clearLayer(layerList, layerName) {
		let layer = layerList.nameAtLayer(layerName);
		if (layer) {
			layer.removeAll();
		}
	}

	addPoint(e) {
		this.createPOI(new this.map3D.JSVector3D(e?.dLon, e?.dLat, e?.dAlt));
	}

	endPoint() {
		const polygonCoords = this.createPolygon();
		this.m_mercount++;
		return polygonCoords;
	}

	createPOI(position) {
		let layerList = new this.map3D.JSLayerList(true);
		let layer = layerList.nameAtLayer("MEASURE_POI");

		let poi = this.map3D.createPoint(`${this.m_mercount}_POI_${this.m_objcount}`);
		poi.setPosition(position);
		layer.addObject(poi, 0);
		this.m_objcount++;
	}

	createPolygon() {
		let map = this.map3D.getMap();
		let inputPoints = map.getInputPoints();
		let inputPointCount = inputPoints.count();

		if (inputPointCount < 3) {
			console.warn("Not enough points to create a polygon.");
			return null;
		}

		let layerList = new this.map3D.JSLayerList(true);
		let layer = layerList.nameAtLayer("POLYGON_LAYER") ||
			layerList.createLayer("POLYGON_LAYER", this.map3D.ELT_POLYHEDRON);

		let polygon = this.map3D.createPolygon("POLYGON");

		let part = new this.map3D.Collection();
		part.add(inputPointCount);

		let vertex = new this.map3D.JSVec3Array();
		let coordinates = [];

		for (let i = 0; i < inputPointCount; i++) {
			let point = inputPoints.get(i);
			let coord = {
				longitude: point.Longitude,
				latitude: point.Latitude,
				altitude: point.Altitude + 10.0
			};
			coordinates.push(coord);
			vertex.push(new this.map3D.JSVector3D(coord.longitude, coord.latitude, coord.altitude));
		}

		polygon.setPartCoordinates(vertex, part);

		polygon.setStyle(this.getPolygonStyle());

		layer.addObject(polygon, 0);

		map.clearInputPoint();
		this.map3D.XDClearDistanceMeasurement();

		return this.convertToFeature(coordinates);
	}

	getPolygonStyle() {
		const polyStyle = new this.map3D.JSPolygonStyle();
		polyStyle.setFill(false);
		polyStyle.setOutLine(true);
		polyStyle.setOutLineColor(new this.map3D.JSColor(255, 255, 255, 0));

		return polyStyle;
	}

	convertToFeature(coords) {
		if (!Array.isArray(coords) || coords.length < 3) return null;

		const closedCoords = [...coords, coords[0]];
		const transformedCoords = closedCoords.map(coord => [coord.longitude, coord.latitude]);

		return new Feature({
			geometry: new Polygon([transformedCoords])
		});
	}

	initRectangleEvent(setCurrentSpatial) {
		this.setMouseState('square');
		this.clickHandlerRef = (event)=> {
			if (event.target.tagName !== 'CANVAS') return;
			setCurrentSpatial(this.clickHandler(event));
			this.removeClickHandler();
		};

		document.body.addEventListener('click', (event) => this.clickHandlerRef(event));
	}

	clickHandler(event) {
		return this.getSquareCoordinates();
	}

	removeClickHandler() {
		console.log(this.clickHandlerRef)
		if (this.clickHandlerRef) {
			document.body.removeEventListener('click', this.clickHandlerRef);
		}
	}

	getSquareCoordinates() {
		var map = this.map3D.getMap();
		var inputPoints = map.getInputPoints();
		if (inputPoints.count() < 4) return;
		var a = map.getInputPointList().item(1);
		var b = map.getInputPointList().item(2);
		var c = map.getInputPointList().item(3);
		var d = map.getInputPointList().item(4);

		let inputPointsArr = [a, b, c, d];

		let coordinates = inputPointsArr.map(point => ({
			longitude: point.Longitude,
			latitude: point.Latitude
		}));
		return this.convertToFeature(coordinates);
	}

	setMouseState(state) {
		const mouseStates = {
			square: this.map3D.MML_INPUT_RECT,
			polygon: this.map3D.MML_ANALYS_DISTANCE,
            circle: this.map3D.MML_ANALYS_AREA_CIRCLE,
			default: this.map3D.MML_MOVE_GRAB,
        };

        const mouseState = mouseStates[state];
        if (mouseState) {
            this.map3D.XDSetMouseState(mouseState);
			console.log(`Mouse state set to: ${state}`);
		} else {
			console.warn(`Unknown mouse state: ${state}`);
		}
	}

	getBbox() {
		const camera = this.map3D.getViewCamera();
		var center = camera.getLocation();
		var viewHeight = center.altitude;
		var zeroHeight = this.map3D.getMap().getTerrHeight(center.longitude, center.latitude);
		var yAxis = 74 * (viewHeight - zeroHeight) / 142;
	
		let tilt = camera.getTilt();
		var distance = tilt < 50 ? yAxis * 10 : yAxis * 5;
		if (viewHeight > this.maxBboxDistance || distance > this.maxBboxDistance) {
			distance = this.maxBboxDistance;
		}
		
		var newCenter = this.map3D.getMap().ScreenToMapPointEX(new this.map3D.JSVector2D(window.innerWidth / 2, window.innerHeight / 2));
	
		if (newCenter === null) {
			alert('Please change the view of camera');
			return;
		}
	
		var topRight = this.addDistanceToCoordinates(newCenter.latitude, newCenter.longitude, distance, 45);
		var bottomLeft = this.addDistanceToCoordinates(newCenter.latitude, newCenter.longitude, distance, -135);
	
		return [
			Math.min(bottomLeft.longitude, topRight.longitude),
			Math.min(bottomLeft.latitude, topRight.latitude),
			Math.max(bottomLeft.longitude, topRight.longitude),
			Math.max(bottomLeft.latitude, topRight.latitude)
		];
	}
	
	addDistanceToCoordinates(latitude, longitude, distance, bearing) {
		const R = 6371000;
	
		const bearingRad = (bearing * Math.PI) / 180;
	
		const lat1 = (latitude * Math.PI) / 180;
		const lon1 = (longitude * Math.PI) / 180;
	
		const lat2 = Math.asin(
			Math.sin(lat1) * Math.cos(distance / R) +
			Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
		);
		const lon2 = lon1 + Math.atan2(
			Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
			Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
		);
	
		return {
			latitude: lat2 * (180 / Math.PI),
			longitude: lon2 * (180 / Math.PI)
		};
	}

    clearMeasurements() {
        this.map3D.XDSetMouseState(this.map3D.MML_MOVE_GRAB);
		this.map3D.XDClearDistanceMeasurement();
		this.map3D.XDClearAreaMeasurement();
		this.map3D.XDClearCircleMeasurement();
		this.removeClickHandler();
    }

	handleZoomIn() {
		this.zoom(4);
	}

	handleZoomOut() {
		this.zoom(-4);
	}

	zoom(steps) {
		for (let i = 0; i < Math.abs(steps); i++) {
			if (steps > 0) {
				this.map3D.getViewCamera().ZoomIn();
			} else {
				this.map3D.getViewCamera().ZoomOut();
			}
		}
	}

	handleCurrentLocation() {
		if (!navigator.geolocation) return;
		navigator.geolocation.getCurrentPosition((position) => {
			const { latitude, longitude } = position.coords;
			this.map3D.getViewCamera().moveOval(new this.map3D.JSVector3D(longitude, latitude, 500.0), 90, 0, 0.1);
		});
	}
}