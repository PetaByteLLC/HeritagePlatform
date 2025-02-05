import React, { useContext } from 'react';
import { MapContext } from '../../../MapContext';

export const HoverPOIDetails = () => {
    const { hoveredPOI } = useContext(MapContext);
    if (!hoveredPOI) return null;

    const properties = hoveredPOI.properties;
    const position = hoveredPOI.position;

    const modalWidth = 250;
    const modalHeight = 300;
    const offset = 15;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = position.clientY + offset;
    let left = position.clientX + offset;

    if (position.clientY + modalHeight + offset > viewportHeight) {
        top = position.clientY - modalHeight - offset;
    }
    if (position.clientX + modalWidth + offset > viewportWidth) {
        left = position.clientX - modalWidth - offset;
    }

    const modalStyle = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 1000,
        pointerEvents: 'none',
    };

    return (
        <div className='poi-details-sidebar' style={modalStyle}>
            <h2>{properties.title}</h2>
            <p><strong>Address:</strong> {properties.address}</p>
            {Object.entries(properties)
                .filter(([key]) => key !== 'title' && key !== 'address')
                .map(([key, value], index) => (
                    <p key={index}>
                        <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value || 'No data available.'}
                    </p>
                ))
            }
        </div>
    );
};