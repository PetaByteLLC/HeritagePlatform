// filepath: /Users/blaque/Documents/Coding/EGIS/heritage/src/common/components/vertical-switch/VerticalSwitch.js
import React, { useState } from 'react';
import './VerticalSwitch.css';

const VerticalSwitch = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleSwitchChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="vertical-switch">
      <input
        type="checkbox"
        checked={isChecked}
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