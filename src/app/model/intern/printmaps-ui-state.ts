import {createFeatureSelector, createSelector} from "@ngrx/store";
import {MapProject} from "./map-project";
import {MapProjectReference} from "./map-project-reference";
import {GeoCoordinates} from "./geo-coordinates";

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

export const currentAdditionalElements = createSelector(currentMapProject,
    (mapProject) => mapProject?.additionalElements ?? []);

export const selectedAdditionalElementId = createSelector(printmapsUiState,
    (state) => state.selectedAdditionalElementId);
