import {EMPTY, Observable, of} from "rxjs";
import {Action} from "@ngrx/store";
import {TestBed} from "@angular/core/testing";
import {provideMockActions} from "@ngrx/effects/testing";
import * as UiActions from "../actions/main.actions";
import {MainEffects} from "./main.effects";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {initialState} from "../model/intern/printmaps-ui-state";
import {MapProjectReferenceService} from "../services/map-project-reference.service";
import {PrintmapsService} from "../services/printmaps.service";
import {ConfigurationService} from "../services/configuration.service";
import {MapProjectState} from "../model/intern/map-project-state";
import {currentMapProject, mapProjectReferences, selectedMapCenter} from "../selectors/main.selectors";
import {AdditionalElementType} from "../model/intern/additional-element";
import {TypedAction} from "@ngrx/store/src/models";
import {cold, hot} from "jasmine-marbles";
import {cases} from "jasmine-parameterized";
import {allValuesOf} from "../utils/common.util";
import {TestObservable} from "jasmine-marbles/src/test-observables";
import {
    SAMPLE_ADDITIONAL_ELEMENT,
    SAMPLE_APP_CONF,
    SAMPLE_COORDINATES_1,
    SAMPLE_MAP_PROJECT_1,
    SAMPLE_MAP_PROJECT_2,
    SAMPLE_MAP_PROJECT_ID_1,
    SAMPLE_MAP_PROJECT_ID_2,
    SAMPLE_MAP_PROJECT_REFERENCE_1,
    SAMPLE_MAP_PROJECT_REFERENCE_2
} from "../model/test/test-data";

let actions$: Observable<Action>;

let store: MockStore;

let mapProjectReferenceService: MapProjectReferenceService;
let printmapsService: PrintmapsService;
let configurationService: ConfigurationService;

let effects: MainEffects;

function setup() {
    actions$ = new Observable<Action>();

    TestBed.configureTestingModule({
        providers: [
            MainEffects,
            provideMockActions(() => actions$),
            provideMockStore({initialState}),
            {provide: ConfigurationService, useValue: new ConfigurationService()},
            {
                provide: PrintmapsService,
                useValue: new PrintmapsService("en-US", undefined, undefined,
                    undefined, undefined)
            },
            {provide: MapProjectReferenceService, useValue: new MapProjectReferenceService(undefined)}
        ]
    });

    effects = TestBed.inject(MainEffects);

    store = TestBed.inject(MockStore);

    configurationService = TestBed.inject(ConfigurationService);
    printmapsService = TestBed.inject(PrintmapsService);
    mapProjectReferenceService = TestBed.inject(MapProjectReferenceService);
}

function dispatch(action: TypedAction<any> | Observable<TypedAction<any>>) {
    actions$ = action instanceof Observable ? action : hot("a", {a: action});
}

function singleton(action: TypedAction<any>): TestObservable {
    return cold("a", {a: action});
}

describe("init", () => {

    beforeEach(() => {
        setup();
    });

    it("should dispatch updateCenterCoordinates action with coordinates obtained from configuration service when init action is dispatched", () => {
        // given
        spyOnProperty(configurationService, "appConf", "get").and.returnValue(SAMPLE_APP_CONF);


        // when
        dispatch(UiActions.init);

        // then
        expect(effects.init)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.updateCenterCoordinates({center: SAMPLE_COORDINATES_1})));
    });
});

describe("createMapProject", () => {

    beforeEach(() => {
        setup();
    });

    it("should dispatch mapProjectSelected action with a new project based on currently selected coordinates when createMapProject action is dispatched", () => {
        // given
        store.overrideSelector(selectedMapCenter, SAMPLE_COORDINATES_1);
        spyOn(printmapsService, "createMapProject").and.returnValue(of(SAMPLE_MAP_PROJECT_1));

        // when
        dispatch(UiActions.createMapProject);

        // then
        expect(effects.createMapProject)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectSelected({mapProject: SAMPLE_MAP_PROJECT_1})));
        expect(printmapsService.createMapProject)
            .withContext("method printmapsService.createMapProject()")
            .toHaveBeenCalled();
    });

    it("should dispatch no further action when createMapProject action is dispatched and no coordinates are currently selected", () => {
        // given
        spyOn(printmapsService, "createMapProject");

        // when
        dispatch(UiActions.createMapProject);

        // then
        expect(effects.createMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.createMapProject)
            .withContext("method printmapsService.createMapProject()")
            .not.toHaveBeenCalled();
    });
});

