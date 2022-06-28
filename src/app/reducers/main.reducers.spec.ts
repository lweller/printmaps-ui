import {printmapsUiReducer} from "./main.reducers";
import {initialState} from "../model/intern/printmaps-ui-state";
import * as UiActions from "../actions/main.actions";
import {
    SAMPLE_ADDITIONAL_GPX_ELEMENT,
    SAMPLE_ADDITIONAL_TEXT_ELEMENT,
    SAMPLE_COORDINATES_1,
    SAMPLE_COORDINATES_1_UPDATED,
    SAMPLE_COORDINATES_1_UPDATED_MAX_NORTH,
    SAMPLE_COORDINATES_1_UPDATED_MAX_SOUTH,
    SAMPLE_COORDINATES_1_UPDATED_OVER_PRECISE,
    SAMPLE_COORDINATES_1_UPDATED_TOO_MUCH_NORTH,
    SAMPLE_COORDINATES_1_UPDATED_TOO_MUCH_SOUTH,
    SAMPLE_MAP_PROJECT_1,
    SAMPLE_MAP_PROJECT_2,
    SAMPLE_MAP_PROJECT_ID_1,
    SAMPLE_MAP_PROJECT_REFERENCE_1,
    SAMPLE_MAP_PROJECT_REFERENCE_2
} from "../model/test/test-data";
import {cases} from "jasmine-parameterized";
import {Scale} from "../model/intern/scale";
import {FileFormat, MapStyle} from "../model/api/map-rendering-job-definition";
import {MapProjectState} from "../model/intern/map-project-state";
import {PaperFormat} from "../model/intern/paper-format";
import {PaperOrientation} from "../model/intern/paper-orientation";

