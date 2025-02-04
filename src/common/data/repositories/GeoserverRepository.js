import { 
    fetchPOIByBbox as POIByBbox, 
    fetchPOIByRadius as POIByRadius, 
    fetchPOIByPolygon as POIByPolygon,
    fetchAllPOI as AllPOI,
    fetchAllBookmarks as AllBookmarks,
    addBookmark as AddBookmark,
    editBookmark as EditBookmark,
    deleteBookmark as DeleteBookmark,
    fetchPOIByLayer as POIByLayer
} from '../sources/GeoserverSource';


export const fetchPOIByBbox = async (keyword, minX, minY, maxX, maxY) => await POIByBbox(keyword, minX, minY, maxX, maxY);

export const fetchPOIByRadius = async (keyword, x, y, radius) => await POIByRadius(keyword, x, y, radius);

export const fetchPOIByPolygon = async (keyword, wkt) => await POIByPolygon(keyword, wkt);

export const fetchAllPOI = async (keyword) => await AllPOI(keyword);

export const fetchAllBookmarks = async (keyword) => await AllBookmarks(keyword);

export const fetchPOIByLayer = async (name) => await POIByLayer(name);

export const addBookmark = async (keyword) => await AddBookmark(keyword);

export const editBookmark = async (keyword) => await EditBookmark(keyword);

export const deleteBookmark = async (keyword) => await DeleteBookmark(keyword);