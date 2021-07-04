import {Ordered} from "../../utils/common.util";

export enum PaperOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
}

class PaperOrientationProperties implements Ordered {
    constructor(public label: string, public order: number) {
    }

    toString() {
        return this.label;
    }
}

export const PAPER_ORIENTATIONS = new Map<PaperOrientation, PaperOrientationProperties>([
    [PaperOrientation.PORTRAIT, new PaperOrientationProperties($localize`Portrait`, 1)],
    [PaperOrientation.LANDSCAPE, new PaperOrientationProperties($localize`Landscape`, 2)]
]);

export function getPaperOrientationProperties(paperOrientation: PaperOrientation): PaperOrientationProperties {
    return PAPER_ORIENTATIONS.get(paperOrientation);
}