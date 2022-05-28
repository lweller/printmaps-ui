import {createFeatureSelector, createSelector} from "@ngrx/store";
import {MapProject, toMapProjectReference} from "./map-project";
import {MapProjectReference} from "./map-project-reference";
import {GeoCoordinates} from "./geo-coordinates";
import {AdditionalElementType, AdditionalGpxElement} from "./additional-element";
import {MapProjectState} from "./map-project-state";

export interface PrintmapsUiState {
    mapCenter: GeoCoordinates,
    mapProjectReferences: MapProjectReference[],
    currentMapProject: MapProject,
    selectedAdditionalElementId: string
}

export const initialState: PrintmapsUiState = {
    mapCenter: undefined,
    mapProjectReferences: undefined,
    currentMapProject: undefined,
    selectedAdditionalElementId: undefined
};

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
