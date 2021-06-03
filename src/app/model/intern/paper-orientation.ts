export enum PaperOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
}

export interface PaperOrientationProperties {
}

class PaperOrientationPropertiesImpl implements PaperOrientationProperties {
    constructor(public label: string) {
    }

    toString() {
        return this.label;
    }
}

export const PAPER_ORIENTATIONS = new Map<PaperOrientation, PaperOrientationProperties>([
    [PaperOrientation.PORTRAIT, new PaperOrientationPropertiesImpl("Portrait")],
    [PaperOrientation.LANDSCAPE, new PaperOrientationPropertiesImpl("Landscape")]
]);

export function getPaperOrientationProperties(paperOrientation: PaperOrientation): PaperOrientationProperties {
    return PAPER_ORIENTATIONS.get(paperOrientation);
}