import './App.css';
import OpenLayersMap from './2D/components/map/Map2D';
import ThreeDMap from './3D/components/map/Map3D';
import { MapProvider, MapContext } from './MapContext';
import { useContext } from 'react';
import Toolbar from './common/components/toolbar/Toolbar'
import SearchField from './common/components/search-field/SearchField';

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
      <SearchField onSearch={(query) => {}} 
      />
      <div className={`map-container-wrap ${mode === '2D' ? 'active' : ''}`}>
        <OpenLayersMap />
      </div>
      <div className={`map-container-wrap ${mode === '3D' ? 'active' : ''}`}>
        <ThreeDMap />
      </div>
      <Toolbar />
    </div>
  );
}

export default App;