describe("copyMapProject", () => {

    beforeEach(() => {
        setup();
    });

    it("should dispatch mapProjectSelected action with a new project based on currently selected coordinates when copyMapProject action is dispatched", () => {
        // given
        store.overrideSelector(currentMapProject, SAMPLE_MAP_PROJECT_1);
        let SAMPLE_CLONED_MAP_PROJECT = {
            ...SAMPLE_MAP_PROJECT_1,
            id: undefined,
            name: SAMPLE_MAP_PROJECT_1.name + " (copy)",
            modifiedLocally: true
        };
        spyOn(printmapsService, "cloneMapProject").and.returnValue(of(SAMPLE_CLONED_MAP_PROJECT));

        // when
        dispatch(UiActions.copyMapProject);

        // then
        expect(effects.copyMapProject)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectSelected({mapProject: SAMPLE_CLONED_MAP_PROJECT})));
        expect(printmapsService.cloneMapProject)
            .withContext("method printmapsService.cloneMapProject()")
            .toHaveBeenCalled();
    });

    it("should dispatch no further action when copyMapProject action is dispatched and no coordinates are currently selected", () => {
        // given
        spyOn(printmapsService, "cloneMapProject");

        // when
        dispatch(UiActions.copyMapProject);

        // then
        expect(effects.copyMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.cloneMapProject)
            .withContext("method printmapsService.cloneMapProject()")
            .not.toHaveBeenCalled();
    });
});

describe("addAdditionalElement", () => {

    beforeEach(() => {
        setup();
    });

    it("should dispatch additionalElementAdded action with a new additional element based on currently selected project when addAdditionalElement action is dispatched", () => {
        // given
        store.overrideSelector(currentMapProject, SAMPLE_MAP_PROJECT_1);
        spyOn(printmapsService, "createAdditionalElement").and.returnValue(SAMPLE_ADDITIONAL_ELEMENT);

        // when
        dispatch(UiActions.addAdditionalElement({elementType: AdditionalElementType.TEXT_BOX}));

        // then
        expect(effects.addAdditionalElement)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.additionalElementAdded({additionalElement: SAMPLE_ADDITIONAL_ELEMENT})));
        expect(printmapsService.createAdditionalElement)
            .withContext("method printmapsService.createAdditionalElement()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_1, AdditionalElementType.TEXT_BOX);
    });

    it("should dispatch no further action when createMapProject action is dispatched but no map project is currently selected", () => {
        // given
        spyOn(printmapsService, "createAdditionalElement");

        // when
        dispatch(UiActions.addAdditionalElement({elementType: AdditionalElementType.TEXT_BOX}));

        // then
        expect(effects.addAdditionalElement)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.createAdditionalElement)
            .withContext("method printmapsService.createAdditionalElement()")
            .not.toHaveBeenCalled();
    });
});