describe("printmapsUiReducer", () => {

    it("should return initial state when any action is applied on undefined state", () => {
        // when
        const result = printmapsUiReducer(undefined, {type: "NOOP"});

        // then
        expect(result).toBe(initialState);
    });

    cases([
        [],
        [SAMPLE_MAP_PROJECT_REFERENCE_1],
        [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]
    ])
        .it("should update map project references to corresponding array when mapProjectReferencesLoaded action is applied on initial state", (mapProjectReferences) => {
            // when
            const result = printmapsUiReducer(initialState, UiActions.mapProjectReferencesLoaded({
                mapProjectReferences: mapProjectReferences
            }));

            // then
            expect(result.mapProjectReferences)
                .withContext("PrintmapsUiState.mapProjectReferences")
                .toEqual(mapProjectReferences);
        });

    it("should update map project references to empty array when mapProjectReferencesLoaded action is applied with undefined value on initial state", () => {
        // when
        const result = printmapsUiReducer(initialState, UiActions.mapProjectReferencesLoaded({
            mapProjectReferences: undefined
        }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([]);
    });

    it("should add map project reference to list of projects when mapProjectCreated action is applied on initial state", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.mapProjectCreated({
                mapProject: SAMPLE_MAP_PROJECT_1
            }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([SAMPLE_MAP_PROJECT_REFERENCE_1]);
    });

    it("should append map project reference to list of projects when mapProjectCreated action is applied on state without this map project reference", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_2]
            },
            UiActions.mapProjectCreated({
                mapProject: SAMPLE_MAP_PROJECT_1
            }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([SAMPLE_MAP_PROJECT_REFERENCE_2, SAMPLE_MAP_PROJECT_REFERENCE_1]);
    });

    it("should update current map project when mapProjectSelected action is applied on initial state", () => {
        // when
        const result = printmapsUiReducer(initialState, UiActions.mapProjectSelected({
            mapProject: SAMPLE_MAP_PROJECT_1
        }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should update current map project back to undefined when mapProjectSelected action is applied on state with a current project", () => {
        // when
        const result = printmapsUiReducer({
            ...initialState,
            currentMapProject: SAMPLE_MAP_PROJECT_1
        }, UiActions.mapProjectSelected({
            mapProject: undefined
        }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toBeUndefined();
    });

    it("should set current back to undefined when mapProjectDeleted action is applied on state with ID equal to current one", () => {
        // when
        const result = printmapsUiReducer({
            ...initialState,
            currentMapProject: SAMPLE_MAP_PROJECT_1
        }, UiActions.mapProjectDeleted({
            id: SAMPLE_MAP_PROJECT_ID_1
        }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toBeUndefined();
    });

    it("should remove map project reference when mapProjectDeleted action is applied on state with ID contained in list of map projects", () => {
        // when
        const result = printmapsUiReducer({
            ...initialState,
            mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]
        }, UiActions.mapProjectDeleted({
            id: SAMPLE_MAP_PROJECT_ID_1
        }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([SAMPLE_MAP_PROJECT_REFERENCE_2]);
    });

    it("should set ID of current map project and mark is a not modified locally when mapProjectUploaded action is applied on state with an unsaved current map project (i.e. without any ID)", () => {
        // when
        const result = printmapsUiReducer({
            ...initialState,
            currentMapProject: {
                ...SAMPLE_MAP_PROJECT_1,
                id: undefined,
                modifiedLocally: true
            }
        }, UiActions.mapProjectUploaded({
            mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1
        }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should just mark is a not modified locally when mapProjectUploaded action is applied on state with a saved current map project (i.e. with an ID)", () => {
        // when
        const result = printmapsUiReducer({
            ...initialState,
            currentMapProject: {
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true
            }
        }, UiActions.mapProjectUploaded({
            mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1
        }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should leave current project unchanged when mapProjectUploaded action is applied on state with a different current map project", () => {
        // when
        let SAMPLE_MODIFIED_MAP_PROJECT = {
            ...SAMPLE_MAP_PROJECT_2,
            modifiedLocally: true
        };
        const result = printmapsUiReducer({
            ...initialState,
            currentMapProject: SAMPLE_MODIFIED_MAP_PROJECT
        }, UiActions.mapProjectUploaded({
            mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1
        }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual(SAMPLE_MODIFIED_MAP_PROJECT);
    });

    it("should not re-add map project reference to list of projects when mapProjectUploaded action is applied on state already containing this map project reference", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1]
            },
            UiActions.mapProjectUploaded({
                mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1
            }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([SAMPLE_MAP_PROJECT_REFERENCE_1]);
    });

    it("should not change order of map project references when mapProjectUploaded action is applied on state already containing this map project reference", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]
            },
            UiActions.mapProjectUploaded({
                mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1
            }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
    });

    it("should update map project reference in list of projects when mapProjectUploaded action is applied on state with this map project reference", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]
            },
            UiActions.mapProjectUploaded({
                mapProjectReference: {
                    ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                    state: MapProjectState.WAITING_FOR_RENDERING
                }
            }));

        // then
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toContain({
                ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                state: MapProjectState.WAITING_FOR_RENDERING
            });
    });

    it("should update name of map project, mark it as modified and update also its reference when updateMapName action is applied on state with this project currently selected and containing this map project reference", () => {
        // when
        const NEW_MAP_PROJECT_NAME = "Updated map project";
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]
            },
            UiActions.updateMapName({
                name: NEW_MAP_PROJECT_NAME
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                name: NEW_MAP_PROJECT_NAME
            });
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toEqual([{
                ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                name: NEW_MAP_PROJECT_NAME
            },
                SAMPLE_MAP_PROJECT_REFERENCE_2]);
    });

    it("should update nothing when updateMapName action is applied on state with no project currently selected even if map project reference is present", () => {
        // given
        const INITIAL_STATE = {
            ...initialState,
            mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]
        };

        // when
        const result = printmapsUiReducer(INITIAL_STATE,
            UiActions.updateMapName({
                name: "Updated map project"
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(INITIAL_STATE);
    });

    it("should update coordinates of map center and on current project and mark it as modified when updateCenterCoordinates action is applied on state with currently selected map project", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateCenterCoordinates(SAMPLE_COORDINATES_1_UPDATED));

        // then
        expect(result.mapCenter)
            .withContext("PrintmapsUiState.mapCenter")
            .toEqual(SAMPLE_COORDINATES_1_UPDATED);
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                center: SAMPLE_COORDINATES_1_UPDATED
            });
    });

    it("should update coordinates of map center and within bounds on current project and mark it as modified when updateCenterCoordinates action with latitude over 85° north is applied", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateCenterCoordinates(SAMPLE_COORDINATES_1_UPDATED_TOO_MUCH_NORTH));

        // then
        expect(result.mapCenter)
            .withContext("PrintmapsUiState.mapCenter")
            .toEqual(SAMPLE_COORDINATES_1_UPDATED_MAX_NORTH);
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                center: SAMPLE_COORDINATES_1_UPDATED_MAX_NORTH
            });
    });

    it("should update coordinates of map center and within bounds on current project and mark it as modified when updateCenterCoordinates with latitude bellow 85° south action is applied", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateCenterCoordinates(SAMPLE_COORDINATES_1_UPDATED_TOO_MUCH_SOUTH));

        // then
        expect(result.mapCenter)
            .withContext("PrintmapsUiState.mapCenter")
            .toEqual(SAMPLE_COORDINATES_1_UPDATED_MAX_SOUTH);
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                center: SAMPLE_COORDINATES_1_UPDATED_MAX_SOUTH
            });
    });

    it("should update coordinates of map center and with rounded values on current project and mark it as modified when updateCenterCoordinates action with over precise values is applied", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateCenterCoordinates(SAMPLE_COORDINATES_1_UPDATED_OVER_PRECISE));

        // then
        expect(result.mapCenter)
            .withContext("PrintmapsUiState.mapCenter")
            .toEqual(SAMPLE_COORDINATES_1);
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                center: SAMPLE_COORDINATES_1
            });
    });

    it("should update only coordinates of map center when updateCenterCoordinates action is applied on state with no project currently selected", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.updateCenterCoordinates(SAMPLE_COORDINATES_1_UPDATED));

        // then
        expect(result.mapCenter)
            .withContext("PrintmapsUiState.mapCenter")
            .toEqual(SAMPLE_COORDINATES_1_UPDATED);
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toBeUndefined();
    });

    it("should update current map (by converting width and height to paper size) project and mark it as modified when updateSelectedArea action is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({
                widthInMm: 148,
                heightInMm: 210,
                topMarginInMm: 10,
                bottomMarginInMm: 10,
                leftMarginInMm: 10,
                rightMarginInMm: 10,
                scale: Scale.RATIO_1_25000
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 148,
                heightInMm: 210,
                topMarginInMm: 10,
                bottomMarginInMm: 10,
                leftMarginInMm: 10,
                rightMarginInMm: 10,
                scale: Scale.RATIO_1_25000
            });
    });

    it("should update current map to maximal paper size project when updateSelectedArea action with an oversized dimension is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({
                widthInMm: 3001,
                heightInMm: 2501,
                topMarginInMm: 0,
                bottomMarginInMm: 0,
                leftMarginInMm: 0,
                rightMarginInMm: 0,
                scale: Scale.RATIO_1_25000
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 3000,
                heightInMm: 2500,
                topMarginInMm: 0,
                bottomMarginInMm: 0,
                leftMarginInMm: 0,
                rightMarginInMm: 0,
                scale: Scale.RATIO_1_25000
            });
    });

    it("should update current map to minimal paper size project when updateSelectedArea action with too small dimensions is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({
                widthInMm: 49,
                heightInMm: 49,
                topMarginInMm: 0,
                bottomMarginInMm: 0,
                leftMarginInMm: 0,
                rightMarginInMm: 0,
                scale: Scale.RATIO_1_25000
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 50,
                heightInMm: 50,
                topMarginInMm: 0,
                bottomMarginInMm: 0,
                leftMarginInMm: 0,
                rightMarginInMm: 0,
                scale: Scale.RATIO_1_25000
            });
    });

    it("should update current map to predefined paper size when updateSelectedArea action with with an explicit format is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({format: PaperFormat.A3}));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 297,
                heightInMm: 420
            });
    });

    it("should update current map to predefined paper size when updateSelectedArea action with with an explicit format and custom width and height is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({widthInMm: 200, heightInMm: 300, format: PaperFormat.A3}));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 297,
                heightInMm: 420
            });
    });

    it("should update current map with swapped width and height when updateSelectedArea action with with an explicit orientation is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({orientation: PaperOrientation.LANDSCAPE}));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 297,
                heightInMm: 210
            });
    });

    it("should update current map with swapped width and height when updateSelectedArea action with with an explicit orientation and new custom format is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({widthInMm: 200, heightInMm: 300, orientation: PaperOrientation.LANDSCAPE}));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 300,
                heightInMm: 200
            });
    });

    it("should update current map with swapped width and height when updateSelectedArea action with with an explicit orientation and new custom format is applied on state with a project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateSelectedArea({widthInMm: 200, heightInMm: 300, orientation: PaperOrientation.LANDSCAPE}));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                widthInMm: 300,
                heightInMm: 200
            });
    });

    it("should update nothing when updateSelectedArea action is applied on state with no project currently selected", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.updateSelectedArea({
                widthInMm: 148,
                heightInMm: 210,
                topMarginInMm: 10,
                bottomMarginInMm: 10,
                leftMarginInMm: 10,
                rightMarginInMm: 10,
                scale: Scale.RATIO_1_25000
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(initialState);
    });

    it("should update options of current map project and mark it as modified when updateMapOptions action is applied on state with a project currently selected", () => {
        // given
        const SAMPLE_OPTIONS = {
            fileFormat: FileFormat.SVG,
            mapStyle: MapStyle.OSM_CARTO_MONO
        };

        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.updateMapOptions(SAMPLE_OPTIONS));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                modifiedLocally: true,
                options: SAMPLE_OPTIONS
            });
    });

    it("should update nothing when updateMapOptions action is applied on state with no project currently selected", () => {
        // given
        const SAMPLE_OPTIONS = {
            fileFormat: FileFormat.SVG,
            mapStyle: MapStyle.OSM_CARTO_MONO
        };

        // when
        const result = printmapsUiReducer(initialState, UiActions.updateMapOptions(SAMPLE_OPTIONS));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(initialState);
    });

    it("should update state of map project and corresponding reference when mapProjectStateUpdated action is applied on state with map project currently selected corresponds to ID", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1]
            },
            UiActions.mapProjectStateUpdated({
                id: SAMPLE_MAP_PROJECT_ID_1,
                mapProjectState: MapProjectState.RENDERING
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                state: MapProjectState.RENDERING
            });
        expect(result.mapProjectReferences[0])
            .withContext("PrintmapsUiState.mapProjectReferences[0]")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                state: MapProjectState.RENDERING
            });
    });

    it("should only update corresponding map project reference when mapProjectStateUpdated action is applied on state without any map project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1]
            },
            UiActions.mapProjectStateUpdated({
                id: SAMPLE_MAP_PROJECT_ID_1,
                mapProjectState: MapProjectState.RENDERING
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toBeUndefined();
        expect(result.mapProjectReferences[0])
            .withContext("PrintmapsUiState.mapProjectReferences[0]")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                state: MapProjectState.RENDERING
            });
    });

    it("should only update corresponding map project reference when mapProjectStateUpdated action is applied on state with another any map project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_2,
                mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1]
            },
            UiActions.mapProjectStateUpdated({
                id: SAMPLE_MAP_PROJECT_ID_1,
                mapProjectState: MapProjectState.RENDERING
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual(SAMPLE_MAP_PROJECT_2);
        expect(result.mapProjectReferences[0])
            .withContext("PrintmapsUiState.mapProjectReferences[0]")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                state: MapProjectState.RENDERING
            });
    });

    it("should only update map project when mapProjectStateUpdated action is applied on state with map project currently selected corresponds to ID and no map project references", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.mapProjectStateUpdated({
                id: SAMPLE_MAP_PROJECT_ID_1,
                mapProjectState: MapProjectState.RENDERING
            }));

        // then
        expect(result.currentMapProject)
            .withContext("PrintmapsUiState.currentMapProject")
            .toEqual({
                ...SAMPLE_MAP_PROJECT_1,
                state: MapProjectState.RENDERING
            });
        expect(result.mapProjectReferences)
            .withContext("PrintmapsUiState.mapProjectReferences")
            .toBeUndefined();
    });

    it("should append additional element to current map project , mark it as modified and mark the element as selected when additionalElementAdded action is applied on state with a map project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.additionalElementAdded({
                additionalElement: SAMPLE_ADDITIONAL_TEXT_ELEMENT
            }));

        // then
        expect(result.currentMapProject.modifiedLocally)
            .withContext("PrintmapsUiState.currentMapProject.modifiedLocally")
            .toBeTrue();
        expect(result.currentMapProject.additionalElements)
            .withContext("PrintmapsUiState.currentMapProject.additionalElements")
            .toHaveSize(1);
        expect(result.currentMapProject.additionalElements[0])
            .withContext("PrintmapsUiState.currentMapProject.additionalElements[0]")
            .toEqual(SAMPLE_ADDITIONAL_TEXT_ELEMENT);
        expect(result.selectedAdditionalElementId)
            .withContext("PrintmapsUiState.selectedAdditionalElementId")
            .toBe(SAMPLE_ADDITIONAL_TEXT_ELEMENT.id);
    });

    it("should append additional element after existing one to current map project, mark it as modified and mark the element as selected when additionalElementAdded action is applied on state with a map project currently selected", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: {
                    ...SAMPLE_MAP_PROJECT_1,
                    additionalElements: [SAMPLE_ADDITIONAL_GPX_ELEMENT]
                }
            },
            UiActions.additionalElementAdded({
                additionalElement: SAMPLE_ADDITIONAL_TEXT_ELEMENT
            }));

        // then
        expect(result.currentMapProject.modifiedLocally)
            .withContext("PrintmapsUiState.currentMapProject.modifiedLocally")
            .toBeTrue();
        expect(result.currentMapProject.additionalElements)
            .withContext("PrintmapsUiState.currentMapProject.additionalElements")
            .toHaveSize(2);
        expect(result.currentMapProject.additionalElements[1])
            .withContext("PrintmapsUiState.currentMapProject.additionalElements[1]")
            .toEqual(SAMPLE_ADDITIONAL_TEXT_ELEMENT);
        expect(result.selectedAdditionalElementId)
            .withContext("PrintmapsUiState.selectedAdditionalElementId")
            .toBe(SAMPLE_ADDITIONAL_TEXT_ELEMENT.id);
    });

    it("should do nothing the element as selected when additionalElementAdded action is applied on state without any map project currently selected", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.additionalElementAdded({
                additionalElement: SAMPLE_ADDITIONAL_TEXT_ELEMENT
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(initialState);
    });

    it("should mark the additional element as selected when selectAdditionalElement action is applied on state with a map project currently selected that contains this element", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: {
                    ...SAMPLE_MAP_PROJECT_1,
                    additionalElements: [SAMPLE_ADDITIONAL_TEXT_ELEMENT]
                }
            },
            UiActions.selectAdditionalElement({
                id: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            }));

        // then
        expect(result.selectedAdditionalElementId)
            .withContext("PrintmapsUiState.selectedAdditionalElementId")
            .toBe(SAMPLE_ADDITIONAL_TEXT_ELEMENT.id);
    });

    it("should not mark the additional element as selected when selectAdditionalElement action is applied on state with a map project currently selected that does not contain this element", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: SAMPLE_MAP_PROJECT_1
            },
            UiActions.selectAdditionalElement({
                id: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            }));

        // then
        expect(result.selectedAdditionalElementId)
            .withContext("PrintmapsUiState.selectedAdditionalElementId")
            .toBeUndefined();
    });

    it("should not mark the additional element as selected when selectAdditionalElement action is applied on state without any map project currently selected", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.selectAdditionalElement({
                id: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            }));

        // then
        expect(result.selectedAdditionalElementId)
            .withContext("PrintmapsUiState.selectedAdditionalElementId")
            .toBeUndefined();
    });

    it("should remove additional element from current map project, mark it as modified locally and undefine selected element if it is the selected one when removeAdditionalElement action is applied on state with a map project currently selected, that contains this element", () => {
        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: {
                    ...SAMPLE_MAP_PROJECT_1,
                    additionalElements: [SAMPLE_ADDITIONAL_TEXT_ELEMENT]
                },
                selectedAdditionalElementId: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            },
            UiActions.removeAdditionalElement({
                id: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            }));

        // then
        expect(result.currentMapProject.modifiedLocally)
            .withContext("PrintmapsUiState.currentMapProject.modifiedLocally")
            .toBeTrue();
        expect(result.currentMapProject.additionalElements)
            .withContext("PrintmapsUiState.currentMapProject.additionalElements")
            .toHaveSize(0);
        expect(result.selectedAdditionalElementId)
            .withContext("PrintmapsUiState.selectedAdditionalElementId")
            .toBeUndefined();
    });

    it("should do nothing when removeAdditionalElement action is applied on state with a map project currently selected, that does not contain this element", () => {
        // given
        const INITIAL_STATE = {
            ...initialState,
            currentMapProject: {
                ...SAMPLE_MAP_PROJECT_1,
                additionalElements: [SAMPLE_ADDITIONAL_GPX_ELEMENT]
            },
            selectedAdditionalElementId: SAMPLE_ADDITIONAL_GPX_ELEMENT.id
        };

        // when
        const result = printmapsUiReducer(INITIAL_STATE,
            UiActions.removeAdditionalElement({
                id: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(INITIAL_STATE);
    });

    it("should do nothing when removeAdditionalElement action is applied on state without any map project currently selected", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.removeAdditionalElement({
                id: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(initialState);
    });

    it("should update additional element from current map project and mark it as modified locally when updateAdditionalElement action is applied on state with a map project currently selected, that contains this element", () => {
        // given
        const SAMPLE_MODIFIED_ADDITIONAL_TEXT_ELEMENT = {
            ...SAMPLE_ADDITIONAL_TEXT_ELEMENT,
            name: "Modified element"
        };

        // when
        const result = printmapsUiReducer({
                ...initialState,
                currentMapProject: {
                    ...SAMPLE_MAP_PROJECT_1,
                    additionalElements: [SAMPLE_ADDITIONAL_TEXT_ELEMENT]
                }
            },
            UiActions.updateAdditionalElement({
                element: SAMPLE_MODIFIED_ADDITIONAL_TEXT_ELEMENT
            }));

        // then
        expect(result.currentMapProject.modifiedLocally)
            .withContext("PrintmapsUiState.currentMapProject.modifiedLocally")
            .toBeTrue();
        expect(result.currentMapProject.additionalElements)
            .withContext("PrintmapsUiState.currentMapProject.additionalElements")
            .toHaveSize(1);
        expect(result.currentMapProject.additionalElements[0])
            .withContext("PrintmapsUiState.currentMapProject.additionalElements[0]")
            .toEqual(SAMPLE_MODIFIED_ADDITIONAL_TEXT_ELEMENT);
    });

    it("should do nothing when updateAdditionalElement action is applied on state with a map project currently selected, that does not contain this element", () => {
        // given
        const INITIAL_STATE = {
            ...initialState,
            currentMapProject: {
                ...SAMPLE_MAP_PROJECT_1,
                additionalElements: [SAMPLE_ADDITIONAL_GPX_ELEMENT]
            }
        };
        const SAMPLE_MODIFIED_ADDITIONAL_TEXT_ELEMENT = {
            ...SAMPLE_ADDITIONAL_TEXT_ELEMENT,
            name: "Modified element"
        };

        // when
        const result = printmapsUiReducer(INITIAL_STATE,
            UiActions.updateAdditionalElement({
                element: SAMPLE_MODIFIED_ADDITIONAL_TEXT_ELEMENT
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(INITIAL_STATE);
    });


    it("should do nothing when updateAdditionalElement action is applied on state without any map project currently selected", () => {
        // when
        const result = printmapsUiReducer(initialState,
            UiActions.updateAdditionalElement({
                element: SAMPLE_ADDITIONAL_TEXT_ELEMENT
            }));

        // then
        expect(result)
            .withContext("PrintmapsUiState")
            .toEqual(initialState);
    });
});