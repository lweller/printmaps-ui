import {createFeatureSelector, createSelector} from "@ngrx/store";
import {AdditionalElementType, AdditionalGpxElement} from "../model/intern/additional-element";
import {MapProjectState} from "../model/intern/map-project-state";
import {toMapProjectReference} from "../model/intern/map-project";
import {PrintmapsUiState} from "../model/intern/printmaps-ui-state";
import {PaperOrientation} from "../model/intern/paper-orientation";
import {PAPER_FORMAT_SIZES, PaperFormat} from "../model/intern/paper-format";

export const PRINTMAPS_UI_STATE_ID = "ch.wellernet.printmaps.ui-state";

const printmapsUiState = createFeatureSelector<PrintmapsUiState>(PRINTMAPS_UI_STATE_ID);

export const mapProjectReferences = createSelector(printmapsUiState,
    (state) => state.mapProjectReferences);

export const currentMapProject = createSelector(printmapsUiState,
    (state) => state?.currentMapProject);

export const isCurrentMapProjectSaved = createSelector(currentMapProject,
    (mapProject) => !!mapProject?.id);

export const isCurrentMapProjectCopiable = isCurrentMapProjectSaved;

export const isCurrentMapProjectDeletable = isCurrentMapProjectSaved;

export const isCurrentMapProjectRenderable = createSelector(currentMapProject,
    (mapProject) => mapProject?.state == MapProjectState.NOT_RENDERED
);

export const isCurrentMapProjectDownloadable = createSelector(currentMapProject,
    (mapProject) => mapProject?.state == MapProjectState.READY_FOR_DOWNLOAD
);

export const selectedMapProjectReference = createSelector(
    currentMapProject,
    mapProject => toMapProjectReference(mapProject)
);

export const currentMapProjectGeneralProperties = createSelector(currentMapProject,
    mapProject => mapProject
        ? {
            description: {name: mapProject.name},
            options: mapProject.options
        }
        : undefined
);

export const currentMapProjectCenter = createSelector(currentMapProject,
    (mapProject) => mapProject?.center);

export const currentMapProjectFormat = createSelector(currentMapProject,
    (mapProject) => mapProject
        ? {
            format: Array.from(PAPER_FORMAT_SIZES.entries())
                .filter(([, computePaperSize]) => !!computePaperSize)
                .filter(([, computePaperSize]) => {
                    let portraitPaperSize = computePaperSize(PaperOrientation.PORTRAIT);
                    return portraitPaperSize.widthInMm == Math.min(mapProject.widthInMm, mapProject.heightInMm)
                        && portraitPaperSize.heightInMm == Math.max(mapProject.widthInMm, mapProject.heightInMm);
                })
                .map(([format]) => format)[0] ?? PaperFormat.CUSTOM,
            orientation: mapProject.widthInMm <= mapProject.heightInMm
                ? PaperOrientation.PORTRAIT
                : PaperOrientation.LANDSCAPE
        }
        : undefined
);

export const currentMapProjectSize = createSelector(currentMapProject,
    (mapProject) => mapProject
        ? {widthInMm: mapProject.widthInMm, heightInMm: mapProject.heightInMm}
        : undefined
);

export const currentMapProjectMargins = createSelector(currentMapProject,
    (mapProject) => mapProject
        ? {
            topMarginInMm: mapProject.topMarginInMm,
            bottomMarginInMm: mapProject.bottomMarginInMm,
            leftMarginInMm: mapProject.leftMarginInMm,
            rightMarginInMm: mapProject.rightMarginInMm
        }
        : undefined
);

export const currentMapProjectScale = createSelector(currentMapProject,
    (mapProject) => mapProject?.scale);

export const currentAdditionalElements = createSelector(currentMapProject,
    (mapProject) => mapProject?.additionalElements ?? []);

export const currentAdditionalGpxElements = createSelector(currentAdditionalElements,
    (additionalElements) =>
        additionalElements
            .filter(additionalElement => additionalElement.type == AdditionalElementType.GPX_TRACK)
            .map(additionalElement => additionalElement as AdditionalGpxElement)
);

export const selectedAdditionalElementId = createSelector(printmapsUiState,
    (state) => state.selectedAdditionalElementId);

export const selectedMapCenter = createSelector(printmapsUiState,
    (state) => state?.mapCenter);