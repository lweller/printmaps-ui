import {TestBed} from "@angular/core/testing";
import {PrintmapsService} from "./printmaps.service";
import {
    CURRENT_SCHEMA_VERSION,
    INCOMPATIBLE_SCHEMA_ERROR,
    INVALID_DATA_ERROR,
    MAP_PROJECT_REFERENCES,
    MapProjectReferenceService,
    SCHEMA_VERSION
} from "./map-project-reference.service";
import {SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2} from "../model/test/test-data";
import {MapProjectState} from "../model/intern/map-project-state";
import {of} from "rxjs";
import {cold} from "jasmine-marbles";

describe("MapProjectReferenceService", () => {

    let mapProjectReferenceService: MapProjectReferenceService;

    let printmapsService: PrintmapsService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MapProjectReferenceService,
                {
                    provide: PrintmapsService,
                    useValue: new PrintmapsService(undefined, undefined, undefined, undefined, undefined)
                }
            ]
        });

        mapProjectReferenceService = TestBed.inject(MapProjectReferenceService);
        printmapsService = TestBed.inject(PrintmapsService);
    });

    it("should set schema version and return any empty array when map project references are loaded in a fresh browser (i.e. where nothing has been stored before)", async () => {
        // given
        spyOn(localStorage, "getItem").withArgs(SCHEMA_VERSION)
            .and.returnValue(null)
            .withArgs(MAP_PROJECT_REFERENCES)
            .and.returnValue(null);
        spyOn(localStorage, "setItem");

        // when
        const mapProjectReferences = await mapProjectReferenceService.loadMapProjectReferences().toPromise();

        // then
        expect(mapProjectReferences)
            .withContext("loaded map project references")
            .toEqual([]);
        expect(localStorage.setItem)
            .withContext("setItem of localStorage")
            .toHaveBeenCalledOnceWith(SCHEMA_VERSION, JSON.stringify(CURRENT_SCHEMA_VERSION));
    });

    it("should not update schema return any array with references when map project references are loaded in browser in where references hav been stores previously wich a compatible schema version", async () => {
        // given
        spyOn(localStorage, "getItem").withArgs(SCHEMA_VERSION)
            .and.returnValue(JSON.stringify(1))
            .withArgs(MAP_PROJECT_REFERENCES)
            .and.returnValue(JSON.stringify([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]));
        spyOn(localStorage, "setItem");
        spyOn(printmapsService, "loadMapProjectState")
            .and.returnValue(of(MapProjectState.NOT_RENDERED));

        // when
        const mapProjectReferences = await mapProjectReferenceService.loadMapProjectReferences().toPromise();

        // then
        expect(mapProjectReferences)
            .withContext("loaded map project references")
            .toEqual([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        expect(localStorage.setItem)
            .withContext("setItem of localStorage")
            .not.toHaveBeenCalled();
    });

    it("should update map project state when it has changed outside of Printmaps UI", async () => {
        // given
        spyOn(localStorage, "getItem").withArgs(SCHEMA_VERSION)
            .and.returnValue(CURRENT_SCHEMA_VERSION.toString())
            .withArgs(MAP_PROJECT_REFERENCES)
            .and.returnValue(JSON.stringify([SAMPLE_MAP_PROJECT_REFERENCE_1]));
        spyOn(printmapsService, "loadMapProjectState")
            .and.returnValue(of(MapProjectState.RENDERING));

        // when
        const mapProjectReferences = await mapProjectReferenceService.loadMapProjectReferences().toPromise();

        // then
        expect(mapProjectReferences)
            .withContext("loaded map project references")
            .toEqual([{
                ...SAMPLE_MAP_PROJECT_REFERENCE_1,
                state: MapProjectState.RENDERING
            }]);
    });

    it("should reset local data and throw an exception when schema version is not compatible", async () => {
        // given
        spyOn(localStorage, "getItem").withArgs(SCHEMA_VERSION)
            .and.returnValue("999")
            .withArgs(MAP_PROJECT_REFERENCES)
            .and.returnValue(JSON.stringify([SAMPLE_MAP_PROJECT_REFERENCE_1]));
        spyOn(mapProjectReferenceService, "resetLocalStore");

        // when
        const result = mapProjectReferenceService.loadMapProjectReferences();

        // then
        expect(result)
            .withContext("execution of loadMapProjectReferences")
            .toBeObservable(cold("#", undefined, INCOMPATIBLE_SCHEMA_ERROR));
        expect(mapProjectReferenceService.resetLocalStore)
            .withContext("resetLocalStore")
            .toHaveBeenCalled();
    });

    it("should reset local data and throw an exception when an error ossurs while loading map project references", async () => {
        // given
        spyOn(localStorage, "getItem").withArgs(SCHEMA_VERSION)
            .and.returnValue(JSON.stringify(CURRENT_SCHEMA_VERSION))
            .withArgs(MAP_PROJECT_REFERENCES)
            .and.returnValue("{invalid");
        spyOn(mapProjectReferenceService, "resetLocalStore");

        // when
        const result = mapProjectReferenceService.loadMapProjectReferences();

        // then
        expect(result)
            .withContext("execution of loadMapProjectReferences")
            .toBeObservable(cold("#", undefined, INVALID_DATA_ERROR));
        expect(mapProjectReferenceService.resetLocalStore)
            .withContext("resetLocalStore")
            .toHaveBeenCalled();
    });

    it("should initialise schema version and save map project references when saving for the first time", async () => {
        // given
        spyOn(localStorage, "setItem");

        // when
        const result = await mapProjectReferenceService.saveMapProjectReferences([SAMPLE_MAP_PROJECT_REFERENCE_1]).toPromise();

        // then
        expect(result).withContext("result").toBeTrue();
        expect(localStorage.setItem)
            .withContext("setItem of localStorage")
            .toHaveBeenCalledWith(SCHEMA_VERSION, CURRENT_SCHEMA_VERSION.toString());
        expect(localStorage.setItem)
            .withContext("setItem of localStorage")
            .toHaveBeenCalledWith(MAP_PROJECT_REFERENCES, JSON.stringify([SAMPLE_MAP_PROJECT_REFERENCE_1]));
    });

    it("should reset schema version and delete stored map project referrences", () => {
        spyOn(localStorage, "clear");

        // when
        mapProjectReferenceService.resetLocalStore();

        // then
        expect(localStorage.clear)
            .withContext("clear localStorage")
            .toHaveBeenCalledOnceWith();
    });
});