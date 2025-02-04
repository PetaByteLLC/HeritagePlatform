export class MapStrategy {
	addInteraction(type, vectorSource, setDraw, setCurrentFeature) {
		throw new Error('Method not implemented');
	}

	handleIconClick(icon, type, selectedIcon, setSelectedIcon, draw, vectorSource, currentFeature, setCurrentFeature, addInteraction) {
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

	createBookmark(name, color = "#c8ff00"): object {
		throw new Error('Method not implemented');
	}

	showBookmark(feature) {
		throw new Error('Method not implemented');
	}

	removeBookmark() {
		throw new Error('Method not implemented');
	}
}