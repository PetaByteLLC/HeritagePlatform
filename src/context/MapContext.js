import React, { createContext, useState } from 'react';

export const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState([0, 0]);

  return (
    <MapContext.Provider value={{ currentLocation, setCurrentLocation }}>
      {children}
    </MapContext.Provider>
  );
};