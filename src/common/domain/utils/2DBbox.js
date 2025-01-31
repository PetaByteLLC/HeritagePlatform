import { transformExtent } from 'ol/proj';
import { DEFAULT_SRS } from '../../constants/GeoserverConfig';

export const get2DBbox = (map) => {
    let currentSRS = map.getView().getProjection().getCode();
    const extent = map.getView().calculateExtent(map.getSize());
    return transformExtent(extent, currentSRS, DEFAULT_SRS);
}