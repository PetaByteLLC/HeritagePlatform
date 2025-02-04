import { 
    fetchPOIByBbox as POIByBbox, 
    fetchPOIByRadius as POIByRadius, 
    fetchPOIByPolygon as POIByPolygon,
    fetchAllPOI as AllPOI,
    fetchAllBookmarks as AllBookmarks,
    addBookmark as AddBookmark,
    editBookmark as EditBookmark,
    deleteBookmark as DeleteBookmark
} from '../sources/GeoserverSource';


export const fetchPOIByBbox = async (keyword, minX, minY, maxX, maxY) => await POIByBbox(keyword, minX, minY, maxX, maxY);

export const fetchPOIByRadius = async (keyword, x, y, radius) => await POIByRadius(keyword, x, y, radius);

export const fetchPOIByPolygon = async (keyword, wkt) => await POIByPolygon(keyword, wkt);

export const fetchAllPOI = async (keyword) => await AllPOI(keyword);

export const fetchAllBookmarks = async (keyword) => await AllBookmarks(keyword);

export const addBookmark = async (feature) => await AddBookmark(feature);

export const editBookmark = async (feature) => await EditBookmark(feature);

export const deleteBookmark = async (feature) => await DeleteBookmark(feature);