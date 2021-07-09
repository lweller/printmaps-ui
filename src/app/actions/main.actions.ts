import {createAction, props} from "@ngrx/store";
import {createActionType} from "../utils/message.util";
import {Scale} from "../model/intern/scale";
import {MapProject} from "../model/intern/map-project";
import {MapOptions} from "../model/intern/map-options";
import {MapProjectReference} from "../model/intern/map-project-reference";
import {MapProjectState} from "../model/intern/map-project-state";
import {GeoCoordinates} from "../model/intern/geo-coordinates";
import {AdditionalElementType, AnyAdditionalElement} from "../model/intern/additional-element";

const SOURCE = "Printmaps UI";

export const init = createAction(
    createActionType(SOURCE, "INIT")
);

export const loadMapProjectReferences = createAction(
    createActionType(SOURCE, "LOAD_MAP_PROJECT_REFERENCES")
);

export const mapProjectReferencesLoaded = createAction(
    createActionType(SOURCE, "MAP_PROJECT_REFERENCES_LOADED"),
    props<{ mapProjectReferences: MapProjectReference[] }>()
);

export const updateCenterCoordinates = createAction(
    createActionType(SOURCE, "UPDATE_CENTER_COORDINATES"),
    props<{ center: GeoCoordinates }>()
);

export const updateSelectedArea = createAction(
    createActionType(SOURCE, "UPDATE_SELECTED_AREA"),
    props<{ widthInM: number, heightInM: number, topMarginInMm: number, bottomMarginInMm: number, leftMarginInMm: number, rightMarginInMm: number, scale: Scale }>()
);

export const updateMapName = createAction(
    createActionType(SOURCE, "UPDATE_MAP_NAME"),
    props<{ name: string }>()
);

export const updateMapOptions = createAction(
    createActionType(SOURCE, "UPDATE_MAP_OPTIONS"),
    props<{ options: MapOptions }>()
);

export const createMapProject = createAction(
    createActionType(SOURCE, "CREATE_MAP_PROJECT"),
    props<{ name: string }>()
);

export const loadMapProject = createAction(
    createActionType(SOURCE, "LOAD_MAP_PROJECT"),
    props<{ mapProjectReference: MapProjectReference }>()
);

export const mapProjectLoaded = createAction(
    createActionType(SOURCE, "MAP_PROJECT_LOADED"),
    props<{ mapProject: MapProject }>()
);

export const closeMapProject = createAction(
    createActionType(SOURCE, "CLOSE_MAP_PROJECT")
);

export const deleteMapProject = createAction(
    createActionType(SOURCE, "DELETE_MAP_PROJECT"),
    props<{ id: string }>()
);

export const mapProjectDeleted = createAction(
    createActionType(SOURCE, "MAP_PROJECT_DELETED"),
    props<{ id: string }>()
);

export type UploadMapProjectFollowUpAction = "close" | "launchRendering";

export const uploadMapProject = createAction(
    createActionType(SOURCE, "UPLOAD_MAP_PROJECT"),
    props<{ mapProject: MapProject, followUpAction?: UploadMapProjectFollowUpAction }>()
);

export const mapProjectUploaded = createAction(
    createActionType(SOURCE, "MAP_PROJECT_UPLOADED"),
    props<{ mapProjectReference: MapProjectReference, followUpAction?: UploadMapProjectFollowUpAction }>()
);

export function createUploadMapProjectFollowUpAction(followUpAction: UploadMapProjectFollowUpAction, id: string) {
    switch (followUpAction) {
        case "close":
            return closeMapProject();
        case "launchRendering":
            return launchMapProjectRendering({id: id});
        default:
            return undefined;
    }
}

export const launchMapProjectRendering = createAction(
    createActionType(SOURCE, "LAUNCH_MAP_PROJECT_RENDERING"),
    props<{ id: string }>()
);

export const refreshMapProjectState = createAction(
    createActionType(SOURCE, "REFRESH_MAP_PROJECT_STATE"),
    props<{ id: string }>()
);

export const mapProjectStateUpdated = createAction(
    createActionType(SOURCE, "MAP_PROJECT_STATE_UPDATED"),
    props<{ id: string, mapProjectState: MapProjectState }>()
);

export const addAdditionalElement = createAction(
    createActionType(SOURCE, "ADD_ADDITIONAL_ELEMENT"),
    props<{ elementType: AdditionalElementType }>()
);

export const selectAdditionalElement = createAction(
    createActionType(SOURCE, "SELECT_ADDITIONAL_ELEMENT"),
    props<{ id: string }>()
);

export const removeAdditionalElement = createAction(
    createActionType(SOURCE, "REMOVE_ADDITIONAL_ELEMENT"),
    props<{ id: string }>()
);

export const updateAdditionalElement = createAction(
    createActionType(SOURCE, "UPDATE_ADDITIONAL_ELEMENT"),
    props<{ element: AnyAdditionalElement }>()
);
