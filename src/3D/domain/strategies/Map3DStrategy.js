import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';

export class Map3DStrategy extends MapStrategy {
	constructor(map3D) {
		super();
		this.map3D = map3D;
	}

	addInteraction(icon, setCurrentSpatial) {
		this.clearMeasurements();
		let coordinate = null;
		switch (icon) {
			case 'circle':
				this.initRadiusEvent(this.map3D.canvas).then((result) => {
					setCurrentSpatial(result);
				});
				return;
			case 'polygon':
				this.initAreaEvent();
				break;
			case 'square':
				this.initRectangleEvent();
                break;
			default:
				coordinate = this.getBbox();
		}
		setCurrentSpatial(coordinate);
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource, setCurrentSpatial) {
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

	initRadiusEvent(canvas) {
		this.setMouseState('circle');
		return new Promise((resolve) => {
			canvas.addEventListener("Fire_EventAddRadius", function (e) {
				if (e.dTotalDistance > 0) {
					resolve({
						center: [e.dLon, e.dLat],
						radius: e.dTotalDistance
					});
				}
			});
		});
		
	}

	initAreaEvent() {
		this.setMouseState('polygon');
		function addPoint(e) {
			console.log("coordinates: ", e.dLon, e.dLat, e.dAlt);
		}
		this.map3D.getOption().callBackAddPoint(addPoint);
	}

	initRectangleEvent() {
		this.setMouseState('square');
		function addPoint(e) {
			console.log("coordinates: ", e.dLon, e.dLat, e.dAlt);
		}
		this.map3D.getOption().callBackAddPoint(addPoint);
	}

	setMouseState(state) {
		const mouseStates = {
			square: this.map3D.MML_INPUT_RECT,
			polygon: this.map3D.MML_INPUT_AREA,
            radius: this.map3D.MML_ANALYS_AREA_CIRCLE,
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
		const camera = this.map3D.getViewCamera()
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
}