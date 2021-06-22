import {PaperOrientation} from "./paper-orientation";

export enum PaperFormat {
    A3 = "A3",
    A4 = "A4",
    A5 = "A5",
    CUSTOM = "Custom"
}

export interface PaperFormatProperties {
    label: string;

    width(orientation: PaperOrientation): number;

    height(orientation: PaperOrientation): number;
}

class PaperFormatPropertiesImpl implements PaperFormatProperties {
    constructor(public label: string, public length1: number, public length2: number) {
    }

    width(orientation: PaperOrientation) {
        return orientation === PaperOrientation.PORTRAIT
            ? Math.min(this.length1, this.length2)
            : Math.max(this.length1, this.length2);
    }

    height(orientation: PaperOrientation) {
        return orientation === PaperOrientation.PORTRAIT
            ? Math.max(this.length1, this.length2)
            : Math.min(this.length1, this.length2);
    }

    toString() {
        return this.label;
    }
}

export const PAPER_FORMATS = new Map<PaperFormat, PaperFormatPropertiesImpl>([
    [PaperFormat.A5, new PaperFormatPropertiesImpl("A5", 148, 210)],
    [PaperFormat.A4, new PaperFormatPropertiesImpl("A4", 210, 297)],
    [PaperFormat.A3, new PaperFormatPropertiesImpl("A3", 297, 420)],
    [PaperFormat.CUSTOM, new PaperFormatPropertiesImpl($localize`Custom`, undefined, undefined)]
]);

export function getPaperFormatProperties(paperFormat: PaperFormat): PaperFormatProperties {
    return PAPER_FORMATS.get(paperFormat);
}