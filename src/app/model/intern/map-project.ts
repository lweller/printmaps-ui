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

export function generateMapProjectCopyName(name: string): string {
    let copySuffix = $localize`copy`;
    let pattern = new RegExp("(.*?)\\s*\\(" + copySuffix + "(\\s*\\d+)?\\)$");
    let matches = name.match(pattern);
    if (matches) {
        let number = matches[2] ? (parseInt(matches[2]) + 1) : 2;
        return matches[1] + " (" + copySuffix + " " + number + ")";
    } else {
        return name + " (" + copySuffix + ")";
    }
}