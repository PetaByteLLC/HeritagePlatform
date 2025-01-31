import { MapStrategy } from '../../../common/domain/strategies/MapStrategy';

export class Map3DStrategy extends MapStrategy {
	constructor(map3D) {
		super();
		this.map3D = map3D;
	}

    addInteraction(icon) {
        this.clearMeasurements();
        switch (icon) {
            case 'circle':
                this.setMouseState('radius');
				this.initRadiusEvent(this.map3D.canvas);
                break;
            case 'polygon':
                this.setMouseState('polygon');
				this.initAreaEvent();
                break;
            case 'square':
                this.setMouseState('rect');
				this.initRectangleEvent(this.map3D.canvas);
                break;
			case 'location':
				console.log('Bbox: ', this.getBbox());
				break;
            default:
				console.log('Bbox: ', this.getBbox());
        }
    }

    handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, setDraw, vectorSource) {
        if (this.activeIcon === icon) {
            this.activeIcon = null;
            setSelectedIcon(null);
            this.clearMeasurements();
            return;
        }

        if (this.activeIcon) {
            this.clearMeasurements();
        }

        this.activeIcon = icon;
        setSelectedIcon(icon);
        this.addInteraction(icon);
    }

	initRadiusEvent(canvas) {
		canvas.addEventListener("Fire_EventAddRadius", function (e) {
			if (e.dTotalDistance > 0) {
				console.log(e.dMidLon, e.dMidLat, e.dMidAlt, "Radius: " + e.dTotalDistance);
			}
		});
	}

	initAreaEvent() {
		function addPoint(e) {
			console.log("coordinates: ", e.dLon, e.dLat, e.dAlt);
		}
		this.map3D.getOption().callBackAddPoint(addPoint);
	}

	initRectangleEvent(canvas) {
		canvas.addEventListener("Fire_EventAddAreaPoint", function (e) {
			console.log("coordinates: ", e);
		});
	}

    setMouseState(state) {
        if (!this.activeIcon) return;

        const mouseStates = {
            rect: this.map3D.MML_INPUT_RECT,
            polygon: this.map3D.MML_ANALYS_AREA_PLANE,
            radius: this.map3D.MML_ANALYS_AREA_CIRCLE,
        };

        const mouseState = mouseStates[state];
        if (mouseState) {
            this.map3D.XDSetMouseState(mouseState);
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
	
		return {
			maxX: Math.max(bottomLeft.longitude, topRight.longitude),
			maxY: Math.max(bottomLeft.latitude, topRight.latitude),
			minX: Math.min(bottomLeft.longitude, topRight.longitude),
			minY: Math.min(bottomLeft.latitude, topRight.latitude)
		};
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