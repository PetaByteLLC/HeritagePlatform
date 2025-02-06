import { EffectStrategy } from "../../../common/domain/strategies/EffectStrategy";

export class Effect2DStrategy extends EffectStrategy {
    constructor(map2D) {
        super();
        this.map2D = map2D;
    }

    handleEffectAction(effects) {
        alert('Unable to display effects in 2D mode');
        console.log('Unable to display effects in 2D mode');
    }

    handleChartAction(boolean) {
        alert('Unable to display charts in 2D mode');
        console.log('Unable to display chart in 2D mode');
    }
}