describe("deleteMapProject", () => {

    beforeEach(() => {
        setup();
    });

    it("should delete map rendering job and dispatch mapProjectDeleted action when deleteMapProject is dispatched with an ID of a deletable project", () => {
        // given
        spyOn(printmapsService, "deleteMapRenderingJob").and.returnValue(of(true));

        // when
        dispatch(UiActions.deleteMapProject({id: SAMPLE_MAP_PROJECT_ID_1}));

        //then
        expect(effects.deleteMapProject)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectDeleted({id: SAMPLE_MAP_PROJECT_ID_1})));
        expect(printmapsService.deleteMapRenderingJob)
            .withContext("method printmapsService.deleteMapRenderingJob()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_ID_1);
    });

    it("should delete map rendering job and dispatch mapProjectDeleted action when deleteMapProject is dispatched without an ID of, but current map project is a deletable project", () => {
        // given
        store.overrideSelector(currentMapProject, SAMPLE_MAP_PROJECT_1);
        spyOn(printmapsService, "deleteMapRenderingJob").and.returnValue(of(true));

        // when
        dispatch(UiActions.deleteMapProject({}));

        //then
        expect(effects.deleteMapProject)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectDeleted({id: SAMPLE_MAP_PROJECT_ID_1})));
        expect(printmapsService.deleteMapRenderingJob)
            .withContext("method printmapsService.deleteMapRenderingJob()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_ID_1);
    });

    it("should dispatch no further action when deleteMapProject action is dispatched but neither a map project is currently selected nor an ID is passed with action", () => {
        // given
        spyOn(printmapsService, "deleteMapRenderingJob");

        // when
        dispatch(UiActions.deleteMapProject({}));

        // then
        expect(effects.deleteMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.deleteMapRenderingJob)
            .withContext("method printmapsService.deleteMapRenderingJob()")
            .not.toHaveBeenCalled();
    });

    it("should dispatch no further action when deleteMapProject action is dispatched but map project can't be deleted successfully", () => {
        // given
        spyOn(printmapsService, "deleteMapRenderingJob").and.returnValue(of(false));

        // when
        dispatch(UiActions.deleteMapProject({id: SAMPLE_MAP_PROJECT_ID_1}));

        // then
        expect(effects.deleteMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.deleteMapRenderingJob)
            .withContext("method printmapsService.deleteMapRenderingJob()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_ID_1);
    });

    it("should delete all map rendering job and dispatch a deleteMapRenderingJob action for each when deleteMapProject is dispatched multiple times in a row with different ID's", () => {
        // given
        spyOn(printmapsService, "deleteMapRenderingJob").and.returnValue(cold("-a", {a: true}));

        // when
        dispatch(cold("(ab)", {
            a: UiActions.deleteMapProject({id: SAMPLE_MAP_PROJECT_ID_1}),
            b: UiActions.deleteMapProject({id: SAMPLE_MAP_PROJECT_ID_2})
        }));

        //then
        expect(effects.deleteMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("-ab", {
                a: UiActions.mapProjectDeleted({id: SAMPLE_MAP_PROJECT_ID_1}),
                b: UiActions.mapProjectDeleted({id: SAMPLE_MAP_PROJECT_ID_2})
            }));
    });

    it("should delete map rendering job twice and dispatch deleteMapRenderingJob action when deleteMapProject is dispatched multiple times in a row with the same ID", () => {
        // given
        spyOn(printmapsService, "deleteMapRenderingJob").and.returnValue(cold("-a", {a: true}));

        // when
        dispatch(cold("(aa)", {
            a: UiActions.deleteMapProject({id: SAMPLE_MAP_PROJECT_ID_1})
        }));

        //then
        expect(effects.deleteMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("-aa", {a: UiActions.mapProjectDeleted({id: SAMPLE_MAP_PROJECT_ID_1})}));
        expect(printmapsService.deleteMapRenderingJob)
            .withContext("method printmapsService.deleteMapRenderingJob()")
            .toHaveBeenCalledTimes(2);
    });
});

