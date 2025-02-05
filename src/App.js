import './App.css';
import OpenLayersMap from './2D/components/map/Map2D';
import ThreeDMap from './3D/components/map/Map3D';
import { MapProvider, MapContext } from './MapContext';
import { useContext } from 'react';
import Toolbar from './common/components/toolbar/Toolbar';
import SearchField from './common/components/search-field/SearchField';
import { HoverPOIDetails } from './common/components/hover-poi/HoverPOIDetails';

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
        <h2 className="App-header-title">Heritage Platform</h2>
      </header>
      <SearchField />
      <div className={`map-container-wrap ${mode === '2D' ? 'active' : ''}`}>
        <OpenLayersMap />
      </div>
      <div className={`map-container-wrap ${mode === '3D' ? 'active' : ''}`}>
        <ThreeDMap />
      </div>
      <Toolbar />
      <HoverPOIDetails/>
    </div>
  );
}

export default App;