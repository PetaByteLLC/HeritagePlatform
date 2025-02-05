import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';
import { addGeoJSONToMap, removeLayerFromMap, moveToSingleFeature, convertToGeoJSON } from '../../utils/Map3DUtils';
import { POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';

export class Map3DStrategy extends MapStrategy {
	constructor(map3D) {
		super();
		this.map3D = map3D;
		this.m_mercount = 0;
		this.m_objcount = 0;
        this.altIndex = 0;
        this.addDistancePoint = this.addDistancePoint.bind(this);
        this.endDistancePoint = this.endDistancePoint.bind(this);
        this.addAreaPoint = this.addAreaPoint.bind(this);
        this.endAreaPoint = this.endAreaPoint.bind(this);
	}

	addInteraction(icon, setCurrentSpatial) {
		this.clearEvents();
		let coordinate = null;
		switch (icon) {
			case 'circle':
				this.initRadiusEvent(setCurrentSpatial);
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
			this.clearMeasurements();
			setCurrentSpatial({bbox: this.getBbox()});
			return;
		}
		this.addInteraction(icon, setCurrentSpatial);
	}

	initRadiusEvent(setCurrentSpatial) {
		this.setMouseState('circle');

		let layerList = new this.map3D.JSLayerList(true);
		let POILayer = layerList.createLayer("MEASURE_POI", this.map3D.ELT_3DPOINT);
		POILayer.setMaxDistance(20000.0);
		POILayer.setSelectable(false);

		let WallLayer = layerList.createLayer("MEASURE_WALL", this.map3D.ELT_POLYHEDRON);
		WallLayer.setMaxDistance(20000.0);
		WallLayer.setSelectable(false);
		WallLayer.setEditable(true);

		this.radiusListener = function (e) {
			if (e.dTotalDistance > 0) {
				setCurrentSpatial({
					center: [e.dLon, e.dLat],
					radius: e.dTotalDistance,
				});
			}
		};

		this.map3D.canvas.addEventListener("Fire_EventAddRadius", this.radiusListener);
	}

	removeRadiusEvent() {
		this.map3D.canvas.removeEventListener("Fire_EventAddRadius", this.radiusListener);
	}

	initAreaEvent(setCurrentSpatial) {
		this.setMouseState('polygon');
		this.createMeasureLayer();

		this.handlePolygonClick = (event) => {
			const mapPoint = this.map3D.getMap().ScreenToMapPointEX(
				new this.map3D.JSVector2D(event.clientX, event.clientY)
			);

			if (mapPoint) {
				this.addPolygonPoint(mapPoint);
			}
		};

		document.body.addEventListener('click', this.handlePolygonClick);

		this.map3D.getOption().callBackCompletePoint(() => {
			this.clearPreviousShapes();
			const polygonCoords = this.endPoint();
			setCurrentSpatial(polygonCoords);
			this.removePolygonClickEvent();
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
		this.clearLayer(layerList, "ALTITUDE_MEASURE_POI");
		this.clearLayer(layerList, "MEASURE_RADIUS_POI");
		this.clearLayer(layerList, "MEASURE_RADIUS_WALL");
		this.clearLayer(layerList, "MEASURE_AREA_POI");
		this.clearLayer(layerList, "MEASURE_DISTANCE_POI");
	}

	clearLayer(layerList, layerName) {
		let layer = layerList.nameAtLayer(layerName);
		if (layer) {
			layer.removeAll();
		}
	}

	addPolygonPoint(mapPoint) {
		this.createPOI(new this.map3D.JSVector3D(mapPoint.Longitude, mapPoint.Latitude, mapPoint.Altitude));
	}

	removePolygonClickEvent() {
		this.map3D.canvas.removeEventListener('click', this.handlePolygonClick);
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

		return convertToGeoJSON(coordinates);
	}

	getPolygonStyle() {
		const polyStyle = new this.map3D.JSPolygonStyle();
		polyStyle.setFill(false);
		polyStyle.setOutLine(true);
		polyStyle.setOutLineColor(new this.map3D.JSColor(255, 255, 255, 0));

		return polyStyle;
	}

	initRectangleEvent(setCurrentSpatial) {
		this.setMouseState('square');

		this.handleClickEvent = (event) => {
			const coordinates = this.getSquareCoordinates();
			if (coordinates) {
				setCurrentSpatial(coordinates);
			}
		};

        this.map3D.canvas.addEventListener('click', this.handleClickEvent);
	}

	removeRectangleEvent() {
        this.map3D.canvas.removeEventListener('click', this.handleClickEvent);
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
		return convertToGeoJSON(coordinates);
	}

	setMouseState(state) {
		const mouseStates = {
			square: this.map3D.MML_INPUT_RECT,
			polygon: this.map3D.MML_ANALYS_DISTANCE,
			circle: this.map3D.MML_ANALYS_AREA_CIRCLE,
			default: this.map3D.MML_MOVE_GRAB,
			altitude: this.map3D.MML_ANALYS_ALTITUDE,
			distance: this.map3D.MML_ANALYS_DISTANCE_STRAIGHT,
			area: this.map3D.MML_ANALYS_AREA_PLANE,
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
	}

    clearEvents() {
        this.clearMeasurements();
        this.clearPreviousShapes();
        this.removeRectangleEvent();
        this.removePolygonClickEvent();
        this.removeRadiusEvent();
        this.removeAltitudeEvent();
        this.removeRadiusMeasureEvent();
        this.removeAreaMeasureEvent();
        this.removeDistanceMeasureEvent();
        this.clearAltitudeAnalysis();
        this.clearRadiusAnalysis();
        this.clearAreaAnalysis();
        this.map3D.getOption().callBackAddPoint(null);
        this.map3D.getOption().callBackCompletePoint(null);
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

	addGeoJSONToMap(geojson) {
		addGeoJSONToMap(this.map3D, geojson);
	}

	removePOILayer() {
		removeLayerFromMap(this.map3D, POI_LAYER_NAME);
	}

	moveToSingleFeature(feature) {
		moveToSingleFeature(this.map3D, feature);
	}

	handleMeasureAltitude() {
		this.clearEvents();
		this.setMouseState('altitude');
		this.altitudeSymbol = this.map3D.getSymbol();

		var layerList = new this.map3D.JSLayerList(true);
		this.altitudeLayer = layerList.createLayer("ALTITUDE_MEASURE_POI", this.map3D.ELT_3DPOINT);
		this.altitudeLayer.setMaxDistance(20000.0);
		this.altitudeLayer.setSelectable(false);

		this.altitudeListener = (e) => {
			this.createAltitudePOI(new this.map3D.JSVector3D(e.dLon, e.dLat, e.dAlt),
				"rgba(10, 10, 0, 0.5)",
				e.dGroundAltitude, e.dObjectAltitude);
		};

		this.map3D.canvas.addEventListener("Fire_EventAddAltitudePoint", this.altitudeListener);
	}

	removeAltitudeEvent() {
		this.map3D.canvas.removeEventListener("Fire_EventAddAltitudePoint", this.altitudeListener);
	}

	createAltitudePOI(_position, _color, _value, _subValue) {

		var drawCanvas = document.createElement('canvas');
		drawCanvas.width = 200;
		drawCanvas.height = 100;

		var imageData = this.drawIcon(drawCanvas, _color, _value, _subValue),
			altIndex = this.altIndex;

        if (this.altitudeSymbol.insertIcon("AltitudeIcon"+altIndex, imageData, drawCanvas.width, drawCanvas.height)) {

            var icon = this.altitudeSymbol.getIcon("AltitudeIcon"+altIndex);

            var poi = this.map3D.createPoint("ALTITUDE_POI"+altIndex);
            poi.setPosition(_position);
            poi.setIcon(icon);

			this.altitudeLayer.addObject(poi, 0);
			this.altIndex++;
		}
	}

	drawIcon(_canvas, _color, _value, _subValue) {
		var ctx = _canvas.getContext('2d'),
			width = _canvas.width,
			height = _canvas.height
		;
		ctx.clearRect(0, 0, width, height);

		if (_subValue === -1) {
			this.drawRoundRect(ctx, 50, 20, 100, 20, 5, _color);

		} else {
			this.drawRoundRect(ctx, 50, 5, 100, 35, 5, _color);
			this.setText(ctx, width*0.5, height*0.2, 'Ground Altitude : ' + this.setKilloUnit(_subValue, 0.001, 0));
		}
		this.setText(ctx, width*0.5, height*0.2+15, 'Elevation : '+ this.setKilloUnit(_value, 0.001, 0));

		this.drawDot(ctx, width, height);
		return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
	}

	drawDot(ctx, width, height) {

		ctx.beginPath();
		ctx.lineWidth = 6;
		ctx.arc(width*0.5, height*0.5, 2, 0, 2*Math.PI, false);
		ctx.closePath();

		ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
		ctx.fill();
		ctx.lineWidth = 8;
		ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
		ctx.stroke();
	}

	drawRoundRect(ctx,
				  x, y,
				  width, height, radius,
				  color) {

		if (width < 2 * radius) 	radius = width * 0.5;
		if (height < 2 * radius) 	radius = height * 0.5;

		ctx.beginPath();
		ctx.moveTo(x+radius, y);
		ctx.arcTo(x+width, 	y, 	 		x+width, 	y+height, 	radius);
		ctx.arcTo(x+width, 	y+height, 	x,		 	y+height, 	radius);
		ctx.arcTo(x, 	 	y+height, 	x,   		y,   		radius);
		ctx.arcTo(x,	   	y,   	 	x+width, 	y,   		radius);
		ctx.closePath();

		ctx.fillStyle = color;
		ctx.fill();

		return ctx;
	}

	setText(_ctx, _posX, _posY, _strText) {

		_ctx.font = "bold 12px sans-serif";
		_ctx.textAlign = "center";

		_ctx.fillStyle = "rgb(255, 255, 255)";
		_ctx.fillText(_strText, _posX, _posY);
	}

	setKilloUnit(_text, _meterToKilloRate, _decimalSize){

		if (_decimalSize < 0){
			_decimalSize = 0;
		}
		if (typeof _text == "number") {
			if (_text < 1.0/(_meterToKilloRate*Math.pow(10,_decimalSize))) {
				_text = _text.toFixed(1).toString()+'m';
			} else {
				_text = (_text*_meterToKilloRate).toFixed(2).toString()+'㎞';
			}
		}
		return _text;
	}

	clearAltitudeAnalysis() {

		var layer = this.altitudeLayer,
			symbol = this.altitudeSymbol;
		if (layer == null) return;

        var i, len, icon, poi;
        for (i=0, len=layer.getObjectCount(); i<len; i++) {
            poi = layer.keyAtObject("ALTITUDE_POI"+i);
            icon = poi.getIcon();
            layer.removeAtKey("ALTITUDE_POI"+i);
            symbol.deleteIcon(icon.getId());
        }
    }

	handleMeasureRadius() {
		this.clearEvents();
		this.setMouseState('circle');
		this.radiusSymbol = this.map3D.getSymbol();

		let layerList = new this.map3D.JSLayerList(true);
		this.radiusLayer = layerList.createLayer("MEASURE_RADIUS_POI", this.map3D.ELT_3DPOINT);
		this.radiusLayer.setMaxDistance(20000.0);
		this.radiusLayer.setSelectable(false);

		this.radiusWallLayer = layerList.createLayer("MEASURE_RADIUS_WALL", this.map3D.ELT_POLYHEDRON);
		this.radiusWallLayer.setMaxDistance(20000.0);
		this.radiusWallLayer.setSelectable(false);
		this.radiusWallLayer.setEditable(true);

		this.radiusMeasureListener = function (e) {
			if (e.dTotalDistance > 0) {
				this.clearIcon();
				this.createRadiusPOI(new this.map3D.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), "rgba(255, 204, 198, 0.8)", e.dTotalDistance, true);
			}
		}.bind(this);

		this.map3D.canvas.addEventListener("Fire_EventAddRadius", this.radiusMeasureListener);
	}

	removeRadiusMeasureEvent() {
		this.map3D.canvas.removeEventListener("Fire_EventAddRadius", this.radiusMeasureListener);
	}

	createRadiusPOI(_position, _color, _value, _balloonType) {

		var drawCanvas = document.createElement('canvas');
		drawCanvas.width = 100;
		drawCanvas.height = 100;

        var imageData = this.drawIconRadiusArea(drawCanvas, _color, _value, _balloonType);

        var oldIcon = this.radiusSymbol.getIcon("RadiusIcon")
        if (oldIcon) {
            this.radiusSymbol.deleteIcon(oldIcon.getId());
        }
        this.radiusSymbol.insertIcon("RadiusIcon", imageData, drawCanvas.width, drawCanvas.height);
        var icon = this.radiusSymbol.getIcon("RadiusIcon");
        var poi = this.map3D.createPoint("RADIUS_POI");
        poi.setPosition(_position);
        poi.setIcon(icon);
        this.radiusLayer.addObject(poi, 0);
    }

	clearIcon() {

		if (this.radiusLayer == null) return;
		var icon, poi;

        poi = this.radiusLayer.keyAtObject("RADIUS_POI");

        if (poi == null) return;

        icon = poi.getIcon();
        this.radiusLayer.removeAtKey("RADIUS_POI");

		this.radiusSymbol.deleteIcon(icon.getId());
	}

	drawIconRadiusArea(_canvas, _color, _value, _balloonType) {

		var ctx = _canvas.getContext('2d'),
			width = _canvas.width,
			height = _canvas.height;
		ctx.clearRect(0, 0, width, height);

		if (_balloonType) {
			this.drawBalloon(ctx, height*0.5, width, height, 5, height*0.25, _color);
			this.setTextRadius(ctx, width*0.5, height*0.2, _value);
		} else {
			this.drawRoundRect(ctx, 0, height*0.3, width, height*0.25, 5, _color);
			this.setTextRadius(ctx, width*0.5, height*0.5, _value);
		}

		return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
	}

	drawBalloon(ctx, marginBottom, width, height,
				barWidth, barHeight,
				color) {

		var wCenter = width * 0.5;

		ctx.beginPath();
		ctx.moveTo(0, 				 0);
		ctx.lineTo(0, 				 height-barHeight-marginBottom);
		ctx.lineTo(wCenter-barWidth, height-barHeight-marginBottom);
		ctx.lineTo(wCenter, 		 height-marginBottom);
		ctx.lineTo(wCenter+barWidth, height-barHeight-marginBottom);
		ctx.lineTo(width,			 height-barHeight-marginBottom);
		ctx.lineTo(width,			 0);
		ctx.closePath();

		ctx.fillStyle = color;
		ctx.fill();
	}

	setTextRadius(_ctx, _posX, _posY, _value) {
		var strText;

		if (typeof _value == 'number') {
			strText = this.setKilloUnit(_value, 0.001, 0);
		} else {
			strText = _value;
		}

		_ctx.font = "bold 16px sans-serif";
		_ctx.textAlign = "center";
		_ctx.fillStyle = "rgb(0, 0, 0)";

		_ctx.fillText(strText, _posX, _posY);
	}

	clearRadiusAnalysis() {
		this.map3D.XDClearCircleMeasurement();

		if (this.radiusWallLayer == null) return;
		this.clearIcon();
		this.radiusWallLayer.removeAll();
	}

	handleMeasureArea() {
		this.clearEvents();
		this.setMouseState('area');
		this.createAreaMeasureLayer();

		this.map3D.getOption().SetAreaMeasurePolygonDepthBuffer(false);

		this.map3D.getOption().callBackAddPoint(this.addAreaPoint);
		this.map3D.getOption().callBackCompletePoint(this.endAreaPoint);
	}

	addAreaPoint(e) {
		this.clearPreviousShapes();
		this.createAreaPOI(new this.map3D.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", e.dArea, true, this.m_mercount);
	}

	endAreaPoint(e) {
		this.m_mercount++;
	}

	createAreaPOI(_position, _color, _value, _balloonType) {
		var drawCanvas = document.createElement('canvas');
		drawCanvas.width = 100;
		drawCanvas.height = 100;

		let imageData = this.drawAreaIcon(drawCanvas, _color, _value, _balloonType);

		let layerList = new this.map3D.JSLayerList(true);
		let areaLayer = layerList.nameAtLayer("MEASURE_POI");
		if (!areaLayer) {
			areaLayer = layerList.createLayer("MEASURE_POI", this.map3D.ELT_3DPOINT);
			areaLayer.setMaxDistance(20000.0);
			areaLayer.setSelectable(false);
		}

		let areaPOI = this.map3D.createPoint(this.m_mercount + "_POI");
		areaPOI.setPosition(_position);
		areaPOI.setImage(imageData, drawCanvas.width, drawCanvas.height);
		areaLayer.addObject(areaPOI, 0);
	}

	drawAreaIcon(_canvas, _color, _value, _balloonType) {
		var ctx = _canvas.getContext('2d'),
			width = _canvas.width,
			height = _canvas.height
		;
		ctx.clearRect(0, 0, width, height);
		if (_balloonType) {
			this.drawAreaBalloon(ctx, height * 0.5, width, height, 5, height * 0.25, _color);
			this.setAreaText(ctx, width * 0.5, height * 0.2, _value);
		} else {
			this.drawAreaRoundRect(ctx, 0, height * 0.3, width, height * 0.25, 5, _color);
			this.setAreaText(ctx, width * 0.5, height * 0.5, _value);
		}

		return ctx.getImageData(0, 0, _canvas.width, _canvas.height).data;
	}

	drawAreaBalloon(ctx,
					marginBottom, width, height,
					barWidth, barHeight,
					color) {

		var wCenter = width * 0.5;
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, height - barHeight - marginBottom);
		ctx.lineTo(wCenter - barWidth, height - barHeight - marginBottom);
		ctx.lineTo(wCenter, height - marginBottom);
		ctx.lineTo(wCenter + barWidth, height - barHeight - marginBottom);
		ctx.lineTo(width, height - barHeight - marginBottom);
		ctx.lineTo(width, 0);
		ctx.closePath();

		ctx.fillStyle = color;
		ctx.fill();
	}

	drawAreaRoundRect(ctx,
					  x, y,
					  width, height, radius,
					  color) {

		if (width < 2 * radius) radius = width * 0.5;
		if (height < 2 * radius) radius = height * 0.5;

		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.arcTo(x + width, y, x + width, y + height, radius);
		ctx.arcTo(x + width, y + height, x, y + height, radius);
		ctx.arcTo(x, y + height, x, y, radius);
		ctx.arcTo(x, y, x + width, y, radius);
		ctx.closePath();

		ctx.fillStyle = color;
		ctx.fill();

		return ctx;
	}

	setAreaText(_ctx, _posX, _posY, _value) {
		let strText;
		if (_value === undefined) {
			strText = '';
		} else {
			strText = (Math.round(_value * 10) / 10) + '㎡';
		}

		_ctx.font = "bold 16px sans-serif";
		_ctx.textAlign = "center";
		_ctx.fillStyle = "rgb(0, 0, 0)";

		_ctx.fillText(strText, _posX, _posY);
	}

	removeAreaMeasureEvent() {
		// document.body.removeEventListener('click', this.areaMeasureListener);
	}

	createAreaMeasureLayer() {
		let layerList = new this.map3D.JSLayerList(true);
		let layer = layerList.createLayer("MEASURE_AREA_POI", this.map3D.ELT_3DPOINT);
		layer.setMaxDistance(20000.0);
		layer.setSelectable(false);
	}

	clearAreaAnalysis() {
		this.map3D.XDClearAreaMeasurement();
		this.m_mercount = 0;
	}

	handleMeasureDistance() {
		this.clearEvents();
		this.setMouseState('distance');

		let layerList = new this.map3D.JSLayerList(true);
		this.distanceLayer = layerList.createLayer("MEASURE_DISTANCE_POI", this.map3D.ELT_3DPOINT);
		this.distanceLayer.setMaxDistance(20000.0);
		this.distanceLayer.setSelectable(false);

		this.map3D.getOption().SetDistanceMeasureLineDepthBuffer(false);
		this.map3D.getOption().callBackAddPoint(this.addDistancePoint);
		this.map3D.getOption().callBackCompletePoint(this.endDistancePoint);
		this.removeDistanceMeasureEvent();
	}

	addDistancePoint(e) {
		let partDistance = e.dDistance,
			totalDistance = e.dTotalDistance;

		if (partDistance === 0 && totalDistance === 0) {
			this.m_objcount = 0;
			this.createDistancePOI(new this.map3D.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", "Start", true);
		} else {
			if (e.dDistance > 0.01) {
				this.createDistancePOI(new this.map3D.JSVector3D(e.dMidLon, e.dMidLat, e.dMidAlt), "rgba(255, 255, 0, 0.8)", e.dDistance, false);
			}
			this.createDistancePOI(new this.map3D.JSVector3D(e.dLon, e.dLat, e.dAlt), "rgba(255, 204, 198, 0.8)", e.dTotalDistance, true);
		}
	}

	endDistancePoint(e) {
		this.m_mercount++;
	}

	createDistancePOI(_position, _color, _value, _balloonType) {
		var drawCanvas = document.createElement('canvas');
		drawCanvas.width = 100;
		drawCanvas.height = 100;

		let imageData = this.drawIconRadiusArea(drawCanvas, _color, _value, _balloonType);

		let layerList = new this.map3D.JSLayerList(true);
		this.distanceLayer = layerList.nameAtLayer("MEASURE_DISTANCE_POI");

		let poi = this.map3D.createPoint(this.m_mercount + "_POI_" + this.m_objcount);
		poi.setPosition(_position);
		poi.setImage(imageData, drawCanvas.width, drawCanvas.height);
		this.distanceLayer.addObject(poi, 0);
		this.m_objcount++;
	}

	removeDistanceMeasureEvent() {
		// document.body.removeEventListener('click', this.distanceMeasureListener);
	}

	handleToolIconClick(icon, selectedIcon, setSelectedIcon) {
		this.clearPreviousShapes();
		this.clearEvents();
		if (selectedIcon === icon) {
			setSelectedIcon(null);
			this.clearMeasurements();
			return;
		}
		setSelectedIcon(icon);
		this.handleToolAction(icon);
	}

	handleToolAction(icon) {
		if (icon === 'area') {
			this.handleMeasureArea(icon);
		} else if (icon === 'distance') {
			this.handleMeasureDistance(icon);
		} else if (icon === 'radius') {
			this.handleMeasureRadius(icon);
		} else if (icon === 'altitude') {
			this.handleMeasureAltitude(icon);
		}
	}

	handleSelectPointEvent() {
	}

	unHandleSelectPointEvent() {
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

		this.map3D.getViewCamera().setLocation(new this.map3D.JSVector3D(feature.geometry.coordinates[0], feature.geometry.coordinates[1], feature.properties.altitude + 1000));
		this.map3D.getViewCamera().setTilt(85);
		this.map3D.getViewCamera().setDirect(feature.properties.direction);

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