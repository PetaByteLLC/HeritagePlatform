import React, { useEffect, useContext, useRef } from 'react';
import { MapContext } from '../../../MapContext';
import layers3D from '../../../common/constants/Tiles3D';
import { POI_LAYER_NAME } from '../../../common/constants/GeoserverConfig';
import { setSelectedPOIOnMap, moveToSingleFeature, updateWmsLayers, updateWfsLayers } from '../../utils/Map3DUtils';

function getHeightFromZoom(zoomLevel) {
	const EARTH_HALF_CIRCUMFERENCE = 20037508.5;
	return EARTH_HALF_CIRCUMFERENCE / Math.pow(2, zoomLevel);
}

const Map3D = () => {
	const { is3DMapInitialized, setIs3DMapInitialized, currentLocation, setCurrentLocation, mode, map3DType, setMap3D, setSelectedPOI, wmsLayers, wfsLayers, setHoveredPOI } = useContext(MapContext);
	const mapContainerRef = useRef(null);

	useEffect(() => {
		const scriptSrc = 'https://cdn.xdworld.kr/latest/XDWorldEM.js';

		const loadScript = (src) => {
			return new Promise((resolve, reject) => {
				if (is3DMapInitialized) {
					resolve();
					return;
				}

				const script = document.createElement('script');
				script.src = `${src}?cache-bust=${new Date().getTime()}`;
				script.onload = resolve;
				script.onerror = reject;
				document.body.appendChild(script);
			});
		};

		window.Module = {
			locateFile: function (s) {
				return 'https://cdn.xdworld.kr/latest/' + s;
			},
			postRun: () => {
				const Module = window.Module;
				Module.initialize({
					container: document.getElementById('map'),
					terrain: {
						dem: {
							url: 'https://xdworld.vworld.kr',
							name: 'dem',
							servername: 'XDServer3d',
							encoding: true,
						},
						image: {
							url: 'https://xdworld.vworld.kr',
							name: 'tile',
							servername: 'XDServer3d',
						},
					},
					defaultKey: 'DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I==',
				});

				Module.canvas.addEventListener("Fire_EventCameraMoveEnd", function (e) {
					const location = Module.getViewCamera().getLocation();
					const zoomLevel = Module.getViewCamera().getMapZoomLevel();
					setCurrentLocation({ longitude: location.longitude, latitude: location.latitude, zoomLevel3D: zoomLevel, zoomLevel2D: zoomLevel + 3 });
				});

				updateWmsLayers(window.Module, wmsLayers);
				updateWfsLayers(window.Module, wfsLayers);
			},
		};

		setMap3D(window.Module);

		window.onresize = function (e) {
			if (typeof window.Module == 'object') {
				if (typeof window.Module.Resize == 'function') {
					window.Module.Resize(window.innerWidth, window.innerHeight / 100 * 92);
					window.Module.XDRenderData();
				}
			}
		};

		document.getElementById("map").onclick = function (e) {
			let layerList = new window.Module.JSLayerList(true);
			const poiLayer = layerList.nameAtLayer(POI_LAYER_NAME);
			if (!poiLayer) return;
			const pick = poiLayer.pick(e.offsetX, e.offsetY);
			if (!pick) return;
			const id = pick.objectKey;
			moveToSingleFeature(window.Module, { geometry: { coordinates: [pick.position.longitude, pick.position.latitude] } });
			setSelectedPOIOnMap(window.Module, id, setSelectedPOI);
		}

		document.getElementById("map").onmousemove = function (event) {
			for (const e of wfsLayers) {
				let layerList = new window.Module.JSLayerList(true);
				const poiLayer = layerList.nameAtLayer(e.layerName);
				if (!poiLayer) continue;

				const cameraLevel = window.Module.getViewCamera().getMapZoomLevel();
				if (cameraLevel < e.min) {
					setHoveredPOI(null);
					continue;
				}
			
				const pick = poiLayer.pick(event.offsetX, event.offsetY);
				if (pick) {
					const props = JSON.parse(poiLayer.keyAtObject(pick.objectKey).getDescription());
					setHoveredPOI({ properties: props, position: event });
					break;
				} else {
					setHoveredPOI(null);
				}
			}
		}

		loadScript(scriptSrc)
			.then(() => {
				setIs3DMapInitialized(true);
			})
			.catch((err) => {
				console.error('Failed to load script', err);
			});
	}, [is3DMapInitialized, setIs3DMapInitialized, setCurrentLocation]);

	useEffect(() => {
		if (mode === '3D') {
			window.Module.getViewCamera().moveOval(
				new window.Module.JSVector3D(currentLocation.longitude, currentLocation.latitude, getHeightFromZoom(currentLocation.zoomLevel2D - 2)),
				90,
				0,
				0.1
			);
		}
	}, [mode]);


	useEffect(() => {
		if (mode !== '3D' || !window.Module) return;

		const Module = window.Module;

		if (map3DType === 'Default') {
			clearMap();
		} else {
			initializeMap(Module, map3DType);
		}
	}, [map3DType]);


	useEffect(() => {
		updateWmsLayers(window.Module, wmsLayers);
	}, [wmsLayers]);


	useEffect(() => {
		updateWfsLayers(window.Module, wfsLayers);
	}, [wfsLayers]);


	const clearMap = () => {
		const Module = window.Module;
		if (!Module) return;

		Object.keys(layers3D).forEach((key) => {
			const baseMap = Module[key]?.();
			baseMap?.clear?.();
		});
	};

	const initializeMap = (Module, map3DType) => {
		const baseMap = Module[map3DType]?.();
		if (!baseMap) return;

		const { layerName, quality, zerolevelOffset } = layers3D[map3DType];
		baseMap.layername = layerName;
		baseMap.quality = quality;
		baseMap.zerolevelOffset = zerolevelOffset;
	};

	return <div id="map" ref={mapContainerRef} className="map-container" />;
};

export default Map3D;