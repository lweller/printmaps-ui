import {MapRenderingJobState} from "../api/map-rendering-job-state";

export enum MapProjectState {
    NOT_RENDERED = "not-rendered",
    WAITING_FOR_RENDERING = "waiting-for-rendering",
    RENDERING = "rendering",
    READY_FOR_DOWNLOAD = "ready-for-download",
    RENDERING_UNSUCCESSFUL = "rendering-unsuccessful",
    NONEXISTENT = "nonexistent"
}

export function mapProjectStateTooltip(state: MapProjectState) {
    switch (state) {
        case MapProjectState.NOT_RENDERED:
            return $localize`editable, not rendered yet`;
        case MapProjectState.WAITING_FOR_RENDERING:
            return $localize`waiting for rendering to begin`;
        case MapProjectState.RENDERING:
            return $localize`rendering ongoing`;
        case MapProjectState.READY_FOR_DOWNLOAD:
            return $localize`ready for download`;
        case MapProjectState.RENDERING_UNSUCCESSFUL:
            return $localize`rendering was not successful`;
        case MapProjectState.NONEXISTENT:
            return $localize`map project does not exist at server side`;
        default:
            return $localize`unknown project state`;
    }
}

export function fromMapRenderingJobState(mapRenderingJobState: MapRenderingJobState): MapProjectState {
    let attributes = mapRenderingJobState.Data.Attributes;
    if (attributes.MapBuildCompleted != "") {
        return attributes.MapBuildSuccessful == "yes"
            ? MapProjectState.READY_FOR_DOWNLOAD : MapProjectState.RENDERING_UNSUCCESSFUL;
    } else if (attributes.MapBuildStarted != "") {
        return MapProjectState.RENDERING;
    } else if (attributes.MapOrderSubmitted != "") {
        return MapProjectState.WAITING_FOR_RENDERING;
    }
    return MapProjectState.NOT_RENDERED;
}