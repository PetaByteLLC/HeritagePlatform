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
                    this.setUseSnowEffect(effects[effect].image, effects[effect].speed, effects[effect].intensity);
                } else if (effect === 'fog') {
                    this.setUseFogEffect(effects[effect].startDistance, effects[effect].gradientDistance, effects[effect].density, effects[effect].type);
                }
            }
        });
    }

    setUseRainEffect(image, speed, intensity) {
        if (image) {
            this.map.setRainImageURL(image);
            this.map.startWeather(1, speed, intensity);
        }
    }

    setUseSnowEffect(image, speed, intensity) {
        if (image) {
            this.map.setSnowImageURL(image);
            this.map.startWeather(0, speed, intensity);
            this.map.setSnowfall(1);
            this.map.setSnowfallLevel(1);
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
}