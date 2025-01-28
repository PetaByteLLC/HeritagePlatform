import './App.css';
import OpenLayersMap from './2D/components/map/Map';
import { MapProvider } from './context/MapContext';

function App() {
  return (
    <MapProvider>
      <div className="App">
        <header className="App-header">
          <h1>Heritage Platform</h1>
        </header>
        <OpenLayersMap />
      </div>
    </MapProvider>
  );
}

export default App;
