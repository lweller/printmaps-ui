import {MapRenderingJobState} from "../api/map-rendering-job-state";

export enum MapProjectState {
    NOT_RENDERED = "not-rendered",
    WAITING_FOR_RENDERING = "waiting-for-rendering",
    RENDERING = "rendering",
    READY_FRO_DOWNLOAD = "ready-for-download",
    RENDERING_UNSUCCESSFUL = "rendering-unsuccessful",
    NONEXISTENT = "nonexistent"
}

export function fromMapRenderingJobState(mapRenderingJobState: MapRenderingJobState): MapProjectState {
    let attributes = mapRenderingJobState.Data.Attributes;
    if (attributes.MapBuildCompleted != "") {
        return attributes.MapBuildSuccessful == "yes"
            ? MapProjectState.READY_FRO_DOWNLOAD : MapProjectState.RENDERING_UNSUCCESSFUL;
    } else if (attributes.MapBuildStarted != "") {
        return MapProjectState.RENDERING;
    } else if (attributes.MapOrderSubmitted != "") {
        return MapProjectState.WAITING_FOR_RENDERING;
    }
    return MapProjectState.NOT_RENDERED;
}