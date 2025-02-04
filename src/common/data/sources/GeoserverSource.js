import { API, GEOSERVER_BASE_URL } from '../../constants/ApiUrl';
import { WFS_VERSION, WFS_WORKSPACE, WFS_LAYER, WFS_CITY_LAYER, WFS_DEFAULT_NAME_FIELD } from '../../constants/GeoserverConfig';
import { format } from '../../domain/utils/StringFormat';

export const fetchPOIByBbox = async (keyword, minX, minY, maxX, maxY) => {
    let bboxQuery = format(API.bbox, minX, minY, maxX, maxY);
    let cqlFilter = `${bboxQuery} AND ${WFS_DEFAULT_NAME_FIELD} like '%${keyword}%';${bboxQuery} AND ${WFS_DEFAULT_NAME_FIELD} like '%${keyword}%'`;
    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER},${WFS_WORKSPACE}:${WFS_CITY_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
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
    let cqlFilter = `${query} AND strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%';${query} AND strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%'`;

    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER},${WFS_WORKSPACE}:${WFS_CITY_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
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
    let cqlFilter = `${query} AND strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%';${query} AND strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%'`
    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER},${WFS_WORKSPACE}:${WFS_CITY_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
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
    let cqlFilter = `strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%';strToLowerCase(${WFS_DEFAULT_NAME_FIELD}) like '%${keyword}%'`;
    try {
        const response = await fetch(`${GEOSERVER_BASE_URL}/wfs?outputFormat=application/json&service=WFS&version=${WFS_VERSION}&request=GetFeature&typename=${WFS_WORKSPACE}:${WFS_LAYER},${WFS_WORKSPACE}:${WFS_CITY_LAYER}&CQL_FILTER=${encodeURIComponent(cqlFilter)}`);
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

export const fetchAllBookmarks = async (keyword) => {
    const workspace = 'Heritage';
    const layer = 'heritage_bookmark_layer';
    const maxFeatures = 50;
    const cqlFilter = keyword && `&CQL_FILTER=${encodeURIComponent(`strToLowerCase(name) like '%${keyword.toLowerCase()}%'`)}` || '';

    const url = `${GEOSERVER_BASE_URL}/Heritage/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${workspace}:${layer}&maxFeatures=${maxFeatures}&outputFormat=application/json${cqlFilter}&sortBy=date D`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa('admin:geoserver')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch feature collections');
        }

        var data = await response.json();
        // console.log("data", data);
        return data;
    } catch (error) {
        console.error('Error fetching feature collections:', error);
        return  {
            "type": "FeatureCollection",
            "features": []
        };
    }
}

export const addBookmark = async (feature) => {
    const xmlPayload = `<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:Heritage="http://localhost:8094/geoserver/Heritage">
      <wfs:Insert>
        <Heritage:heritage_bookmark_layer>
          <Heritage:geom>
            <gml:Point srsName="EPSG:4326">
              <gml:coordinates>${feature.geometry.coordinates.join(',')}</gml:coordinates>
            </gml:Point>
          </Heritage:geom>
          ${Object.entries(feature.properties).map(([key, val]) => `
            <Heritage:${key}>${val}</Heritage:${key}>
            `).join('')}
        </Heritage:heritage_bookmark_layer>
      </wfs:Insert>
    </wfs:Transaction>`;

    return executeWFSTransaction(xmlPayload);
}

export const editBookmark = async (feature) => {
    const xmlPayload = `<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:Heritage="http://localhost:8094/geoserver/Heritage">
      <wfs:Update typeName="Heritage:heritage_bookmark_layer">
        <wfs:Property>
          <wfs:Name>geom</wfs:Name>
          <wfs:Value>
            <gml:Point srsName="EPSG:4326">
                <gml:coordinates>${feature.geometry.coordinates.join(',')}</gml:coordinates>
            </gml:Point>
          </wfs:Value>
        </wfs:Property>
        ${Object.entries(feature.properties).map(([key, val]) => `
            <wfs:Property>
              <wfs:Name>${key}</wfs:Name>
              <wfs:Value>${val}</wfs:Value>
            </wfs:Property>
        `).join('')}
        <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
          <ogc:FeatureId fid="${feature.id}"/>
        </ogc:Filter>
      </wfs:Update>
    </wfs:Transaction>`;

    return executeWFSTransaction(xmlPayload);
}

export const deleteBookmark = async (feature) => {
    const xmlPayload = `<wfs:Transaction xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:Heritage="http://localhost:8094/geoserver/Heritage">
      <wfs:Delete typeName="Heritage:heritage_bookmark_layer">
        <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
          <ogc:FeatureId fid="${feature.id}"/>
        </ogc:Filter>
      </wfs:Delete>
    </wfs:Transaction>`;

    return executeWFSTransaction(xmlPayload);
}

const executeWFSTransaction = async (xmlPayload) => {
    const url = `${GEOSERVER_BASE_URL}/Heritage/ows?service=WFS&version=1.0.0&request=Transaction`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'Authorization': 'Basic ' + btoa('admin:geoserver')
            },
            body: xmlPayload
        });

        if (!response.ok) {
            throw new Error('Failed to execute WFS-T transaction');
        }

        const data = await response.text();
        //console.log('Transaction successful:', data);
        const parser = new DOMParser();
        return parser.parseFromString(data, "application/xml");
    } catch (error) {
        console.error('Error executing WFS-T transaction:', error);
        return null;
    }
};