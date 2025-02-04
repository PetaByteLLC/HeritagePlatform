import { POI_LAYER_NAME, WFS_VERSION } from "../../common/constants/GeoserverConfig";
import GeoJSON from 'ol/format/GeoJSON';
import { boundingExtent } from 'ol/extent';
import { DEFAULT_SRS, WMS_VERSION, } from "../../common/constants/GeoserverConfig";
import { GEOSERVER_BASE_URL } from "../../common/constants/ApiUrl";
import { PIN_PNG_URL } from "../../common/constants/GeneralConfig";


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
            var ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            var coords = feature.geometry.coordinates;

            var poi = map.createPoint(feature.id);
            poi.setPosition(new map.JSVector3D(coords[0], coords[1], map.getMap().getTerrHeight(coords[0], coords[1])));
            poi.setImage(ctx.getImageData(0, 0, 30, 30).data, 30, 30);
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
    var layerList = map.getTileLayerList();
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

export const createWfsLayer = (map, wfsLayerJson) => {
    const layer = map.getTileLayerList().createXDServerLayer({
        url: 'http://0.0.0.0',
        servername: "",
        name: wfsLayerJson.layerName,
        type: 23,
        minLevel: wfsLayerJson.min,
        maxLevel: wfsLayerJson.max,
    });
    layer.setVisible(true);
    // TODO add type (PIN or GRID)
    layer.setUserTileLoadCallback((e) => _poiCallback(map, layer, e, wfsLayerJson, null));
}

const _poiCallback = (map, layer, event, wfsLayerJson, poiType) => {
    let minx = parseFloat(event.rect.minx);
    let miny = parseFloat(event.rect.miny);
    let maxx = parseFloat(event.rect.maxx);
    let maxy = parseFloat(event.rect.maxy);
    let _url = `${GEOSERVER_BASE_URL}/wfs?`;
    let srs = `&srsName=${DEFAULT_SRS}`;
    let service_request = `service=WFS&request=GetFeature&typeName=${wfsLayerJson.workspace}:${wfsLayerJson.layerName}`;
    let version = `&VERSION=${WFS_VERSION}&outputFormat=application/json`;
    let bbox = '&BBOX=' + minx + ',' + miny + ',' + maxx + ',' + maxy;
    var url = _url + service_request + srs + version + bbox;
    fetch(url)
        .then(res => res.json())
        .then(res => {
            _createWfsPOI(map, res, layer, event);
        });
}

const _createWfsPOI = (map, geojson, layer, tileInfo) => {
    if (geojson.type === undefined || geojson.type !== "FeatureCollection" || geojson.features === undefined || geojson.features.length < 1) {
        console.log('No Json or No Features');
        return;
    }

    let features = geojson.features;

    var img = new Image();
    img.src = PIN_PNG_URL;
    img.layer = layer;
    img.onload = function () {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        features.forEach((point) => {
            var coords = point.geometry.coordinates;

            var poi = map.createPoint(point.id);

            // TODO get height from server
            poi.setPosition(new map.JSVector3D(coords[0], coords[1], map.getMap().getTerrHeight(coords[0], coords[1])));
            poi.setImage(ctx.getImageData(0, 0, 30, 30).data, 30, 30);
            poi.setText(point.properties.title);
            poi.setDescription(JSON.stringify(point.properties));
            layer.addTileInObject(tileInfo, poi);
            layer.addObject(poi, 0);
        });
    }
    layer.setTileInObjectEnd(tileInfo);
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