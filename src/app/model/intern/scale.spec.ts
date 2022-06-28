import {fromReductionFactor, Scale} from "./scale";

describe("Scale", () => {
    it("should return scale enum based on reduction factor", () => {
        // when
        const scale = fromReductionFactor(25000);

        // then
        expect(scale).toBe(Scale.RATIO_1_25000);
    });

    it("should return undefined when reduction factor is a custom value", () => {
        // when
        const scale = fromReductionFactor(21000);

        // then
        expect(scale).toBeUndefined();
    });

    it("should be able to scales length", () => {
        // when
        const result = 40 * Scale.RATIO_1_25000 / 1000;

        // then
        expect(result).toBe(1000);
    });
});