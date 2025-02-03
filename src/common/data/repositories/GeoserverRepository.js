import { 
    fetchPOIByBbox as POIByBbox, 
    fetchPOIByRadius as POIByRadius, 
    fetchPOIByPolygon as POIByPolygon,
    fetchAllPOI as AllPOI,
} from '../sources/GeoserverSource';


export const fetchPOIByBbox = async (keyword, minX, minY, maxX, maxY) => await POIByBbox(keyword, minX, minY, maxX, maxY);

export const fetchPOIByRadius = async (keyword, x, y, radius) => await POIByRadius(keyword, x, y, radius);

export const fetchPOIByPolygon = async (keyword, wkt) => await POIByPolygon(keyword, wkt);

export const fetchAllPOI = async (keyword) => await AllPOI(keyword);