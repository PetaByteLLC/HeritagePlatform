export const API = {
    bbox: 'bbox=minX,minY,maxX,maxY,EPSG:4326',
    bySquare: 'CQL_FILTER=BBOX(geom, minX, minY, maxX, maxY)',
    byCircle: 'CQL_FILTER=DWITHIN(geom, POINT(centerX centerY), radius, meters)',
    byPolygon: 'CQL_FILTER=WITHIN(geom, POLYGON((x1 y1, x2 y2, x3 y3, x4 y4, x1 y1)))',
}

export const GEOSERVER_BASE_URL = `${process.env.REACT_APP_GEOSERVER_URL}`;