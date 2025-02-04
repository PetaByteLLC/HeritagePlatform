import { useEffect, useContext, useRef } from "react";
import { MapContext } from "../../../MapContext";

export const useToolbarActions = () => {
    const { strategy } = useContext(MapContext);

    const handleZoomInRef = useRef(() => {});
    const handleZoomOutRef = useRef(() => {});
    const handleCurrentLocationRef = useRef(() => {});
    const handleMeasureAltitudeRef = useRef(() => {});
    const handleMeasureRadiusRef = useRef(() => {});

    useEffect(() => {
        if (!strategy) return;
        handleZoomInRef.current = strategy.handleZoomIn.bind(strategy);
        handleZoomOutRef.current = strategy.handleZoomOut.bind(strategy);
        handleCurrentLocationRef.current = strategy.handleCurrentLocation.bind(strategy);
        handleMeasureAltitudeRef.current = strategy.handleMeasureAltitude.bind(strategy);
        handleMeasureRadiusRef.current = strategy.handleMeasureRadius.bind(strategy);
    }, [strategy]);

    return {
        handleZoomIn: () => handleZoomInRef.current(),
        handleZoomOut: () => handleZoomOutRef.current(),
        handleCurrentLocation: () => handleCurrentLocationRef.current(),
        handleMeasureAltitude: () => handleMeasureAltitudeRef.current(),
        handleMeasureRadius: () => handleMeasureRadiusRef.current(),
    };
};