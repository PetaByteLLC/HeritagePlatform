import React, { useContext, useState, useCallback } from 'react';
import { MapContext } from '../../../MapContext';
import { EffectTypes } from '../../constants/EffectTypes';
import './Effect.css';

const Effect = () => {
    const { setEffects, effectStrategy } = useContext(MapContext);
    const [effects, setLocalEffects] = useState({
        rain: { enabled: false, speed: 5, intensity: 5, image: '/rain1.png' },
        snow: { enabled: false, speed: 5, intensity: 5, image: '/snow1.png' },
        fog: { enabled: false, startDistance: 10, gradientDistance: 2000, density: 0.5 },
    });

    const handleEffectAction = useCallback((newEffects => {
        if (effectStrategy) {
            effectStrategy.handleEffectAction(newEffects);
        }
    }), [effectStrategy]);

    const toggleEffect = (effect) => {
        setLocalEffects((prevEffects) => {
            const newEffects = { ...prevEffects };
            Object.keys(newEffects).forEach((key) => {
                newEffects[key].enabled = key === effect ? !newEffects[key].enabled : false;
            });
            setEffects(newEffects);
            handleEffectAction(newEffects);
            return newEffects;
        });
    };

    const handleSettingChange = (effect, setting, value) => {
        setLocalEffects((prevEffects) => {
            const newEffects = {
                ...prevEffects,
                [effect]: {
                    ...prevEffects[effect],
                    [setting]: value,
                },
            };
            setEffects(newEffects);
            handleEffectAction(newEffects);
            return newEffects;
        });
    };

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1"
            id="effectsMenu" aria-labelledby="effectsMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="effectsMenuLabel">Effects</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body p-3">
                <p className='ps-1 mb-2'>Weather Effects</p>
                <ul className="list-group mb-4">
                    {Object.keys(effects).map((effect) => (
                        <li key={effect} className="list-group-item d-flex flex-column">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-medium">{effect.charAt(0).toUpperCase() + effect.slice(1)}</span>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        role="switch"
                                        id={`effectSwitch-${effect}`}
                                        checked={effects[effect].enabled}
                                        onChange={() => toggleEffect(effect)}
                                    />
                                </div>
                            </div>
                            {effects[effect].enabled && (
                                <div className="effect-settings mt-2">
                                    {effect !== 'fog' && (
                                        <>
                                            <label className="form-label">Speed</label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="1"
                                                max="10"
                                                value={effects[effect].speed}
                                                onChange={(e) => handleSettingChange(effect, 'speed', e.target.value)}
                                            />
                                            <label className="form-label">Intensity</label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="1"
                                                max="10"
                                                value={effects[effect].intensity}
                                                onChange={(e) => handleSettingChange(effect, 'intensity', e.target.value)}
                                            />
                                            <label className="form-label">Type</label>
                                            <select
                                                className="form-select"
                                                value={effects[effect].image}
                                                onChange={(e) => handleSettingChange(effect, 'image', e.target.value)}
                                            >
                                                {EffectTypes[effect].map((image, index) => (
                                                    <option key={index} value={Object.values(image)[0]}>
                                                        {Object.keys(image)[0]}
                                                    </option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                    {effect === 'fog' && (
                                        <>
                                            <label className="form-label">Fog Start Distance</label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="0"
                                                max="100"
                                                value={effects[effect].startDistance}
                                                onChange={(e) => handleSettingChange(effect, 'startDistance', e.target.value)}
                                            />
                                            <label className="form-label">Fog Gradient Distance</label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="10"
                                                max="5000"
                                                value={effects[effect].gradientDistance}
                                                onChange={(e) => handleSettingChange(effect, 'gradientDistance', e.target.value)}
                                            />
                                            <label className="form-label">Fog Density</label>
                                            <input
                                                type="range"
                                                className="form-range"
                                                min="0.5"
                                                max="1"
                                                step="0.1"
                                                value={effects[effect].density}
                                                onChange={(e) => handleSettingChange(effect, 'density', e.target.value)}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Effect;

export class

export class