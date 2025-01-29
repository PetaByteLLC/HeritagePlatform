import React, { useEffect, useContext, useRef } from 'react';
import { MapContext } from '../../../context/MapContext';

const ThreeDMap = () => {
  const { is3DMapInitialized, setIs3DMapInitialized } = useContext(MapContext);
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
        script.src = `${src}?cache-bust=${new Date().getTime()}`; // Add cache-busting query parameter
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
      },
    };

    loadScript(scriptSrc)
      .then(() => {
        setIs3DMapInitialized(true);
        console.log('Script loaded successfully');
      })
      .catch((err) => {
        console.error('Failed to load script', err);
      });
  }, [is3DMapInitialized, setIs3DMapInitialized]);

  return <div id="map" ref={mapContainerRef} className="map-container" />;
};

export default ThreeDMap;