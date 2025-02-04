import { fetchPOIByBbox, fetchPOIByRadius, fetchPOIByPolygon, fetchAllPOI } from "../../data/repositories/GeoserverRepository";
import WKT from 'ol/format/WKT';

export const searchPOIBySpatial = async (keyword, spatialType, spatial) => {
    if (keyword === null || keyword === undefined || keyword.trim().length === 0) return;
    if (spatial === null || spatial === undefined) {
        return await fetchAllPOI(keyword);
    }

    console.log('spatialType', spatialType);

    if (spatialType === null || spatialType === undefined) return;

    if (spatialType === 'location') {
        console.log('spatial: ', spatial);
        const bbox = spatial.bbox;
        return await fetchPOIByBbox(keyword, bbox[0], bbox[1], bbox[2], bbox[3]);
    } else if (spatialType === 'square' || spatialType === 'polygon') {
        console.log('spatial: ', spatial);
        const wktFormat = new WKT();
        const wkt = wktFormat.writeFeature(spatial);
        console.log('wkt: ', wkt);
        return await fetchPOIByPolygon(keyword, wkt);
    } else if (spatialType === 'circle') {
        console.log('spatial: ', spatial);
        return await fetchPOIByRadius(keyword, spatial.center[0], spatial.center[1], spatial.radius);
    }
};