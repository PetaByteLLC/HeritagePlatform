import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Cluster from 'ol/source/Cluster';
import { getCenter, extend, createEmpty } from 'ol/extent';
import { Style, Icon, Circle as CircleStyle, Text, Fill, Stroke } from 'ol/style';
import { DEFAULT_SRS, POI_LAYER_NAME, TILE_LAYER_NAME } from '../../common/constants/GeoserverConfig';
import { GEOSERVER_BASE_URL } from '../../common/constants/ApiUrl';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import { TileWMS } from 'ol/source';

export const addGeoJSONToMap = (map, geojson) => {

    let features = new GeoJSON().readFeatures(geojson, {
        dataProjection: DEFAULT_SRS,
        featureProjection: map.getView().getProjection(),
    });

    moveToFeature(map, features);

    const vectorSource = new VectorSource({
        features: features,
    });

    const clusterSource = new Cluster({
        distance: 40,
        source: vectorSource,
    });

    const iconStyle = new Style({
        image: new Icon({
            anchor: [0.5, 1],
            src: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            scale: 0.05,
        }),
        cursor: 'pointer',
    });

    const clusterStyle = new Style({
        image: new CircleStyle({
            radius: 15,
            fill: new Fill({ color: 'rgba(255, 0, 0, 0.6)' }),
            stroke: new Stroke({ color: 'white', width: 2 }),
        }),
        text: new Text({
            font: '12px sans-serif',
            fill: new Fill({ color: 'white' }),
            stroke: new Stroke({ color: 'black', width: 3 }),
            text: '',
            offsetY: 0,
        }),
        cursor: 'pointer',
    });

    const styleFunction = (feature) => {
        const features = feature.get('features');
        if (features && features.length > 1) {
            const size = features.length;
            clusterStyle.getText().setText(size.toString());
            return clusterStyle;
        } else {
            return iconStyle;
        }
    };

    const vectorLayer = new VectorLayer({
        source: clusterSource,
        style: styleFunction,
        name: POI_LAYER_NAME,
        zIndex: 101,
    });

    map.addLayer(vectorLayer);
};

export const removeLayerFromMap = (map, name) => {
    const existingLayer = map.getLayers().getArray().find(layer => layer.get('name') === name);
    if (existingLayer) {
        map.removeLayer(existingLayer);
    }
}

export const moveToSingleFeature = (map, feature) => {
    const coordinates = fromLonLat(feature.geometry.coordinates);
    map.getView().animate({
        center: coordinates,
        zoom: 18,
        duration: 700,
    });
}

export const moveToFeature = (map, features) => {
    var extent = createEmpty();
    features.forEach(function (f) {
        extend(extent, f.getGeometry().getExtent());
    });

    if (features.length > 1) {
        map.getView().fit(extent, {
            size: map.getSize(),
            padding: [200, 200, 200, 200],
            duration: 700,
        });
        return;
    }

    const featureExtent = createEmpty();
    extend(featureExtent, features[0].getGeometry().getExtent());

    map.getView().animate({
        center: getCenter(featureExtent),
        zoom: 18,
        duration: 700,
    });
}

export const setSelectedPOIOnMap = (features, setSelectedPOI) => {
    if (features.length > 1) return;
    const feature = features[0];
    const geojsonFormat = new GeoJSON();
    const geojson = geojsonFormat.writeFeatureObject(feature);
    setSelectedPOI(geojson.properties);
}

export const updateWmsLayers = (map, wmsLayers) => {
    wmsLayers.forEach((wmsLayer) => {
        var current = map.getLayers().getArray().find(layer => layer.get('name') === wmsLayer.layerName);
        if (wmsLayer.visible) {
            if (current) current.setVisible(true);
            else createWmsLayer(map, wmsLayer);
        } else {
            if (current) current.setVisible(false);
        }
    });
}

export const createWmsLayer = (map, wmsLayerJson) => {
    const layer = new TileLayer({
        source: new TileWMS({
            url: `${GEOSERVER_BASE_URL}/wms`,
            params: { 
                'LAYERS': `${wmsLayerJson.workspace}:${wmsLayerJson.layerName}`, 
                'TILED': wmsLayerJson.tiled, 
                'STYLES': wmsLayerJson.style
            },
            serverType: 'geoserver',
            transition: 0,
        }),
        visible: true,
        zIndex: wmsLayerJson.zIndex,
        minZoom: wmsLayerJson.min,
        maxZoom: wmsLayerJson.max + 3,
    });
    layer.set('name', wmsLayerJson.layerName);
    map.addLayer(layer);
}