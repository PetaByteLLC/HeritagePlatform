import React, { useEffect } from 'react';

const ThreeDMap = () => {
    
    useEffect(() => {
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

    }, []);

    return <div id="map" className="map-container" />;
};

export default ThreeDMap;