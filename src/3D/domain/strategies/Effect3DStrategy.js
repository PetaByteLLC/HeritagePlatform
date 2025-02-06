import { EffectStrategy } from "../../../common/domain/strategies/EffectStrategy";

export class Effect3DStrategy extends EffectStrategy {
    constructor(map3D) {
        super();
        this.map3D = map3D;
        this.map = this.map3D.getMap();
        this.fogColor = new this.map3D.JSColor(255, 255, 255, 255);
        this.smogColor = new this.map3D.JSColor(255, 255, 255, 100);
    }

    handleEffectAction(effects) {
        this.stopWeather();

        Object.keys(effects).forEach(effect => {
            if (effects[effect].enabled) {
                if (effect === 'rain') {
                    this.setUseRainEffect(effects[effect].image, effects[effect].speed, effects[effect].intensity);
                } else if (effect === 'snow') {
                    this.setUseSnowEffect(effects[effect].image, effects[effect].speed, effects[effect].intensity, effects[effect].snowCover);
                } else if (effect === 'fog') {
                    this.setUseFogEffect(effects[effect].startDistance, effects[effect].gradientDistance, effects[effect].density, effects[effect].type);
                }
            }
        });
    }

    handleChartAction(boolean) {
        console.log('bool', boolean.enabled);
        if (boolean.enabled === true) {
            var camera = this.map3D.getViewCamera();
            camera.move(new this.map3D.JSVector3D(126.78693528538836, 35.00513429887883, 1000.0), 0, 0, 0);
            camera.setPermitUnderGround(true);
            camera.setLimitTilt(-88.0);
            camera.setLimitAltitude(-1000.0);
            camera.setTilt(30.0);

            var layerList = new this.map3D.JSLayerList(true);
            var layer = layerList.createLayer("LAYER_GRAPH", this.map3D.ELT_GRAPH);

            console.log('layer', layer);

            fetch('/temperature.json')
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    var graph = this.createGraph(data);
                    layer.addObject(graph, 0);
                })
                .catch(error => console.error('Error fetching JSON:', error));
        } else {
            this.clearLayer();
        }
    }

    setUseRainEffect(image, speed, intensity) {
        if (image) {
            this.map.setRainImageURL(image);
            this.map.startWeather(1, speed, intensity);
        }
    }

    setUseSnowEffect(image, speed, intensity, snowCover) {
        if (image) {
            this.map.setSnowImageURL(image);
            this.map.startWeather(0, speed, intensity);
            if (snowCover !== 0) {
                this.map.setSnowfall(1);
                this.map.setSnowfallLevel(snowCover);
            }
        }
    }

    setUseFogEffect(startDist, gradDist, fogDensity, type) {
        if (type) {
            const fogColor = type === "Fog" ? this.fogColor : this.smogColor;
            this.map.setFogLimitAltitude(6000000.0);
            this.map.setFog(fogColor, startDist, startDist + gradDist, fogDensity);
            this.map.setFogEnable(true);
        }
    }

    stopWeather() {
        this.map.stopWeather();
        this.map.setSnowfall(0);
        this.map.setSnowfallLevel(0);
        this.map.setFogEnable(false);
    }

    createGraph(_data) {
        var graph = this.map3D.createBarGraph3D("Graph");

        var columnLabelList = ["Paris", "Roma", "Madrid", "New York", "Bishkek", "Seoul", "Daegu", "Berlin", "Naryn"];
        var rowLabelList = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        var columnColorList = [
            new this.map3D.JSColor(200,   0, 210,   0),
            new this.map3D.JSColor(200,   0, 255, 255),
            new this.map3D.JSColor(200, 255,   0,   0),
            new this.map3D.JSColor(200, 255, 128,   0),
            new this.map3D.JSColor(200,   0, 128, 255),
            new this.map3D.JSColor(200,  47,   0, 255),
            new this.map3D.JSColor(200, 255, 255,   0),
            new this.map3D.JSColor(200, 148,   0, 211),
            new this.map3D.JSColor(200, 128, 255,   0)
        ];

        for (var i=0, len=columnLabelList.length; i<len; i++) {
            graph.insertColumn("column"+i, columnLabelList[i], columnColorList[i]);
        }

        for (var i=0, len=rowLabelList.length; i<len; i++) {
            graph.insertRow("row"+i, rowLabelList[i]);
        }

        for (var i=0, len=columnLabelList.length; i<len; i++) {
            for (var j=0, subLen=rowLabelList.length; j<subLen; j++) {
                if (_data && _data[columnLabelList[i]] && _data[columnLabelList[i]][rowLabelList[j]] !== undefined) {
                    var data = _data[columnLabelList[i]][rowLabelList[j]];
                    graph.setData("column"+i, "row"+j, data);
                } else {
                    console.error(`Data for ${columnLabelList[i]} - ${rowLabelList[j]} is missing`);
                }
            }
        }

        graph.setValueRange(0.0, 80.0, 10.0);
        graph.setUnitText("('F)");
        graph.setAnimationSpeed(0.2);

        graph.create(new this.map3D.JSVector3D(126.78693528538836, 35.01813429887883, 100.0),
            new this.map3D.JSSize3D(400.0, 300.0, 600.0));

        return graph;
    }

    clearLayer() {
        let layerList = new this.map3D.JSLayerList(true);
        let layer = layerList.nameAtLayer('LAYER_GRAPH');
        if (layer) {
            layer.removeAll();
        }
    }
}