import { WFS_LAYER, WFS_CITY_LAYER, WFS_WORKSPACE } from "./GeoserverConfig";

export const WFSLayers = [
    { title: 'POI: National level', workspace: WFS_WORKSPACE, layerName: WFS_LAYER, visible: true, min: 9, max: 15, zIndex: 4},
    { title: 'POI: City level', workspace: WFS_WORKSPACE, layerName: WFS_CITY_LAYER, visible: false, min: 9, max: 15, zIndex: 4},
];

export const WFSPointType = {
    PIN: 'pin',
    LINE: 'line',
}