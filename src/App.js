import './App.css';
import OpenLayersMap from './2D/components/map/Map';
import ThreeDMap from './3D/components/map/3DMap';
import { MapProvider, MapContext } from './context/MapContext';
import { useContext, useState } from 'react';
import Toolbar from './common/components/toolbar/Toolbar';
import SearchField from './common/components/search-field/SearchField';
import Menu from './common/components/menu/Menu';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <MapProvider>
      <AppContent isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} closeMenu={closeMenu} />
    </MapProvider>
  );
}

function AppContent({ isMenuOpen, toggleMenu, closeMenu }) {
  const { mode } = useContext(MapContext);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Heritage Platform</h1>
      </header>
      <SearchField onSearch={(query) => {
          console.log('Search query:', query);
        }} 
        toggleMenu={toggleMenu}
      />
      <Menu isOpen={isMenuOpen} onClose={closeMenu} />
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