describe("loadMapProject", () => {

    beforeEach(() => {
        setup();
    });

    it("should load map rendering job and dispatch mapProjectSelected action when loadMapProject is dispatched with a reference of an existing project", () => {
        // given
        spyOn(printmapsService, "loadMapProject").and.returnValue(of(SAMPLE_MAP_PROJECT_1));

        // when
        dispatch(UiActions.loadMapProject({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1}));

        //then
        expect(effects.loadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectSelected({mapProject: SAMPLE_MAP_PROJECT_1})));
        expect(printmapsService.loadMapProject)
            .withContext("method printmapsService.loadMapProject()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_REFERENCE_1);
    });

    it("should dispatch no further action when loadMapProject action is dispatched but map project can't be loaded successfully (i.e. nothing is returned by underlying service)", () => {
        // given
        spyOn(printmapsService, "loadMapProject").and.returnValue(EMPTY);

        // when
        dispatch(UiActions.loadMapProject({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1}));

        //then
        expect(effects.loadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.loadMapProject)
            .withContext("method printmapsService.loadMapProject()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_REFERENCE_1);
    });

    it("should dispatch no further action when loadMapProject action is dispatched without a valid map project reference", () => {
        // given
        spyOn(printmapsService, "loadMapProject");

        // when
        dispatch(UiActions.loadMapProject({mapProjectReference: undefined}));

        //then
        expect(effects.loadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.loadMapProject)
            .withContext("method printmapsService.loadMapProject()")
            .not.toHaveBeenCalled();
    });

    it("should load only last map rendering job and dispatch mapProjectSelected action when loadMapProject is dispatched multiple times in a row", () => {
        // given
        spyOn(printmapsService, "loadMapProject")
            .withArgs(SAMPLE_MAP_PROJECT_REFERENCE_1).and.returnValue(cold("-a", {a: SAMPLE_MAP_PROJECT_1}))
            .withArgs(SAMPLE_MAP_PROJECT_REFERENCE_2).and.returnValue(cold("-a", {a: SAMPLE_MAP_PROJECT_2}));

        // when
        dispatch(cold("(ab)", {
            a: UiActions.loadMapProject({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1}),
            b: UiActions.loadMapProject({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_2})
        }));

        //then
        expect(effects.loadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("-a", {a: UiActions.mapProjectSelected({mapProject: SAMPLE_MAP_PROJECT_2})}));
    });

    it("should load map rendering job only once and dispatch mapProjectSelected action when loadMapProject is dispatched multiple times in a row with the same reference", () => {
        // given
        spyOn(printmapsService, "loadMapProject")
            .withArgs(SAMPLE_MAP_PROJECT_REFERENCE_1).and.returnValue(cold("-a", {a: SAMPLE_MAP_PROJECT_1}));

        // when
        dispatch(cold("(aa)", {
            a: UiActions.loadMapProject({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1})
        }));

        //then
        expect(effects.loadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("-a", {a: UiActions.mapProjectSelected({mapProject: SAMPLE_MAP_PROJECT_1})}));
        expect(printmapsService.loadMapProject)
            .withContext("method printmapsService.loadMapProject()")
            .toHaveBeenCalledOnceWith(SAMPLE_MAP_PROJECT_REFERENCE_1);
    });
});

describe("loadMapProjectReferences", () => {

    beforeEach(() => {
        setup();
    });

    it("should load map project references and dispatch mapProjectReferencesLoaded action when loadMapProjectReferences action is dispatched", () => {
        // given
        spyOn(mapProjectReferenceService, "loadMapProjectReferences")
            .and.returnValue(of([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_ID_2]));

        // when
        dispatch(UiActions.loadMapProjectReferences());

        //then
        expect(effects.loadMapProjectReferences)
            .withContext("dispatched actions")
            .toBeObservable(cold("a",
                {a: UiActions.mapProjectReferencesLoaded({mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_ID_2]})}
            ));
        expect(mapProjectReferenceService.loadMapProjectReferences)
            .withContext("method mapProjectReferenceService.loadMapProjectReferences()")
            .toHaveBeenCalled();
    });

    it("should load map project references only once and dispatch loadMapProjectReferences action when loadMapProjectReferences is dispatched multiple times in a row", () => {
        // given
        spyOn(mapProjectReferenceService, "loadMapProjectReferences")
            .and.returnValue(cold("-a", {a: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_ID_2]}));

        // when
        dispatch(cold("(aa)", {a: UiActions.loadMapProjectReferences()}));

        //then
        expect(effects.loadMapProjectReferences)
            .withContext("dispatched actions")
            .toBeObservable(cold("-a", {
                a: UiActions.mapProjectReferencesLoaded({mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_ID_2]})
            }));
    });
});

describe("ensureMapProjectIsUploadedAndDispatch", () => {

    beforeEach(() => {
        setup();
    });

    it("should create or update map rendering job and dispatch mapProjectUploaded action when ensureMapProjectIsUploadedAndDispatch action with a modified map project is dispatched", () => {
        // given
        spyOn(printmapsService, "createOrUpdateMapRenderingJob").and.returnValue(of(SAMPLE_MAP_PROJECT_1));
        const SAMPLE_MODIFIED_MAP_PROJECT_1 = {
            ...SAMPLE_MAP_PROJECT_1,
            modifiedLocally: true
        };

        // when
        dispatch(UiActions.ensureMapProjectIsUploadedAndDispatch({
            mapProject: SAMPLE_MODIFIED_MAP_PROJECT_1,
            followUpAction: "launchRendering"
        }));

        //then
        expect(effects.ensureMapProjectIsUploadedAndDispatch)
            .withContext("dispatched actions")
            .toBeObservable(cold("a",
                {
                    a: UiActions.mapProjectUploaded({
                        mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1,
                        followUpAction: "launchRendering"
                    })
                }
            ));
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("method printmapsService.createOrUpdateMapRenderingJob()")
            .toHaveBeenCalledOnceWith(SAMPLE_MODIFIED_MAP_PROJECT_1);
    });

    it("should dispatch mapProjectUploaded action without uploading it when ensureMapProjectIsUploadedAndDispatch action with an unmodified map project is dispatched", () => {
        // given
        spyOn(printmapsService, "createOrUpdateMapRenderingJob").and.returnValue(of(SAMPLE_MAP_PROJECT_1));

        // when
        dispatch(UiActions.ensureMapProjectIsUploadedAndDispatch({
            mapProject: SAMPLE_MAP_PROJECT_1,
            followUpAction: "launchRendering"
        }));

        //then
        expect(effects.ensureMapProjectIsUploadedAndDispatch)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectUploaded({
                mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1,
                followUpAction: "launchRendering"
            })));
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("method printmapsService.createOrUpdateMapRenderingJob()")
            .not.toHaveBeenCalled();
    });

    it("should dispatch mapProjectUploaded for current map project action when ensureMapProjectIsUploadedAndDispatch action without map project is dispatched", () => {
        // given
        store.overrideSelector(currentMapProject, SAMPLE_MAP_PROJECT_1);
        spyOn(printmapsService, "createOrUpdateMapRenderingJob").and.returnValue(of(SAMPLE_MAP_PROJECT_1));

        // when
        dispatch(UiActions.ensureMapProjectIsUploadedAndDispatch({
            followUpAction: "launchRendering"
        }));

        //then
        expect(effects.ensureMapProjectIsUploadedAndDispatch)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.mapProjectUploaded({
                mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1,
                followUpAction: "launchRendering"
            })));
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("method printmapsService.createOrUpdateMapRenderingJob()")
            .not.toHaveBeenCalled();
    });

    it("should dispatch no further action when ensureMapProjectIsUploadedAndDispatch action is dispatched without a map project and no current map project", () => {
        // given
        spyOn(printmapsService, "createOrUpdateMapRenderingJob");

        // when
        dispatch(UiActions.ensureMapProjectIsUploadedAndDispatch({}));

        //then
        expect(effects.ensureMapProjectIsUploadedAndDispatch)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("method printmapsService.createOrUpdateMapRenderingJob()")
            .not.toHaveBeenCalled();
    });
});

