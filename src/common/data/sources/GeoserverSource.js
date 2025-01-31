import { API, GEOSERVER_BASE_URL } from '../../constants/ApiUrl';
import { WFS_VERSION, WFS_WORKSPACE, WFS_LAYER, WFS_DEFAULT_NAME_FIELD } from '../../constants/GeoserverConfig';
import { format } from '../../domain/utils/StringFormat';

export const fetchPOIByBbox = async (keyword, minX, minY, maxX, maxY) => {
    let bboxQuery = format(API.bbox, minX, minY, maxX, maxY);
    let cqlFilter = `${bboxQuery} AND ${WFS_DEFAULT_NAME_FIELD} like '%${keyword}%'`;
    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch map data: ', error);
        throw error;
    }
}

export const fetchPOIByRadius = async (keyword, x, y, radius) => {
    let query = format(API.byCircle, x, y, radius);
    let cqlFilter = `${query} AND strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%'`;

    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch map data: ', error);
        throw error;
    }
}

export const fetchPOIByPolygon = async (keyword, wkt) => {
    let query = format(API.byPolygon, wkt);
    let cqlFilter = `${query} AND strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%'`
    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch map data: ', error);
        throw error;
    }
}

export const fetchAllPOI = async (keyword) => {
    let cqlFilter = `strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%'`;
    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch map data: ', error);
        throw error;
    }
}