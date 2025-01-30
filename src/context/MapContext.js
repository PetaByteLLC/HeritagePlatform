import React, { createContext, useState } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState({longitude: 0, latitude: 0, zoomLevel2D: 0, zoomLevel3D: 0});
  const [mode, setMode] = useState('2D');
  const [is3DMapInitialized, setIs3DMapInitialized] = useState(false);
  const [map2DType, setMap2DType] = useState('OSM');
  const [map3DType, setMap3DType] = useState('Default');
  const [map2D, setMap2D] = useState(null);

  return (
    <MapContext.Provider value={
      { currentLocation, setCurrentLocation, 
        mode, setMode, 
        is3DMapInitialized, setIs3DMapInitialized, 
        map2DType, setMap2DType, 
        map3DType, setMap3DType,
        map2D, setMap2D 
      }}>
      {children}
    </MapContext.Provider>
  );
};