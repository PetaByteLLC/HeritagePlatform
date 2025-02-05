export const API = {
    bbox: 'BBOX(geom, %s,%s,%s,%s)',
    byCircle: 'DWITHIN(geom, POINT(%s %s), %s, meters)',
    byPolygon: 'WITHIN(geom, %s)',
}

export const GEOSERVER_BASE_URL = process.env.REACT_APP_GEOSERVER_URL;
export const GEOSERVER_BASE_TOKEN = process.env.REACT_APP_GEOSERVER_TOKEN;