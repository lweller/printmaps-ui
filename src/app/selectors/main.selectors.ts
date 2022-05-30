import {createFeatureSelector, createSelector} from "@ngrx/store";
import {AdditionalElementType, AdditionalGpxElement} from "../model/intern/additional-element";
import {MapProjectState} from "../model/intern/map-project-state";
import {toMapProjectReference} from "../model/intern/map-project";
import {PrintmapsUiState} from "../model/intern/printmaps-ui-state";

export const PRINTMAPS_UI_STATE_ID = "ch.wellernet.printmaps.ui-state";

const printmapsUiState = createFeatureSelector<PrintmapsUiState>(PRINTMAPS_UI_STATE_ID);

export const mapProjectReferences = createSelector(printmapsUiState,
    (state) => state.mapProjectReferences);

export const currentMapProject = createSelector(printmapsUiState,
    (state) => state.currentMapProject);

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
    (state) => state.mapCenter);