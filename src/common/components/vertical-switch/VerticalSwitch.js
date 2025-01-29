import React, { useContext } from 'react';
import { MapContext } from '../../../context/MapContext';
import './VerticalSwitch.css';

const VerticalSwitch = () => {
  const { mode, setMode } = useContext(MapContext);

  const handleSwitchChange = () => {
    setMode(mode === '2D' ? '3D' : '2D');
  };

  return (
    <div className="vertical-switch">
      <input
        type="checkbox"
        checked={mode === '3D'}
        onChange={handleSwitchChange}
        className="vertical-switch-checkbox"
        id="vertical-switch"
      />
      <label className="vertical-switch-label" htmlFor="vertical-switch">
        <span className="vertical-switch-inner" />
        <span className="vertical-switch-text top-text">2D</span>
        <span className="vertical-switch-text bottom-text">3D</span>
      </label>
    </div>
  );
};

export default VerticalSwitch;