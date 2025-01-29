import React, { createContext, useState } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState({longitude: 0, latitude: 0, zoomLevel2D: 2, zoomLevel3D: 2});
  const [mode, setMode] = useState('2D');
  const [is3DMapInitialized, setIs3DMapInitialized] = useState(false);

  return (
    <MapContext.Provider value={{ currentLocation, setCurrentLocation, mode, setMode, is3DMapInitialized, setIs3DMapInitialized }}>
      {children}
    </MapContext.Provider>
  );
};