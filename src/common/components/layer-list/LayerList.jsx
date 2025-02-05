import React, { useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContext } from '../../../MapContext';
import './LayerList.css';
import { WFSPointType } from '../../constants/WFSLayers';

const LayerList = () => {
    const { wmsLayers, setWmsLayers, wfsLayers, setWfsLayers, wfsPOIType, setWfsPOIType, mode } = useContext(MapContext);

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
                <p className='ps-1 mb-2 fw-bold'>WMS layers</p>
                <ul className="list-group mb-4">
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
                <p className='ps-1 mb-2 fw-bold'>WFS layers</p>
                <ul className="list-group mb-4">
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
                {mode === '3D' && (<>
                    <p className='ps-1 mb-3 fw-bold'>POI Type</p>
                    <div className="form-check form-check-inline ms-1">
                        <input className="form-check-input" type="radio" name="inlineRadioOptions" id="POIAsPIN" checked={wfsPOIType === WFSPointType.PIN} onChange={() => setWfsPOIType(WFSPointType.PIN)} />
                        <label className="form-check-label" htmlFor="POIAsPIN">PIN</label>
                    </div>
                    <div className="form-check form-check-inline ms-1">
                        <input className="form-check-input" type="radio" name="inlineRadioOptions" id="POIAsLINE" checked={wfsPOIType === WFSPointType.LINE} onChange={() => setWfsPOIType(WFSPointType.LINE)} />
                        <label className="form-check-label" htmlFor="POIAsLINE">LINE</label>
                    </div>
                </>)
                }
            </div>
        </div>
    );
};

export default LayerList;
