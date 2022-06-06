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
    mapProjectReferences: [],
    currentMapProject: undefined,
    selectedAdditionalElementId: undefined
};
