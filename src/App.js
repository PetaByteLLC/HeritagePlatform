import './App.css';
import OpenLayersMap from './2D/components/map/Map';
import ThreeDMap from './3D/components/map/3DMap';
import { MapProvider, MapContext } from './context/MapContext';
import { useContext, useState } from 'react';
import Toolbar from './common/components/toolbar/Toolbar';

function App() {
  const [mapType, setMapType] = useState('OSM');

  return (
    <MapProvider>
      <AppContent mapType={mapType} setMapType={setMapType} />
    </MapProvider>
  );
}

function AppContent({ mapType, setMapType }) {
  const { mode } = useContext(MapContext);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Heritage Platform</h1>
      </header>
      {mode === '2D' && (
        <div className='map-container'>
          <OpenLayersMap mapType={mapType} setMapType={setMapType} />
        </div>
      )}
      {mode === '3D' && (
        <div className='map-container'>
          <ThreeDMap />
        </div>
      )}
      <Toolbar mapType={mapType} setMapType={setMapType} />
    </div>
  );
}

export default App;