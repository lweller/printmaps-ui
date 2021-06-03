export enum Scale {
    RATIO_1_100 = 100,
    RATIO_1_500 = 500,
    RATIO_1_1000 = 1000,
    RATIO_1_5000 = 5000,
    RATIO_1_10000 = 10000,
    RATIO_1_20000 = 20000,
    RATIO_1_25000 = 25000,
    RATIO_1_50000 = 50000,
    RATIO_1_100000 = 100000,
    RATIO_1_200000 = 200000,
    RATIO_1_250000 = 250000
}

export interface ScaleProperties {
    reductionFactor: number;
}

class ScalePropertiesImpl implements ScaleProperties {
    constructor(public reductionFactor: number) {
    }

    toString() {
        return `1:${this.reductionFactor.toFixed(0).replace(/\d(?=(\d{3})+$)/g, "$&'")}`;
    }
}

export const SCALES = new Map<Scale, ScaleProperties>([
    [Scale.RATIO_1_100, new ScalePropertiesImpl(100)],
    [Scale.RATIO_1_500, new ScalePropertiesImpl(500)],
    [Scale.RATIO_1_1000, new ScalePropertiesImpl(1000)],
    [Scale.RATIO_1_5000, new ScalePropertiesImpl(5000)],
    [Scale.RATIO_1_10000, new ScalePropertiesImpl(10000)],
    [Scale.RATIO_1_20000, new ScalePropertiesImpl(20000)],
    [Scale.RATIO_1_25000, new ScalePropertiesImpl(25000)],
    [Scale.RATIO_1_50000, new ScalePropertiesImpl(50000)],
    [Scale.RATIO_1_100000, new ScalePropertiesImpl(100000)],
    [Scale.RATIO_1_200000, new ScalePropertiesImpl(200000)],
    [Scale.RATIO_1_250000, new ScalePropertiesImpl(250000)]
]);

export function getScaleProperties(scale: Scale): ScaleProperties {
    return SCALES.get(scale);
}

export function fromReductionFactor(reductionFactor: number): Scale {
    for (let [scale, properties] of SCALES.entries()) {
        if(properties.reductionFactor == reductionFactor) {
            return scale;
        }
    }
    return undefined;
}