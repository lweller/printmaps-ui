import {Action, createReducer, on} from "@ngrx/store";
import {round} from "lodash";
import * as UiActions from "../actions/main.actions";
import {initialState, PrintmapsUiState} from "../model/intern/printmaps-ui-state";
import {toMapProjectReference} from "../model/intern/map-project";
import {PAPER_FORMAT_SIZES, PaperFormat, PaperSize} from "../model/intern/paper-format";
import {PaperOrientation} from "../model/intern/paper-orientation";

const reducer = createReducer(initialState,

    on(UiActions.mapProjectReferencesLoaded,
        (state, {mapProjectReferences}) => ({
            ...state,
            mapProjectReferences: mapProjectReferences ?? []
        })),

    on(UiActions.mapProjectCreated,
        (state, {mapProject}) => ({
            ...state,
            mapProjectReferences: (state.mapProjectReferences ?? []).some(other => other.id == mapProject.id)
                ? state.mapProjectReferences
                    .map(other => other.id == mapProject.id ? toMapProjectReference(mapProject) : other)
                : [
                    ...(state.mapProjectReferences ?? []),
                    toMapProjectReference(mapProject)
                ]
        })
    ),

    on(UiActions.mapProjectSelected,
        (state, {mapProject}) => ({
            ...state,
            currentMapProject: mapProject,
            mapCenter: mapProject?.center ?? state.mapCenter
        })
    ),

    on(UiActions.mapProjectDeleted,
        (state, {id}) => ({
            ...state,
            currentMapProject: state.currentMapProject?.id == id ? undefined : state.currentMapProject,
            mapProjectReferences: state.mapProjectReferences?.filter(mapProjectReference => mapProjectReference.id != id)
        })),

    on(UiActions.mapProjectUploaded,
        (state, {mapProjectReference}) => ({
            ...state,
            currentMapProject: state?.currentMapProject?.id && state?.currentMapProject?.id != mapProjectReference.id
                ? state.currentMapProject
                : {
                    ...state.currentMapProject,
                    id: state?.currentMapProject?.id ? state.currentMapProject.id : mapProjectReference.id,
                    modifiedLocally: false
                },
            mapProjectReferences:
                state.mapProjectReferences?.map(other => other.id == mapProjectReference.id ? mapProjectReference : other)
        })),

    on(UiActions.updateMapName,
        (state, {name}) => ({
            ...state,
            currentMapProject: state.currentMapProject
                ? {
                    ...state.currentMapProject,
                    name: name,
                    modifiedLocally: true
                }
                : state.currentMapProject,
            mapProjectReferences: state.mapProjectReferences?.map(
                mapProjectReference =>
                    mapProjectReference.id == state.currentMapProject?.id
                        ? {...mapProjectReference, name: name}
                        : mapProjectReference
            )
        })),

    on(UiActions.updateCenterCoordinates,
        (state, {latitude, longitude}) => {
            let roundedCoordinates = {
                latitude: Math.min(Math.max(round(latitude, 9), -85), 85),
                longitude: Math.min(Math.max(round(longitude, 9), -180), 180)
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
        (state, {
            widthInMm,
            heightInMm,
            topMarginInMm,
            bottomMarginInMm,
            leftMarginInMm,
            rightMarginInMm,
            format,
            orientation,
            scale
        }) =>
            ({
                ...state,
                currentMapProject: state.currentMapProject
                    ? {
                        ...state.currentMapProject,
                        ...computePaperSize(format, orientation, {
                            widthInMm: widthInMm ?? state.currentMapProject.widthInMm,
                            heightInMm: heightInMm ?? state.currentMapProject.heightInMm
                        }),
                        ...{
                            topMarginInMm: topMarginInMm ?? state.currentMapProject.topMarginInMm,
                            bottomMarginInMm: bottomMarginInMm ?? state.currentMapProject.bottomMarginInMm,
                            leftMarginInMm: leftMarginInMm ?? state.currentMapProject.leftMarginInMm,
                            rightMarginInMm: rightMarginInMm ?? state.currentMapProject.rightMarginInMm,
                            scale: scale ?? state.currentMapProject.scale,
                            modifiedLocally: true
                        }
                    }
                    : state.currentMapProject
            })
    ),

    on(UiActions.updateMapOptions,
        (state, {fileFormat, mapStyle}) => ({
            ...state,
            currentMapProject: state.currentMapProject
                ? {
                    ...state.currentMapProject,
                    options: {
                        fileFormat: fileFormat,
                        mapStyle: mapStyle
                    },
                    modifiedLocally: true
                }
                : state.currentMapProject
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
        (state, {additionalElement}) => (state.currentMapProject
            ? {
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
            }
            : state)
    ),

    on(UiActions.selectAdditionalElement,
        (state, {id}) => ({
            ...state,
            selectedAdditionalElementId: state?.currentMapProject?.additionalElements?.some(element => element.id == id)
                ? id
                : state.selectedAdditionalElementId
        })),

    on(UiActions.removeAdditionalElement,
        (state, {id}) => (state.currentMapProject?.additionalElements?.some(element => element.id == id)
                ? {
                    ...state,
                    currentMapProject: {
                        ...state.currentMapProject,
                        modifiedLocally: true,
                        additionalElements: state.currentMapProject.additionalElements.filter(element => element.id != id)
                    },
                    selectedAdditionalElementId: undefined
                }
                : state
        )),

    on(UiActions.updateAdditionalElement,
        (state, {element}) => (state.currentMapProject?.additionalElements?.some(otherElement => otherElement.id == element.id)
                ? {
                    ...state,
                    currentMapProject: {
                        ...state.currentMapProject,
                        modifiedLocally: true,
                        additionalElements: state.currentMapProject.additionalElements
                            .map(currentElement => currentElement.id == element.id
                                ? element
                                : currentElement)
                    }
                }
                : state
        ))
);

export function printmapsUiReducer(state: PrintmapsUiState | undefined, action: Action) {
    return reducer(state, action);
}

function computePaperSize(format: PaperFormat, orientation: PaperOrientation, paperSize: PaperSize): PaperSize {
    orientation = orientation ??
        (paperSize.widthInMm <= paperSize.heightInMm ? PaperOrientation.PORTRAIT : PaperOrientation.LANDSCAPE);
    let formatForOrientation = PAPER_FORMAT_SIZES.get(format);
    switch (true) {
        case !!formatForOrientation:
            return formatForOrientation(orientation);
        case orientation == PaperOrientation.PORTRAIT:
            return {
                widthInMm: roundWidth(Math.min(paperSize.widthInMm, paperSize.heightInMm)),
                heightInMm: roundHeight(Math.max(paperSize.widthInMm, paperSize.heightInMm))
            };
        case orientation == PaperOrientation.LANDSCAPE:
            return {
                widthInMm: roundWidth(Math.max(paperSize.widthInMm, paperSize.heightInMm)),
                heightInMm: roundHeight(Math.min(paperSize.widthInMm, paperSize.heightInMm))
            };
        default:
            return {
                widthInMm: roundWidth(paperSize.widthInMm),
                heightInMm: roundHeight((paperSize.heightInMm))
            };
    }
}

function roundWidth(widthInMm: number) {
    return Math.min(Math.max(widthInMm, 50), 3000);
}

function roundHeight(heightInMm: number) {
    return Math.min(Math.max(heightInMm, 50), 2500);
}