export enum PaperOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
}

export interface PaperOrientationProperties {
    label: string
}

class PaperOrientationPropertiesImpl implements PaperOrientationProperties {
    constructor(public label: string) {
    }

    toString() {
        return this.label;
    }
}

export const PAPER_ORIENTATIONS = new Map<PaperOrientation, PaperOrientationProperties>([
    [PaperOrientation.PORTRAIT, new PaperOrientationPropertiesImpl($localize`Portrait`)],
    [PaperOrientation.LANDSCAPE, new PaperOrientationPropertiesImpl($localize`Landscape`)]
]);

export function getPaperOrientationProperties(paperOrientation: PaperOrientation): PaperOrientationProperties {
    return PAPER_ORIENTATIONS.get(paperOrientation);
}