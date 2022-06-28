import {allValuesOf} from "../../utils/common.util";

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

export function scaleLabel(scale: Scale) {
    return `1:${scale.toFixed(0).replace(/\d(?=(\d{3})+$)/g, "$&'")}`;
}

export function fromReductionFactor(reductionFactor: number): Scale {
    return allValuesOf(Scale).filter(scale => scale == reductionFactor)[0];
}