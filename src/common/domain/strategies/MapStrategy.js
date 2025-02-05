export class MapStrategy {
	addInteraction(type, vectorSource, setDraw, setCurrentFeature) {
		throw new Error('Method not implemented');
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, vectorSource, currentFeature, setCurrentFeature, addInteraction) {
		throw new Error('Method not implemented');
	}

    handleToolIconClick(icon, selectedIcon, setSelectedIcon) {
        throw new Error('Method not implemented');
    }

    handleToolAction(icon) {
        throw new Error('Method not implemented');
    }

	handleZoomIn() {
		throw new Error('Method not implemented');
	}

	handleZoomOut() {
		throw new Error('Method not implemented');
	}

	handleCurrentLocation() {
		throw new Error('Method not implemented');
	}

	getBbox() {
		throw new Error('Method not implemented');
	}

	addGeoJSONToMap(geojson) {
		throw new Error('Method not implemented');
	}

	removePOILayer() {
		throw new Error('Method not implemented');
	}
	
	moveToSingleFeature(feature) {
		throw new Error('Method not implemented');
	}

    handleMeasureArea(activeButton, setActiveButton) {
        throw new Error('Method not implemented');
    }

    handleMeasureDistance(activeButton, setActiveButton) {
        throw new Error('Method not implemented');
    }

    handleMeasureAltitude(activeButton, setActiveButton) {
        throw new Error('Method not implemented');
    }

    handleMeasureRadius(activeButton, setActiveButton) {
        throw new Error('Method not implemented');
    }

	handleSelectPointEvent() {
		throw new Error('Method not implemented');
	}

	unHandleSelectPointEvent() {
		throw new Error('Method not implemented');
	}

	createBookmark(name, distance, color) {
		throw new Error('Method not implemented');
	}

	showBookmark(feature) {
		throw new Error('Method not implemented');
	}

	viewBookmark(feature) {
		throw new Error('Method not implemented');
	}

	removeBookmark() {
		throw new Error('Method not implemented');
	}
}