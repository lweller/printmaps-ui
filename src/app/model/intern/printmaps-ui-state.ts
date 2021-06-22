import {createFeatureSelector, createSelector} from "@ngrx/store";
import {MapProject} from "./map-project";
import {MapProjectReference} from "./map-project-reference";
import {GeoCoordinates} from "./geo-coordinates";

export interface PrintmapsUiState {
    mapCenter: GeoCoordinates,
    mapProjectReferences: MapProjectReference[],
    currentMapProject: MapProject
}

export const initialState: PrintmapsUiState = {
    mapCenter: undefined,
    mapProjectReferences: undefined,
    currentMapProject: undefined
};

export const PRINTMAPS_UI_STATE_ID = "ch.wellernet.printmaps.ui-state";

const printmapsUiState = createFeatureSelector<PrintmapsUiState>(PRINTMAPS_UI_STATE_ID);

export const mapProjectReferences = createSelector(printmapsUiState,
    (state: PrintmapsUiState) => state.mapProjectReferences);

export const currentMapProject = createSelector(printmapsUiState,
    (state: PrintmapsUiState) => state.currentMapProject);
