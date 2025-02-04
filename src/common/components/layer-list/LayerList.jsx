import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContext } from '../../../MapContext';
import './LayerList.css';

const LayerList = () => {
    const { wmsLayers, setWmsLayers, wfsLayers, setWfsLayers } = useContext(MapContext);

    const toggleWmsVisibility = (name) => {
        var newLayers = wmsLayers.map(layer =>
            layer.layerName === name ? { ...layer, visible: !layer.visible } : layer
        );
        setWmsLayers(newLayers);
    };

    const toggleWfsVisibility = (name) => {
        var newLayers = wfsLayers.map(layer =>
            layer.layerName === name ? { ...layer, visible: !layer.visible } : layer
        );
        setWfsLayers(newLayers);
    }

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1"
            id="layersMenu" aria-labelledby="layersMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="layersMenuLabel">Layers</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body p-3">
                <ul className="list-group">
                    {wmsLayers.map((layer) => (
                        <li key={layer.layerName} className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="fw-medium">{layer.title}</span>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={`layerSwitch-${layer.layerName}`}
                                    checked={layer.visible}
                                    onChange={() => toggleWmsVisibility(layer.layerName)}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
                <ul className="list-group">
                    {wfsLayers.map((layer) => (
                        <li key={layer.layerName} className="list-group-item d-flex justify-content-between align-items-center">
                            <span className="fw-medium">{layer.title}</span>
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    role="switch"
                                    id={`layerSwitch-${layer.layerName}`}
                                    checked={layer.visible}
                                    onChange={() => toggleWfsVisibility(layer.layerName)}
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