describe("mapProjectUploaded", () => {

    beforeEach(() => {
        setup();
    });

    it("should dispatch only refreshMapProjectState action when mapProjectUploaded acton is dispatched without a follow up action", () => {
        // when
        dispatch(UiActions.mapProjectUploaded({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1}));

        // then
        expect(effects.mapProjectUploaded)
            .withContext("dispatched actions")
            .toBeObservable(cold("a", {a: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1})}));
    });

    it("should dispatch only refreshMapProjectState action when mapProjectUploaded acton is dispatched with a follow up action", () => {
        // when
        dispatch(UiActions.mapProjectUploaded({
            mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_1,
            followUpAction: "launchRendering"
        }));

        // then
        expect(effects.mapProjectUploaded)
            .withContext("dispatched actions")
            .toBeObservable(cold("(ab)", {
                a: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1}),
                b: UiActions.launchMapProjectRendering({id: SAMPLE_MAP_PROJECT_ID_1})
            }))
        ;
    });

    it("should dispatch no further action when mapProjectUploaded action is dispatched with an undefined map project reference", () => {
        // when
        dispatch(UiActions.mapProjectUploaded({mapProjectReference: undefined}));

        //then
        expect(effects.mapProjectUploaded)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
    });
});

describe("launchMapProjectRendering", () => {
    beforeEach(() => {
        setup();
    });

    it("should launch rendering of map and dispatch refreshMapProjectState action when launchMapProjectRendering is dispatched with an ID of a renderable project", () => {
        // given
        spyOn(printmapsService, "launchMapRenderingJob").and.returnValue(of(true));

        // when
        dispatch(UiActions.launchMapProjectRendering({id: SAMPLE_MAP_PROJECT_ID_1}));

        //then
        expect(effects.launchMapProjectRendering)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1})));
        expect(printmapsService.launchMapRenderingJob)
            .withContext("method printmapsService.launchMapRenderingJob()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_ID_1);
    });

    it("should dispatch no further action when launchMapProjectRendering action is dispatched without a valid ID", () => {
        // given
        spyOn(printmapsService, "launchMapRenderingJob");

        // when
        dispatch(UiActions.launchMapProjectRendering({id: undefined}));

        // then
        expect(effects.launchMapProjectRendering)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.launchMapRenderingJob)
            .withContext("method printmapsService.launchMapRenderingJob()")
            .not.toHaveBeenCalled();
    });

    it("should dispatch refreshMapProjectState action even when launchMapProjectRendering action is dispatched but map project can't be rendering launched successfully, just to be sure of current state after a failure", () => {
        // given
        spyOn(printmapsService, "launchMapRenderingJob").and.returnValue(of(false));

        // when
        dispatch(UiActions.launchMapProjectRendering({id: SAMPLE_MAP_PROJECT_ID_1}));

        // then
        expect(effects.launchMapProjectRendering)
            .withContext("dispatched actions")
            .toBeObservable(singleton(UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1})));
    });

    it("should launch rendering of all maps and dispatch a refreshMapProjectState action for each when launchMapProjectRendering is dispatched multiple times in a row with different ID's", () => {
        // given
        spyOn(printmapsService, "launchMapRenderingJob").and.returnValue(cold("-(a|)", {a: true}));

        // when
        dispatch(cold("(ab)", {
            a: UiActions.launchMapProjectRendering({id: SAMPLE_MAP_PROJECT_ID_1}),
            b: UiActions.launchMapProjectRendering({id: SAMPLE_MAP_PROJECT_ID_2})
        }));

        //then
        expect(effects.launchMapProjectRendering)
            .withContext("dispatched actions")
            .toBeObservable(cold("-ab", {
                a: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1}),
                b: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_2})
            }));
    });

    it("should launch rendering map twice and dispatch refreshMapProjectState action when launchMapProjectRendering is dispatched multiple times in a row with the same ID (it may have changed in between)", () => {
        // given
        spyOn(printmapsService, "launchMapRenderingJob").and.returnValue(cold("-(a|)", {a: true}));

        // when
        dispatch(cold("(aa)", {
            a: UiActions.launchMapProjectRendering({id: SAMPLE_MAP_PROJECT_ID_1})
        }));

        //then
        expect(effects.launchMapProjectRendering)
            .withContext("dispatched actions")
            .toBeObservable(cold("-aa", {a: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1})}));
        expect(printmapsService.launchMapRenderingJob)
            .withContext("method printmapsService.launchMapRenderingJob()")
            .toHaveBeenCalledTimes(2);
    });
});

