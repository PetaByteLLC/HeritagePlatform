import React, { createContext, useState, useEffect } from 'react';
import { Map2DStrategy } from './2D/domain/strategies/Map2DStrategy';
import { Map3DStrategy } from './3D/domain/strategies/Map3DStrategy';
import { WMSLayers } from './common/constants/WMSLayers';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
    const [currentLocation, setCurrentLocation] = useState({ longitude: 0, latitude: 0, zoomLevel2D: 0, zoomLevel3D: 0 });
    const [mode, setMode] = useState('2D');
    const [is3DMapInitialized, setIs3DMapInitialized] = useState(false);
    const [map2DType, setMap2DType] = useState('OSM');
    const [map3DType, setMap3DType] = useState('Default');
    const [map2D, setMap2D] = useState(null);
    const [map3D, setMap3D] = useState(null);
    const [strategy, setStrategy] = useState(null);
    const [selectedPOI, setSelectedPOI] = useState(null);
    const [wmsLayers, setWmsLayers] = useState(WMSLayers);
    const [init2D, setInit2D] = useState(null);
    const [init3D, setInit3D] = useState(null);

    useEffect(() => {
        if (mode === '2D' && map2D) {
            let temp;
            if (!init2D)  {
                temp = new Map2DStrategy(map2D);
                setInit2D(temp);
            }
            setStrategy(init2D || temp);
        } else if (mode === '3D' && map3D) {
            let temp;
            if (!init3D) {
                temp = new Map3DStrategy(map3D);
                setInit3D(temp);
            }
            setStrategy(init3D || temp);
        }
    }, [mode, map2D, map3D]);

    return (
        <MapContext.Provider value={
            {
                currentLocation, setCurrentLocation,
                mode, setMode,
                is3DMapInitialized, setIs3DMapInitialized,
                map2DType, setMap2DType,
                map3DType, setMap3DType,
                map2D, setMap2D,
                map3D, setMap3D,
                selectedPOI, setSelectedPOI,
                wmsLayers, setWmsLayers,
                strategy
            }}>
            {children}
        </MapContext.Provider>
    );
};