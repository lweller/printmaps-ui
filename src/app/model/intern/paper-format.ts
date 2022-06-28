import {PaperOrientation} from "./paper-orientation";

export enum PaperFormat {
    A3 = "A3",
    A4 = "A4",
    A5 = "A5",
    CUSTOM = "Custom"
}

export interface PaperSize {
    widthInMm: number,
    heightInMm: number
}

function paperSize(length1: number, length2: number): (orientation: PaperOrientation) => PaperSize {
    return orientation => ({
        widthInMm: orientation === PaperOrientation.PORTRAIT ? Math.min(length1, length2) : Math.max(length1, length2),
        heightInMm: orientation === PaperOrientation.PORTRAIT ? Math.max(length1, length2) : Math.min(length1, length2)
    });
}

export const PAPER_FORMAT_LABELS = new Map<PaperFormat, string>([
    [PaperFormat.A5, "A5"],
    [PaperFormat.A4, "A4"],
    [PaperFormat.A3, "A3"],
    [PaperFormat.CUSTOM, $localize`Custom`]
]);

export const PAPER_FORMAT_SIZES = new Map<PaperFormat, (orientation: PaperOrientation) => PaperSize>([
    [PaperFormat.A5, paperSize(148, 210)],
    [PaperFormat.A4, paperSize(210, 297)],
    [PaperFormat.A3, paperSize(297, 420)],
    [PaperFormat.CUSTOM, undefined]
]);