describe("downloadRenderedMapProject", () => {
    beforeEach(() => {
        setup();
    });

    it("should initiale download of map and dispatch no further action when downloadRenderedMapProject is dispatched with an downloadable map project currently selected", () => {
        // given
        store.overrideSelector(currentMapProject, {
            ...SAMPLE_MAP_PROJECT_1,
            state: MapProjectState.READY_FOR_DOWNLOAD
        });
        spyOn(printmapsService, "downloadRenderedMapFile").and.returnValue(of(true));

        // when
        dispatch(UiActions.downloadRenderedMapProject());

        //then
        expect(effects.downloadRenderedMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.downloadRenderedMapFile)
            .withContext("method printmapsService.downloadRenderedMapFile()")
            .toHaveBeenCalledWith(SAMPLE_MAP_PROJECT_ID_1);
    });

    it("should do nothing when downloadRenderedMapProject is dispatched with no map project currently selected", () => {
        // given
        spyOn(printmapsService, "downloadRenderedMapFile");

        // when
        dispatch(UiActions.downloadRenderedMapProject());

        //then
        expect(effects.downloadRenderedMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.downloadRenderedMapFile)
            .withContext("method printmapsService.downloadRenderedMapFile()")
            .not.toHaveBeenCalled();
    });

    it("should do nothing when downloadRenderedMapProject is dispatched with an unsaved (i.e. without an ID) map project currently selected", () => {
        // given
        store.overrideSelector(currentMapProject, {
            ...SAMPLE_MAP_PROJECT_1,
            id: undefined
        });
        spyOn(printmapsService, "downloadRenderedMapFile");

        // when
        dispatch(UiActions.downloadRenderedMapProject());

        //then
        expect(effects.downloadRenderedMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(printmapsService.downloadRenderedMapFile)
            .withContext("method printmapsService.downloadRenderedMapFile()")
            .not.toHaveBeenCalled();
    });

    cases(allValuesOf(MapProjectState).filter(state => state != MapProjectState.READY_FOR_DOWNLOAD))
        .it("should do nothing when downloadRenderedMapProject is dispatched with a map project currently selected that is not downloadable", (state) => {
            // given
            store.overrideSelector(currentMapProject, {
                ...SAMPLE_MAP_PROJECT_1,
                state: state
            });
            spyOn(printmapsService, "downloadRenderedMapFile");

            // when
            dispatch(UiActions.downloadRenderedMapProject());

            //then
            expect(effects.downloadRenderedMapProject)
                .withContext("dispatched actions")
                .toBeObservable(cold(""));
            expect(printmapsService.downloadRenderedMapFile)
                .withContext("method printmapsService.downloadRenderedMapFile()")
                .not.toHaveBeenCalled();
        });
});

describe("autoSaveMapProjectReferences", () => {
    beforeEach(() => {
        setup();
    });

    cases([[], [SAMPLE_MAP_PROJECT_REFERENCE_1]])
        .it("should save map project references each time they are changed in store", (references) => {
            // given
            let selector = store.overrideSelector(mapProjectReferences, undefined);
            spyOn(mapProjectReferenceService, "saveMapProjectReferences").and.returnValue(of(true));

            // when
            selector.setResult(references);
            store.refreshState();

            // then
            expect(effects.autoSaveMapProjectReferences)
                .withContext("dispatched actions")
                .toBeObservable(cold(""));
            expect(mapProjectReferenceService.saveMapProjectReferences)
                .withContext("method mapProjectReferenceService.saveMapProjectReferences()")
                .toHaveBeenCalledWith(references);
        });

    it("should not save map project references when they are undefined", () => {
        // given
        let mapProjectreferences = store.overrideSelector(mapProjectReferences, [SAMPLE_MAP_PROJECT_REFERENCE_1]);
        spyOn(mapProjectReferenceService, "saveMapProjectReferences").and.returnValue(of(true));

        // when
        mapProjectreferences.setResult(undefined);
        store.refreshState();

        // then
        expect(effects.autoSaveMapProjectReferences)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
        expect(mapProjectReferenceService.saveMapProjectReferences)
            .withContext("method mapProjectReferenceService.saveMapProjectReferences()")
            .not.toHaveBeenCalled();
    });
});

describe("autoUploadMapProject", () => {
    beforeEach(() => {
        setup();
        spyOn(configurationService, "autoUploadDebounceTimer").and.returnValue(cold("--a", {a: 1}));
    });

    it("should dispatch ensureMapProjectIsUploadedAndDispatch action immediately when current map project changed for an unsaved one (i.e. without an ID)", () => {
        // given
        let SAMPLE_UNSAVED_MAP_PROJECT = {
            ...SAMPLE_MAP_PROJECT_1,
            id: undefined,
            modifiedLocally: true
        };
        let selector = store.overrideSelector(currentMapProject, undefined);

        // when
        selector.setResult(SAMPLE_UNSAVED_MAP_PROJECT);
        store.refreshState();

        // then
        expect(effects.autoUploadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("a", {a: UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: SAMPLE_UNSAVED_MAP_PROJECT})}));
    });

    it("should dispatch ensureMapProjectIsUploadedAndDispatch action after configured delay when current map project changed and was already saved (i.e. with an ID)", () => {
        // given
        let SAMPLE_MODIFIED_MAP_PROJECT = {
            ...SAMPLE_MAP_PROJECT_1,
            modifiedLocally: true
        };
        let selector = store.overrideSelector(currentMapProject, undefined);

        // when
        selector.setResult(SAMPLE_MODIFIED_MAP_PROJECT);
        store.refreshState();

        // then
        expect(effects.autoUploadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("--a", {a: UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: SAMPLE_MODIFIED_MAP_PROJECT})}));
    });

    it("should dispatch ensureMapProjectIsUploadedAndDispatch action only with last state when current map project changes twice within the configured intervall", () => {
        // given
        let SAMPLE_MODIFIED_MAP_PROJECT_A = {
            ...SAMPLE_MAP_PROJECT_1,
            modifiedLocally: true
        };
        let SAMPLE_MODIFIED_MAP_PROJECT_B = {
            ...SAMPLE_MODIFIED_MAP_PROJECT_A,
            name: SAMPLE_MODIFIED_MAP_PROJECT_A + "(changed)"
        };
        let selector = store.overrideSelector(currentMapProject, undefined);

        // when
        [SAMPLE_MODIFIED_MAP_PROJECT_A, SAMPLE_MODIFIED_MAP_PROJECT_B].forEach(mapProject => {
            selector.setResult(mapProject);
            store.refreshState();
        });

        // then
        expect(effects.autoUploadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("--a", {a: UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: SAMPLE_MODIFIED_MAP_PROJECT_B})}));
    });

    it("should dispatch ensureMapProjectIsUploadedAndDispatch action twice when current map project changes twice with a gap that is greater than the configured intervall", () => {
        // given
        let SAMPLE_MODIFIED_MAP_PROJECT_A = {
            ...SAMPLE_MAP_PROJECT_1,
            modifiedLocally: true
        };
        let SAMPLE_MODIFIED_MAP_PROJECT_B = {
            ...SAMPLE_MODIFIED_MAP_PROJECT_A,
            name: SAMPLE_MODIFIED_MAP_PROJECT_A + "(changed)"
        };
        let selector = store.overrideSelector(currentMapProject, undefined);

        // when
        selector.setResult(SAMPLE_MODIFIED_MAP_PROJECT_A);
        store.refreshState();
        hot("---a", {a: SAMPLE_MODIFIED_MAP_PROJECT_B})
            .subscribe(() => {
                selector.setResult(SAMPLE_MODIFIED_MAP_PROJECT_B);
                store.refreshState();
            });

        // then
        expect(effects.autoUploadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold("--a--b", {
                a: UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: SAMPLE_MODIFIED_MAP_PROJECT_A}),
                b: UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: SAMPLE_MODIFIED_MAP_PROJECT_B})
            }));
    });

    it("should dispatch no further action when current map project changed to undefined", () => {
        // given
        let selector = store.overrideSelector(currentMapProject, SAMPLE_MAP_PROJECT_1);

        // when
        selector.setResult(undefined);
        store.refreshState();

        // then
        expect(effects.autoUploadMapProject)
            .withContext("dispatched actions")
            .toBeObservable(cold(""));
    });
});

