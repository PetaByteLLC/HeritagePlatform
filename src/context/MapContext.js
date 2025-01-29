import React, { createContext, useState } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState([0, 0]);
  const [mode, setMode] = useState('2D');
  const [is3DMapInitialized, setIs3DMapInitialized] = useState(false);

  return (
    <MapContext.Provider value={{ currentLocation, setCurrentLocation, mode, setMode, is3DMapInitialized, setIs3DMapInitialized }}>
      {children}
    </MapContext.Provider>
  );
};