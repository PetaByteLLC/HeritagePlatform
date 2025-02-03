import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LayerList.css';

const initialLayers = [
    { id: 1, name: 'Roads', visible: true },
    { id: 2, name: 'Buildings', visible: false },
    { id: 3, name: 'Water Bodies', visible: true },
    { id: 4, name: 'Parks', visible: false }
];

const LayerList = () => {
    const [layers, setLayers] = useState(initialLayers);

    const toggleVisibility = (id) => {
        var newLayers = layers.map(layer =>
            layer.id === id ? { ...layer, visible: !layer.visible } : layer
        );
        console.log(newLayers);
        setLayers(newLayers);
    };

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1"
            id="layersMenu" aria-labelledby="layersMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="layersMenuLabel">Layers</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body p-3">
                <ul className="list-group">
                    {layers.map((layer) => (
                        <li key={layer.id} className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="fw-medium">{layer.name}</span>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={`layerSwitch-${layer.id}`}
                                    checked={layer.visible}
                                    onChange={() => toggleVisibility(layer.id)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default LayerList;
