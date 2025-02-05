import {POI_LAYER_NAME, WFS_VERSION} from "../../common/constants/GeoserverConfig";
import GeoJSON from 'ol/format/GeoJSON';
import { boundingExtent } from 'ol/extent';
import { DEFAULT_SRS, WMS_VERSION, } from "../../common/constants/GeoserverConfig";
import { GEOSERVER_BASE_URL } from "../../common/constants/ApiUrl";
import { PIN_PNG_URL, SEC_PIN_PNG_URL } from "../../common/constants/GeneralConfig";
import { fetchPOIByLayer } from "../../common/domain/usecases/SearchPOIUseCase";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";


export const addGeoJSONToMap = (map, geojson) => {
    var layerList = new map.JSLayerList(true);
    var layer = layerList.createLayer(POI_LAYER_NAME, map.ELT_3DPOINT);
    layer.setMaxDistance(1000000000);
    layer.setMinDistance(0);
    _createPOIFromGeoJSON(map, geojson, layer);
};

const _createPOIFromGeoJSON = (map, geojson, layer) => {
    if (geojson?.totalFeatures === 0) return;

    moveToFeature(map, geojson);

    geojson.features.forEach(feature => {
        var img = new Image();
        img.src = PIN_PNG_URL;
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d', { willReadFrequently: true });
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            var coords = feature.geometry.coordinates;

            var poi = map.createPoint(feature.id);
            poi.setPosition(new map.JSVector3D(coords[0], coords[1], map.getMap().getTerrHeight(coords[0], coords[1])));
            poi.setImage(ctx.getImageData(0, 0, img.width, img.height).data, img.width, img.height);
            poi.setText(feature.properties.title);
            poi.setDescription(JSON.stringify(feature.properties));

            layer.addObject(poi, 0);
        };
        img.layer = layer;
    });
}

export const removeLayerFromMap = (map, name) => {
    let layerList = new map.JSLayerList(true);
    layerList.delLayerAtName(name);
}

export const moveToFeature = (map, features) => {
    var bbox = getBboxFromGeojson(features);
    bbox = _extendBBox(bbox, 2500);
    let options = {
        boundary: {
            min: new map.JSVector2D(bbox[0], bbox[1]),
            max: new map.JSVector2D(bbox[2], bbox[3]),
        },
        complete: () => { },
    };
    map.getViewCamera().moveLonLatBoundarybyJson(options);
}

export const moveToSingleFeature = (map, feature) => {
    var coords = feature.geometry.coordinates;
    map.getViewCamera().moveOval(new map.JSVector3D(coords[0], coords[1], 500.0), 90, 0, 0.1);
}

export const getBboxFromGeojson = (geojson) => {

    const format = new GeoJSON();
    const features = format.readFeatures(geojson, {
        dataProjection: DEFAULT_SRS,
        featureProjection: DEFAULT_SRS,
    });

    const extents = features.map(feature => feature.getGeometry().getExtent());

    const bbox = boundingExtent(extents);

    return bbox;
}

export const setSelectedPOIOnMap = (map, id, setSelectedPOI) => {
    const layerList = new map.JSLayerList(true);
    const poiLayer = layerList.nameAtLayer(POI_LAYER_NAME);
    const object = poiLayer.keyAtObject(id);
    const properties = JSON.parse(object.getDescription())
    setSelectedPOI(properties);
}

export const updateWmsLayers = (map, wmsLayers) => {
    if (!map || typeof map.JSLayerList !== 'function') return;
    let layerList = new map.JSLayerList(false);
    wmsLayers.forEach((layer) => {
        const wmslayer = layerList.nameAtLayer(layer.layerName);
        if (layer.visible) {
            if (wmslayer) wmslayer.setVisible(true);
            else createWmsLayer(map, layer);
        } else {
            if (wmslayer) wmslayer.setVisible(false);
        }
    });
}

