import {MapRenderingJobExecution} from "../api/map-rendering-job-definition";
import {Scale} from "./scale";
import {MapProjectState} from "./map-project-state";
import {MapOptions} from "./map-options";
import {GeoCoordinates} from "./geo-coordinates";
import {MapProjectReference} from "./map-project-reference";
import {AdditionalElement} from "./additional-element";

export interface MapProject {
    id: string;
    name: string,
    state: MapProjectState;
    center: GeoCoordinates;
    scale: Scale;
    widthInMm: number;
    heightInMm: number;
    topMarginInMm: number;
    bottomMarginInMm: number;
    leftMarginInMm: number;
    rightMarginInMm: number;
    options: MapOptions;
    additionalElements: AdditionalElement[];
    modifiedLocally: boolean;
}

export function toMapRenderingJobExecution(id: string): MapRenderingJobExecution {
    return {
        Data: {
            Type: "maps",
            ID: id
        }
    };
}

export function toMapProjectReference(mapProject: MapProject): MapProjectReference {
    return mapProject
        ? {
            id: mapProject.id,
            name: mapProject.name,
            state: mapProject.state
        }
        : undefined;
}