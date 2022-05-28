import {Action, createReducer, on} from "@ngrx/store";
import {round} from "lodash";
import * as UiActions from "../actions/main.actions";
import {initialState, PrintmapsUiState} from "../model/intern/printmaps-ui-state";
import {getScaleProperties} from "../model/intern/scale";
import {generateMapProjectCopyName} from "../model/intern/map-project";

const reducer = createReducer(initialState,

    on(UiActions.mapProjectReferencesLoaded,
        (state, {mapProjectReferences}) => ({
            ...state,
            mapProjectReferences: mapProjectReferences
        })),

    on(UiActions.createdMapProject,
        (state, {mapProject}) => ({
            ...state,
            currentMapProject: mapProject
        })
    ),

    on(UiActions.copyMapProject,
        (state) => ({
            ...state,
            currentMapProject: state?.currentMapProject?.id
                ? {
                    ...state.currentMapProject,
                    id: undefined,
                    name: generateMapProjectCopyName(state.currentMapProject.name),
                    modifiedLocally: true
                }
                : state.currentMapProject
        })
    ),

    on(UiActions.mapProjectLoaded,
        (state, {mapProject}) => ({
            ...state,
            currentMapProject: !state.currentMapProject || state.currentMapProject?.id ? mapProject : state.currentMapProject
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
        (state, {widthInM, heightInM, topMarginInMm, bottomMarginInMm, leftMarginInMm, rightMarginInMm, scale}) =>
            ({
                ...state,
                currentMapProject: {
                    ...state.currentMapProject,
                    widthInMm: Math.min(Math.max(round(widthInM / getScaleProperties(scale).reductionFactor * 1000) + leftMarginInMm * 1 + rightMarginInMm * 1, 50), 3000),
                    heightInMm: Math.min(Math.max(round(heightInM / getScaleProperties(scale).reductionFactor * 1000) + topMarginInMm * 1 + bottomMarginInMm * 1, 50), 2500),
                    topMarginInMm: topMarginInMm,
                    bottomMarginInMm: bottomMarginInMm,
                    leftMarginInMm: leftMarginInMm,
                    rightMarginInMm: rightMarginInMm,
                    scale: scale,
                    modifiedLocally: true
                }
            })
    ),

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
        })),

    on(UiActions.additionalElementAdded,
        (state, {additionalElement}) => ({
            ...state,
            currentMapProject: {
                ...state.currentMapProject,
                modifiedLocally: true,
                additionalElements: [
                    ...state.currentMapProject.additionalElements,
                    additionalElement
                ]
            },
            selectedAdditionalElementId: additionalElement.id
        })
    ),

    on(UiActions.selectAdditionalElement,
        (state, {id}) => ({
            ...state,
            selectedAdditionalElementId: id
        })),

    on(UiActions.removeAdditionalElement,
        (state, {id}) => ({
            ...state,
            currentMapProject: state.currentMapProject
                ? {
                    ...state.currentMapProject,
                    modifiedLocally: true,
                    additionalElements: state.currentMapProject.additionalElements.filter(element => element.id != id)
                }
                : state.currentMapProject,
            selectedAdditionalElementId: undefined
        })),

    on(UiActions.updateAdditionalElement,
        (state, {element}) => ({
            ...state,
            currentMapProject: state.currentMapProject
                ? {
                    ...state.currentMapProject,
                    modifiedLocally: true,
                    additionalElements: state.currentMapProject.additionalElements
                        .map(currentElement => currentElement.id == element.id
                            ? element
                            : currentElement)
                }
                : state.currentMapProject
        }))
);

export function printmapsUiReducer(state: PrintmapsUiState | undefined, action: Action) {
    return reducer(state, action);
}