import {MapRenderingJobDefinition, MapRenderingJobExecution} from "../api/map-rendering-job-definition";
import {fromReductionFactor, getScaleProperties, Scale} from "./scale";
import {MapProjectState} from "./map-project-state";
import {MapOptions} from "./map-options";
import {GeoCoordinates} from "./geo-coordinates";
import {MapProjectReference} from "./map-project-reference";

export interface MapProject {
    id: string;
    name: string,
    state: MapProjectState;
    center: GeoCoordinates;
    scale: Scale;
    widthInMm: number;
    heightInMm: number;
    options: MapOptions;
    modifiedLocally: boolean;
}

export function toMapRenderingJob(mapProject: MapProject): MapRenderingJobDefinition {
    return {
        Data: {
            Type: "maps",
            ID: mapProject.id,
            Attributes: {
                Fileformat: mapProject.options.fileFormat,
                Style: mapProject.options.mapStyle,
                Projection: "3857",
                Scale: getScaleProperties(mapProject.scale).reductionFactor,
                Latitude: mapProject.center.latitude,
                Longitude: mapProject.center.longitude,
                PrintWidth: mapProject.widthInMm,
                PrintHeight: mapProject.heightInMm,
                HideLayers: "",
                UserObjects: []
            }
        }
    };
}

export function fromMapRenderingJob(name: string, mapRenderingJob: MapRenderingJobDefinition): MapProject {
    let data = mapRenderingJob.Data;
    let attributes = data.Attributes;
    return {
        id: data.ID,
        name: name,
        state: undefined,
        scale: fromReductionFactor(attributes.Scale),
        center: {latitude: attributes.Latitude, longitude: attributes.Longitude},
        widthInMm: attributes.PrintWidth,
        heightInMm: attributes.PrintHeight,
        options: {
            fileFormat: attributes.Fileformat,
            mapStyle: attributes.Style
        },
        modifiedLocally: false
    };
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
    return {
        id: mapProject.id,
        name: mapProject.name,
        state: mapProject.state
    };
}