import {MapProjectState} from "./map-project-state";

export interface MapProjectReference {
    id: string;
    name: string;
    state: MapProjectState;
}