import { MapContext } from "../../../MapContext";
import { useContext, useState, useCallback } from "react";
import './Chart.css';

const Chart = () => {
    const { setEffects, effectStrategy } = useContext(MapContext);
    const [ charts, setCharts ] = useState({ enabled: false });

    const handleChartAction = useCallback((newChart => {
        if (effectStrategy) {
            effectStrategy.handleChartAction(newChart);
        }
    }), [effectStrategy]);

    const toggleChart = () => {
        setCharts((prevChart) => {
            const newChart = { ...prevChart, enabled: !prevChart.enabled };
            handleChartAction(newChart);
            return newChart;
        });
    };

    return (
        <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1"
            id="graphMenu" aria-labelledby="graphMenuLabel">
            <div className="offcanvas-header">
                <h5 className="offcanvas-title" id="graphMenuLabel">Chart</h5>
                <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-medium">Chart</span>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="chartSwitch"
                            checked={charts.enabled}
                            onChange={toggleChart}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Chart;