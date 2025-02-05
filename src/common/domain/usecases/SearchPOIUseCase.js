import { fetchPOIByBbox, fetchPOIByRadius, fetchPOIByPolygon, fetchAllPOI, fetchPOIByLayer as POIByLayer} from "../../data/repositories/GeoserverRepository";
import WKT from 'ol/format/WKT';

export const searchPOIBySpatial = async (keyword, spatialType, spatial) => {
    if (keyword === null || keyword === undefined || keyword.trim().length === 0) return;
    if (spatial === null || spatial === undefined) {
        return await fetchAllPOI(keyword);
    }

    if (spatialType === null || spatialType === undefined) return;

    if (spatialType === 'location') {
        const bbox = spatial.bbox;
        return await fetchPOIByBbox(keyword, bbox[0], bbox[1], bbox[2], bbox[3]);
    } else if (spatialType === 'square' || spatialType === 'polygon') {
        const wktFormat = new WKT();
        const wkt = wktFormat.writeFeature(spatial);
        return await fetchPOIByPolygon(keyword, wkt);
    } else if (spatialType === 'circle') {
        return await fetchPOIByRadius(keyword, spatial.center[0], spatial.center[1], spatial.radius);
    }
};

export const fetchPOIByLayer = async (name) => {
    if (!name) return {};
    return await POIByLayer(name);
}