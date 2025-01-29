import './App.css';
import OpenLayersMap from './2D/components/map/Map';
import ThreeDMap from './3D/components/map/3DMap';
import { MapProvider, MapContext } from './context/MapContext';
import { useContext } from 'react';
import Toolbar from './common/components/toolbar/Toolbar'

function App() {
  return (
    <MapProvider>
      <AppContent />
    </MapProvider>
  );
}

function AppContent() {
  const { mode } = useContext(MapContext);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Heritage Platform</h1>
      </header>
      <div style={{ display: mode === '2D' ? 'block' : 'none' }}>
        <OpenLayersMap />
      </div>
      <div className='map-container'>
        <ThreeDMap />
      </div>
      <Toolbar />
    </div>
  );
}

export default App;