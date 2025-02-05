import { EffectStrategy } from "../../../common/domain/strategies/EffectStrategy";

export class Effect2DStrategy extends EffectStrategy {
    handleEffectAction(effects) {
        alert('Unable to display effects in 2D mode');
        console.log('Unable to display effects in 2D mode');
    }
}