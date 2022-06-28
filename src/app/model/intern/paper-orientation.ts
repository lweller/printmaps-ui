export enum PaperOrientation {
    PORTRAIT = "portrait",
    LANDSCAPE = "landscape"
}

export const PAPER_ORIENTATION_LABELS = new Map<PaperOrientation, string>([
    [PaperOrientation.PORTRAIT, $localize`Portrait`],
    [PaperOrientation.LANDSCAPE, $localize`Landscape`]
]);