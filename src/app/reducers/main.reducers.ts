import {Action, createReducer, on} from "@ngrx/store";
import {round} from "lodash";
import * as UiActions from "../actions/main.actions";
import {initialState, PrintmapsUiState} from "../model/intern/printmaps-ui-state";
import {getScaleProperties, Scale} from "../model/intern/scale";
import {MapProjectState} from "../model/intern/map-project-state";
import {FileFormat, MapStyle} from "../model/api/map-rendering-job-definition";

const reducer = createReducer(initialState,

    on(UiActions.mapProjectReferencesLoaded,
        (state, {mapProjectReferences}) => ({
            ...state,
            mapProjectReferences: mapProjectReferences
        })),

    on(UiActions.createMapProject,
        (state, {name}) => ({
            ...state,
            currentMapProject: {
                id: undefined,
                name: name,
                modifiedLocally: true,
                state: MapProjectState.NOT_RENDERED,
                center: state.mapCenter,
                widthInMm: 210,
                heightInMm: 297,
                scale: Scale.RATIO_1_50000,
                options: {
                    fileFormat: FileFormat.SVG,
                    mapStyle: MapStyle.OSM_CARTO
                }
            }
        })),

    on(UiActions.mapProjectLoaded,
        (state, {mapProject}) => ({
            ...state,
            currentMapProject: mapProject
        })),

    on(UiActions.closeMapProject,
        (state) => ({
            ...state,
            currentMapProject: undefined
        })),

    on(UiActions.mapProjectDeleted,
        (state, {id}) => ({
            ...state,
            currentMapProject: state.currentMapProject?.id == id ? undefined : state.currentMapProject,
            mapProjectReferences: state.mapProjectReferences.filter(mapProjectReference => mapProjectReference.id != id)
        })),

    on(UiActions.mapProjectUploaded,
        (state, {mapProjectReference}) => ({
            ...state,
            currentMapProject: {
                ...state.currentMapProject,
                id: state.currentMapProject.id ? state.currentMapProject.id : mapProjectReference.id,
                modifiedLocally: false
            },
            mapProjectReferences: [
                ...state.mapProjectReferences,
                ...(state.mapProjectReferences.filter(other => other.id == mapProjectReference.id).length == 0
                    ? [mapProjectReference]
                    : [])
            ]
        })),

    on(UiActions.updateMapName,
        (state, {name}) => ({
            ...state,
            mapProjectReferences: state.mapProjectReferences.map(
                mapProjectReference =>
                    mapProjectReference.id == state.currentMapProject.id
                        ? {...mapProjectReference, name: name}
                        : mapProjectReference
            )
        })),

    on(UiActions.updateCenterCoordinates,
        (state, {center}) => {
            let roundedCoordinates = {
                latitude: Math.min(Math.max(round(center.latitude, 9), -85), 85),
                longitude: Math.min(Math.max(round(center.longitude, 9), -180), 180)
            };
            return {
                ...state,
                mapCenter: roundedCoordinates,
                currentMapProject: state.currentMapProject
                    ? {
                        ...state.currentMapProject,
                        center: roundedCoordinates,
                        modifiedLocally: true
                    }
                    : state.currentMapProject
            };
        }),

    on(UiActions.updateSelectedArea,
        (state, {widthInM, heightInM, scale}) => ({
            ...state,
            currentMapProject: {
                ...state.currentMapProject,
                widthInMm: Math.min(Math.max(round(widthInM / getScaleProperties(scale).reductionFactor * 1000), 50), 3000),
                heightInMm: Math.min(Math.max(round(heightInM / getScaleProperties(scale).reductionFactor * 1000), 50), 2500),
                scale: scale,
                modifiedLocally: true
            }
        })),

    on(UiActions.updateMapOptions,
        (state, {options}) => ({
            ...state,
            currentMapProject: {
                ...state.currentMapProject,
                options: options,
                modifiedLocally: true
            }
        })),

    on(UiActions.mapProjectStateUpdated,
        (state, {id, mapProjectState}) => ({
            ...state,
            mapProjectReferences: state.mapProjectReferences?.map(
                mapProjectReference => mapProjectReference.id == id
                    ? {
                        ...mapProjectReference,
                        state: mapProjectState
                    }
                    : mapProjectReference
            ),
            currentMapProject: state.currentMapProject?.id == id
                ? {
                    ...state.currentMapProject,
                    state: mapProjectState
                }
                : state.currentMapProject
        }))
);

export function printmapsUiReducer(state: PrintmapsUiState | undefined, action: Action) {
    return reducer(state, action);
}