export const createWmsLayer = (map, wmsLayerJson) => {
    let layerList = new map.JSLayerList(false);
    let options = {
        url: `${GEOSERVER_BASE_URL}/wms?STYLES=${wmsLayerJson.style}&`,
        layer: `${wmsLayerJson.workspace}:${wmsLayerJson.layerName}`,
        minimumlevel: wmsLayerJson.min - 3,
        maximumlevel: wmsLayerJson.max,
        tilesize: wmsLayerJson.tileSize,
        crs: DEFAULT_SRS,
        parameters: {
            version: WMS_VERSION,
        }
    };

    const wmslayer = layerList.createWMSLayer(wmsLayerJson.layerName)
    wmslayer.setWMSProvider(options);
    wmslayer.setBBoxOrder(true);
}

export const removeWmsLayer = (map, name) => {
    let layerList = new map.JSLayerList(false);
    const wmslayer = layerList.nameAtLayer(name);
    if (wmslayer != null) wmslayer.clearWMSCache();
    layerList.delLayerAtName(name)
}

export const updateWfsLayers = (map, wfsLayers) => {
    if (!map || typeof map.getTileLayerList !== 'function') return;
    var layerList = new map.JSLayerList(true);

    wfsLayers.forEach((layer) => {
        const wfslayer = layerList.nameAtLayer(layer.layerName);
        if (layer.visible) {
            if (wfslayer) wfslayer.setVisible(true);
            else createWfsLayer(map, layer);
        } else {
            if (wfslayer) wfslayer.setVisible(false);
        }
    });
    
}

export const createWfsLayer = async (map, wfsLayerJson) => {
    var layerList = new map.JSLayerList(true);
    var layer = layerList.createLayer(wfsLayerJson.layerName, map.ELT_3DPOINT);
    layer.setVisible(true);
    // TODO add type (PIN or GRID)
    var geojson = await fetchPOIByLayer(`${wfsLayerJson.workspace}:${wfsLayerJson.layerName}`);
    layer.setMinDistance(0);
    layer.setMaxDistance(50000);
    _createWfsPOI(map, geojson, layer);
}

const _createWfsPOI = (map, geojson, layer) => {
    if (geojson.type === undefined || geojson.type !== "FeatureCollection" || geojson.features === undefined || geojson.features.length < 1) {
        console.log('No Json or No Features');
        return;
    }

    let features = geojson.features;

    var img = new Image();
    img.src = SEC_PIN_PNG_URL;
    img.layer = layer;
    img.onload = function () {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        features.forEach((point) => {
            var coords = point.geometry.coordinates;

            var poi = map.createPoint(point.id);

            // TODO get height from server
            poi.setPosition(new map.JSVector3D(coords[0], coords[1], map.getMap().getTerrHeightFast(coords[0], coords[1])));
            poi.setImage(ctx.getImageData(0, 0, img.width, img.height).data, img.width, img.height);
            poi.setText(point.properties.title);
            poi.setDescription(JSON.stringify(point.properties));
            poi.setVisibleRange(true, 1, 100000);
            layer.addObject(poi, 0);
        });
    }
}

const _extendBBox = (bbox, meters) => {
    if (!Array.isArray(bbox) || bbox.length !== 4) {
        throw new Error('Invalid bbox array.');
    }

    const [minX, minY, maxX, maxY] = bbox;

    const metersToDegrees = (meters) => {
        const latToDeg = 1 / 111320;
        const lonToDeg = (lat) => 1 / (Math.cos((lat * Math.PI) / 180) * 111320);

        const latOffset = meters * latToDeg;
        const lonOffset = meters * lonToDeg((minY + maxY) / 2);

        return { latOffset, lonOffset };
    };

    const { latOffset, lonOffset } = metersToDegrees(meters);

    const extendedBbox = [
        minX - lonOffset,
        minY - latOffset,
        maxX + lonOffset,
        maxY + latOffset,
    ];

    return extendedBbox;
}

export const convertToGeoJSON = (coords) => {
    if (!Array.isArray(coords) || coords.length < 3) return null;

    const closedCoords = [...coords, coords[0]];
    const transformedCoords = closedCoords.map(coord => [coord.longitude, coord.latitude]);

    return new Feature({
        geometry: new Polygon([transformedCoords])
    });
}