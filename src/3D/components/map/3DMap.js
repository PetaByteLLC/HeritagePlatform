import React, { useEffect, useContext, useRef } from 'react';
import { MapContext } from '../../../context/MapContext';

function getHeightFromZoom(zoomLevel) {
  const EARTH_HALF_CIRCUMFERENCE = 20037508.5;
  return EARTH_HALF_CIRCUMFERENCE / Math.pow(2, zoomLevel);
}

const ThreeDMap = () => {
  const { is3DMapInitialized, setIs3DMapInitialized, currentLocation, setCurrentLocation, mode } = useContext(MapContext);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    
    const scriptSrc = 'https://cdn.xdworld.kr/latest/XDWorldEM.js';

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        if (is3DMapInitialized) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `${src}?cache-bust=${new Date().getTime()}`;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    window.Module = {
      locateFile: function (s) {
        return 'https://cdn.xdworld.kr/latest/' + s;
      },
      postRun: () => {
        const Module = window.Module;
        Module.initialize({
          container: document.getElementById('map'),
          terrain: {
            dem: {
              url: 'https://xdworld.vworld.kr',
              name: 'dem',
              servername: 'XDServer3d',
              encoding: true,
            },
            image: {
              url: 'https://xdworld.vworld.kr',
              name: 'tile',
              servername: 'XDServer3d',
            },
          },
          defaultKey: 'DFG~EpIREQDmdJe1E9QpdBca#FBSDJFmdzHoe(fB4!e1E(JS1I==',
        });

        Module.canvas.addEventListener("Fire_EventCameraMoveEnd", function (e) {
          const location = Module.getViewCamera().getLocation();
          const zoomLevel = Module.getViewCamera().getMapZoomLevel();
          setCurrentLocation({longitude: location.longitude, latitude: location.latitude, zoomLevel3D: zoomLevel, zoomLevel2D: zoomLevel + 3});
        });
      },
    };

    loadScript(scriptSrc)
      .then(() => {
        setIs3DMapInitialized(true);
      })
      .catch((err) => {
        console.error('Failed to load script', err);
      });
  }, [is3DMapInitialized, setIs3DMapInitialized, setCurrentLocation]);

  useEffect(() => {
    if (mode === '3D') {
      window.Module.getViewCamera().moveOval(
        new window.Module.JSVector3D(currentLocation.longitude, currentLocation.latitude, getHeightFromZoom(currentLocation.zoomLevel2D - 2)), 
        90, 
        0, 
        0.1
      );
    }
  }, [mode]);

  return <div id="map" ref={mapContainerRef} className="map-container" />;
};

export default ThreeDMap;