describe("refreshMapProjectState", () => {
    beforeEach(() => {
        setup();
        spyOn(configurationService, "returnAfterPollingDelay")
            .withArgs(SAMPLE_MAP_PROJECT_ID_1).and.returnValue(cold("-a|", {a: SAMPLE_MAP_PROJECT_ID_1}))
            .withArgs(SAMPLE_MAP_PROJECT_ID_2).and.returnValue(cold("-a|", {a: SAMPLE_MAP_PROJECT_ID_2}));
    });

    it("should retrieve current state of map rendering job and dispatch a mapProjectStateUpdated when refreshMapProjectState action is dispatched", () => {
        // given
        spyOn(printmapsService, "loadMapProjectState").and.returnValue(of(MapProjectState.NOT_RENDERED));

        // when
        dispatch(UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1}));

        // then
        expect(effects.refreshMapProjectState)
            .withContext("dispatched actions")
            .toBeObservable(cold("a", {
                a: UiActions.mapProjectStateUpdated({
                    id: SAMPLE_MAP_PROJECT_ID_1,
                    mapProjectState: MapProjectState.NOT_RENDERED
                })
            }));
        expect(printmapsService.loadMapProjectState)
            .withContext("method printmapsService.loadMapProjectState()")
            .toHaveBeenCalledTimes(2);
    });

    cases(allValuesOf(MapProjectState).filter(state => ![MapProjectState.WAITING_FOR_RENDERING, MapProjectState.RENDERING].some(otherState => otherState == state)))
        .it("should retrieve current state of map rendering job and continue polling until rendering is finished (i.e. state is not WAITING_FOR_RENDERING or RENDERING anymore) for each dispatched refreshMapProjectState action", (stateAfterRendering) => {
            // given
            let printmapsServiceSpy = spyOn(printmapsService, "loadMapProjectState");
            [SAMPLE_MAP_PROJECT_ID_1, SAMPLE_MAP_PROJECT_ID_2].forEach(id => {
                printmapsServiceSpy
                    .withArgs(id).and.returnValues(
                    of(MapProjectState.WAITING_FOR_RENDERING),
                    of(MapProjectState.WAITING_FOR_RENDERING),
                    of(MapProjectState.RENDERING),
                    of(MapProjectState.RENDERING),
                    of(stateAfterRendering)
                );
            });

            // when
            dispatch(cold("ab", {
                    a: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_1}),
                    b: UiActions.refreshMapProjectState({id: SAMPLE_MAP_PROJECT_ID_2})
                })
            );

            // then
            expect(effects.refreshMapProjectState)
                .withContext("dispatched actions")
                .toBeObservable(cold("abcdef", {
                    a: UiActions.mapProjectStateUpdated({
                        id: SAMPLE_MAP_PROJECT_ID_1,
                        mapProjectState: MapProjectState.WAITING_FOR_RENDERING
                    }),
                    b: UiActions.mapProjectStateUpdated({
                        id: SAMPLE_MAP_PROJECT_ID_2,
                        mapProjectState: MapProjectState.WAITING_FOR_RENDERING
                    }),
                    c: UiActions.mapProjectStateUpdated({
                        id: SAMPLE_MAP_PROJECT_ID_1,
                        mapProjectState: MapProjectState.RENDERING
                    }),
                    d: UiActions.mapProjectStateUpdated({
                        id: SAMPLE_MAP_PROJECT_ID_2,
                        mapProjectState: MapProjectState.RENDERING
                    }),
                    e: UiActions.mapProjectStateUpdated({
                        id: SAMPLE_MAP_PROJECT_ID_1,
                        mapProjectState: stateAfterRendering
                    }),
                    f: UiActions.mapProjectStateUpdated({
                        id: SAMPLE_MAP_PROJECT_ID_2,
                        mapProjectState: stateAfterRendering
                    })
                }));
            expect(printmapsService.loadMapProjectState)
                .withContext("method printmapsService.loadMapProjectState()")
                .toHaveBeenCalledTimes(10);
        });
});