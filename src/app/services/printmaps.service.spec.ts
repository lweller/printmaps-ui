import {PrintmapsService} from "./printmaps.service";
import {ConfigurationService} from "./configuration.service";
import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ScaleService} from "./scale.service";
import {LOCALE_ID} from "@angular/core";
import {
    SAMPLE_ADDITIONAL_GPX_ELEMENT,
    SAMPLE_ADDITIONAL_GPX_ELEMENT_WITH_UNDEFINED_DATA,
    SAMPLE_COORDINATES_1,
    SAMPLE_MAP_JOB_RENDERING_STATE_1_NOT_RENDERED,
    SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERED,
    SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_LAUNCHED,
    SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_STARTED,
    SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_UNSUCCESSFUL,
    SAMPLE_MAP_PROJECT_1,
    SAMPLE_MAP_PROJECT_ID_1,
    SAMPLE_MAP_PROJECT_REFERENCE_1,
    SAMPLE_MAP_RENDERING_JOB_DEFINITION_1,
    SAMPLE_MAP_RENDERING_JOB_EXECUTION_1,
    SAMPLE_MODIFIED_MAP_PROJECT_1,
    SAMPLE_NEW_MAP_PROJECT_1
} from "../model/test/test-data";
import {AdditionalElementType} from "../model/intern/additional-element";
import {of, throwError} from "rxjs";
import {HttpClient, HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {DEFAULT_SCALE_STYLE, DEFAULT_TEXT_STYLE, DEFAULT_TRACK_STYLE} from "../model/intern/additional-element-style";
import {MapProjectState} from "../model/intern/map-project-state";
import {MapProjectConversionService} from "./map-project-conversion.service";

const BASE_API_URI = "http://api.example.com";

describe("PrintmapsService", () => {

    let printmapsService: PrintmapsService;

    let httpClient: HttpClient;
    let configurationService: ConfigurationService;
    let mapProjectConversionService: MapProjectConversionService;

    const NOW = new Date("1977-03-17 10:31:42");

    beforeEach(() => {
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(NOW));
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {provide: LOCALE_ID, useValue: "en-US"},
                PrintmapsService,
                {provide: ConfigurationService, useValue: new ConfigurationService(undefined)},
                {provide: MapProjectConversionService, useValue: new MapProjectConversionService()},
                {provide: ScaleService, useValue: new ScaleService()}
            ]
        });

        httpClient = TestBed.inject(HttpClient);

        printmapsService = TestBed.inject(PrintmapsService);

        configurationService = TestBed.inject(ConfigurationService);
        spyOnProperty(configurationService, "appConf", "get").and.returnValue({
            printmapsApiBaseUri: BASE_API_URI
        });

        mapProjectConversionService = TestBed.inject(MapProjectConversionService);
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    function normalMapProjectUpload() {
        spyOn(httpClient, "post").and.returnValue(of(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1));
        spyOn(mapProjectConversionService, "toMapRenderingJob").and.returnValue(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1);
        spyOn(printmapsService, "buildMapProject").and.returnValue(() => of(SAMPLE_MAP_PROJECT_1));
        spyOn(printmapsService, "uploadUserFile").and.returnValue(of(true));
    }

    it("should create a new map project centered on given coordinates with a default attribution element when createMapProject method is called", async () => {
        // given
        spyOn(printmapsService, "createOrUpdateMapRenderingJob").and.callFake(mapProject => of(mapProject));

        // when
        const mapProject = await printmapsService.createMapProject(SAMPLE_COORDINATES_1).toPromise();

        // then
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("printmapsService.createOrUpdateMapRenderingJob()")
            .toHaveBeenCalledTimes(1);
        expect(mapProject.id)
            .withContext("ID of freshly create mapProject")
            .toBeUndefined();
        expect(mapProject.modifiedLocally)
            .withContext("modifiedLocally of freshly create mapProject")
            .toBeTrue();
        expect(mapProject.name)
            .withContext("name of freshly create mapProject")
            .toEqual("New Map Project 3/17/1977, 10:31:42 AM");
        expect(mapProject.center)
            .withContext("center of freshly create mapProject")
            .toEqual(SAMPLE_COORDINATES_1);
        expect(mapProject.additionalElements)
            .withContext("additional elements of freshly create mapProject")
            .toHaveSize(1);
        expect(mapProject.additionalElements[0].type)
            .withContext("type of first additional elements of freshly create mapProject")
            .toBe(AdditionalElementType.ATTRIBUTION);
    });

    it("should create a new additional element TEXT_BOX at center of page for map project when createAdditionalElement method is called with type TEXT_BOX", () => {
        // when
        const additionalElement = printmapsService.createAdditionalElement(SAMPLE_MAP_PROJECT_1, AdditionalElementType.TEXT_BOX);

        // then
        expect(additionalElement)
            .withContext("additionalElement")
            .toEqual(jasmine.objectContaining({
                id: jasmine.any(String),
                type: AdditionalElementType.TEXT_BOX,
                text: "New Text Element",
                style: DEFAULT_TEXT_STYLE,
                location: {
                    x: 105,
                    y: 149
                }
            }));
    });

    it("should create a new additional element ATTRIBUTION at bottom left of page for map project when createAdditionalElement method is called with type ATTRIBUTION", () => {
        // when
        const additionalElement = printmapsService.createAdditionalElement(SAMPLE_MAP_PROJECT_1, AdditionalElementType.ATTRIBUTION);

        // then
        expect(additionalElement)
            .withContext("additionalElement")
            .toEqual(jasmine.objectContaining({
                id: jasmine.any(String),
                type: AdditionalElementType.ATTRIBUTION,
                text: "${attribution}",
                style: DEFAULT_TEXT_STYLE,
                location: {
                    x: 40,
                    y: 7
                }
            }));
    });

    it("should create a new additional element ATTRIBUTION at bottom right of page for map project when createAdditionalElement method is called with type SCALE", () => {
        // when
        const additionalElement = printmapsService.createAdditionalElement(SAMPLE_MAP_PROJECT_1, AdditionalElementType.SCALE);

        // then
        expect(additionalElement)
            .withContext("additionalElement")
            .toEqual(jasmine.objectContaining({
                id: jasmine.any(String),
                type: AdditionalElementType.SCALE,
                style: DEFAULT_SCALE_STYLE,
                location: {
                    x: 160,
                    y: 10
                }
            }));
    });

    it("should create a new additional element GPX_TRACK for map project when createAdditionalElement method is called with type GPX_TRACK", () => {
        // when
        const additionalElement = printmapsService.createAdditionalElement(SAMPLE_MAP_PROJECT_1, AdditionalElementType.GPX_TRACK);

        // then
        expect(additionalElement)
            .withContext("additionalElement")
            .toEqual(jasmine.objectContaining({
                id: jasmine.any(String),
                type: AdditionalElementType.GPX_TRACK,
                style: DEFAULT_TRACK_STYLE
            }));
    });

    it("should return undefined when createAdditionalElement method is called with an undefined type", () => {
        // when
        const additionalElement = printmapsService.createAdditionalElement(SAMPLE_MAP_PROJECT_1, undefined);

        // then
        expect(additionalElement)
            .withContext("additionalElement")
            .toBeUndefined();
    });

    it("should create a copy of map project with a name extended with copy when cloneMapProject method is called", async () => {
        // given
        spyOn(printmapsService, "createOrUpdateMapRenderingJob").and.callFake(mapProject => of(mapProject));

        // when
        const mapProject = await printmapsService.cloneMapProject(SAMPLE_MAP_PROJECT_1).toPromise();

        // then
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("printmapsService.createOrUpdateMapRenderingJob()")
            .toHaveBeenCalledTimes(1);
        expect(mapProject.id)
            .withContext("ID of freshly create mapProject")
            .toBeUndefined();
        expect(mapProject.modifiedLocally)
            .withContext("modifiedLocally of freshly create mapProject")
            .toBeTrue();
        expect(mapProject.name)
            .withContext("name of freshly create mapProject")
            .toMatch(/ \(copy\)$/);
    });

    it("should create a second copy of map project with a name extended with copy 2 when cloneMapProject method is called on an already cloned project (i.e. with name ending with copy)", async () => {
        // given
        spyOn(printmapsService, "createOrUpdateMapRenderingJob").and.callFake(mapProject => of(mapProject));

        // when
        const mapProject = await printmapsService.cloneMapProject({
            ...SAMPLE_MAP_PROJECT_1,
            name: SAMPLE_MAP_PROJECT_1 + " (copy)"
        }).toPromise();

        // then
        expect(printmapsService.createOrUpdateMapRenderingJob)
            .withContext("printmapsService.createOrUpdateMapRenderingJob()")
            .toHaveBeenCalledTimes(1);
        expect(mapProject.id)
            .withContext("ID of freshly create mapProject")
            .toBeUndefined();
        expect(mapProject.modifiedLocally)
            .withContext("modifiedLocally of freshly create mapProject")
            .toBeTrue();
        expect(mapProject.name)
            .withContext("name of freshly create mapProject")
            .toMatch(/ \(copy 2\)$/);
    });

    it("should post to /metadata a new map rendering job and return saved map project when createOrUpdateMapRenderingJob method is called with a freshly created map project (i.e. without any ID)", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(
                BASE_API_URI + "/metadata",
                SAMPLE_MAP_RENDERING_JOB_DEFINITION_1,
                jasmine.any(Object))
            .and.returnValue(of(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1));
        spyOn(mapProjectConversionService, "toMapRenderingJob")
            .withArgs(SAMPLE_NEW_MAP_PROJECT_1)
            .and.returnValue(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1);
        spyOn(printmapsService, "buildMapProject")
            .and.returnValue(() => of(SAMPLE_MAP_PROJECT_1));

        // when
        const mapProject = await printmapsService.createOrUpdateMapRenderingJob(SAMPLE_NEW_MAP_PROJECT_1).toPromise();

        // then
        expect(mapProject).withContext("mapProject").toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should post to /metadata/patch a map rendering job and return saved map project when createOrUpdateMapRenderingJob method is called with an already existing map project (i.e. with an ID)", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(
                BASE_API_URI + "/metadata/patch",
                SAMPLE_MAP_RENDERING_JOB_DEFINITION_1,
                jasmine.any(Object))
            .and.returnValue(of(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1));
        spyOn(mapProjectConversionService, "toMapRenderingJob")
            .withArgs(SAMPLE_MODIFIED_MAP_PROJECT_1)
            .and.returnValue(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1);
        spyOn(printmapsService, "buildMapProject")
            .and.returnValue(() => of(SAMPLE_MAP_PROJECT_1));

        // when
        const mapProject = await printmapsService.createOrUpdateMapRenderingJob(SAMPLE_MODIFIED_MAP_PROJECT_1).toPromise();

        // then
        expect(mapProject).withContext("mapProject").toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should upload user files when createOrUpdateMapRenderingJob method is called with an map project containing a GPX element with defined data", async () => {
        // given
        normalMapProjectUpload();

        // when
        await printmapsService.createOrUpdateMapRenderingJob({
            ...SAMPLE_MODIFIED_MAP_PROJECT_1,
            additionalElements: [SAMPLE_ADDITIONAL_GPX_ELEMENT]
        }).toPromise();

        // then
        expect(printmapsService.uploadUserFile)
            .withContext("PrintmapsService.uploadUserFile()")
            .toHaveBeenCalledOnceWith(SAMPLE_MAP_PROJECT_ID_1, "some data", "test.gpx");
    });

    it("should not upload user files when createOrUpdateMapRenderingJob method is called with an map project containing a GPX element with undefined data", async () => {
        // given
        normalMapProjectUpload();

        // when
        await printmapsService.createOrUpdateMapRenderingJob({
            ...SAMPLE_MODIFIED_MAP_PROJECT_1,
            additionalElements: [SAMPLE_ADDITIONAL_GPX_ELEMENT_WITH_UNDEFINED_DATA]
        }).toPromise();

        // then
        expect(printmapsService.uploadUserFile)
            .withContext("PrintmapsService.uploadUserFile()")
            .not.toHaveBeenCalled();
    });

    it("should return corresponding map project after loading state when buildMapProject is applied on a valid map rendering project", async () => {
        // given
        spyOn(mapProjectConversionService, "toMapProject")
            .withArgs(SAMPLE_MAP_PROJECT_1.name, SAMPLE_MAP_RENDERING_JOB_DEFINITION_1)
            .and.returnValue(SAMPLE_MAP_PROJECT_1);
        spyOn(printmapsService, "loadMapProjectState").and.returnValue(of(SAMPLE_MAP_PROJECT_1.state));

        // when
        const mapProject = await printmapsService.buildMapProject()(of([SAMPLE_MAP_RENDERING_JOB_DEFINITION_1, SAMPLE_MAP_PROJECT_1.name])).toPromise();

        // then
        expect(mapProject).withContext("mapProject").toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should return undefined when an error occurs while applying buildMapProject", async () => {
        // when
        const mapProject = await printmapsService.buildMapProject()(throwError(new HttpErrorResponse({status: 500}))).toPromise();

        // then
        expect(mapProject).withContext("mapProject").toBeUndefined();
    });

    it("should upload a single user file to /upload/<MAP_PROJECT_ID> when uploadUserFile method is called", async () => {
        // given
        const FILENAME = "test.txt";
        const DATA = new Blob(["some data"], {type: "text/plain"});
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", DATA, FILENAME);
        spyOn(httpClient, "post")
            .withArgs(
                BASE_API_URI + "/upload/" + SAMPLE_MAP_PROJECT_ID_1,
                FORM_DATA,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 201})));

        // when
        const result = await printmapsService.uploadUserFile(SAMPLE_MAP_PROJECT_ID_1, DATA, FILENAME).toPromise();

        // then
        expect(result).withContext("upload result").toBeTrue();
    });

    it("should upload a single user file to /upload/<MAP_PROJECT_ID> and return true when uploadUserFile method is called", async () => {
        // given
        const FILENAME = "test.txt";
        const DATA = new Blob(["some data"], {type: "text/plain"});
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", DATA, FILENAME);
        spyOn(httpClient, "post")
            .withArgs(
                BASE_API_URI + "/upload/" + SAMPLE_MAP_PROJECT_ID_1,
                FORM_DATA,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 201})));

        // when
        const result = await printmapsService.uploadUserFile(SAMPLE_MAP_PROJECT_ID_1, DATA, FILENAME).toPromise();

        // then
        expect(result).withContext("upload result").toBeTrue();
    });

    it("should return false when upload of a user file to /upload/<MAP_PROJECT_ID> returns a status different from 201", async () => {
        // given
        const FILENAME = "test.txt";
        const DATA = new Blob(["some data"], {type: "text/plain"});
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", DATA, FILENAME);
        spyOn(httpClient, "post")
            .withArgs(
                BASE_API_URI + "/upload/" + SAMPLE_MAP_PROJECT_ID_1,
                FORM_DATA,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 200})));

        // when
        const result = await printmapsService.uploadUserFile(SAMPLE_MAP_PROJECT_ID_1, DATA, FILENAME).toPromise();

        // then
        expect(result).withContext("upload result").toBeFalse();
    });

    it("should return false when upload of a user file to /upload/<MAP_PROJECT_ID> throws an exception", async () => {
        // given
        const FILENAME = "test.txt";
        const DATA = new Blob(["some data"], {type: "text/plain"});
        const FORM_DATA = new FormData();
        FORM_DATA.append("file", DATA, FILENAME);
        spyOn(httpClient, "post")
            .withArgs(
                BASE_API_URI + "/upload/" + SAMPLE_MAP_PROJECT_ID_1,
                FORM_DATA,
                jasmine.any(Object))
            .and.returnValue(throwError(new HttpErrorResponse({status: 500})));

        // when
        const result = await printmapsService.uploadUserFile(SAMPLE_MAP_PROJECT_ID_1, DATA, FILENAME).toPromise();

        // then
        expect(result).withContext("upload result").toBeFalse();
    });

    it("should get from /metadata/<MAP_PROJECT_ID> a map rendering job and return corresponding map project when loadMapProject method is called with the ID of an existing map project", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/metadata/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(of(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1));
        spyOn(printmapsService, "buildMapProject")
            .and.returnValue(() => of(SAMPLE_MAP_PROJECT_1));

        // when
        const mapProject = await printmapsService.loadMapProject(SAMPLE_MAP_PROJECT_REFERENCE_1).toPromise();

        // then
        expect(mapProject).withContext("mapProject").toEqual(SAMPLE_MAP_PROJECT_1);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return NOT_RENDERED when loadMapProjectState method is called and only MapMetadataWritten is defined in returned state", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(of(SAMPLE_MAP_JOB_RENDERING_STATE_1_NOT_RENDERED));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.NOT_RENDERED);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return WAITING_FOR_RENDERING when loadMapProjectState method is called and MapMetadataWritten and MapOrderSubmitted are defined in returned state", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(of(SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_LAUNCHED));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.WAITING_FOR_RENDERING);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return RENDERING when loadMapProjectState method is called and MapMetadataWritten, MapOrderSubmitted and MapBuildStarted are defined in returned state", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(of(SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_STARTED));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.RENDERING);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return READY_FOR_DOWNLOAD when loadMapProjectState method is called and MapMetadataWritten, MapOrderSubmitted, MapBuildStarted and MapBuildCompleted are defined and MapBuildSuccessful equals to yes in returned state", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(of(SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERED));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.READY_FOR_DOWNLOAD);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return RENDERING_UNSUCCESSFUL when loadMapProjectState method is called and MapMetadataWritten, MapOrderSubmitted, MapBuildStarted and MapBuildCompleted are defined and MapBuildSuccessful equals to no in returned state", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(of(SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_UNSUCCESSFUL));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.RENDERING_UNSUCCESSFUL);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return RENDERING_UNSUCCESSFUL when loadMapProjectState method is called and a http error with status not equal to 400 occurs", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(throwError(new HttpErrorResponse({status: 500})));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.RENDERING_UNSUCCESSFUL);
    });

    it("should get state from /mapstate/<MAP_PROJECT_ID> and return NONEXISTENT when loadMapProjectState method is called and a http error with status equal to 400 occurs", async () => {
        // given
        spyOn(httpClient, "get")
            .withArgs(BASE_API_URI + "/mapstate/" + SAMPLE_MAP_PROJECT_ID_1)
            .and.returnValue(throwError(new HttpErrorResponse({status: 400})));

        // when
        const state = await printmapsService.loadMapProjectState(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(state).withContext(state).toBe(MapProjectState.NONEXISTENT);
    });

    it("should post to /delete/<MAP_PROJECT_ID> and return true if status of http response is 204 when deleteMapRenderingJob method is called with the ID of an existing map project", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(BASE_API_URI + "/delete/" + SAMPLE_MAP_PROJECT_ID_1,
                undefined,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 204})));

        // when
        const result = await printmapsService.deleteMapRenderingJob(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of deletion").toBeTrue();
    });

    it("should post to /delete/<MAP_PROJECT_ID> and return false if status of http response is not 204 when deleteMapRenderingJob method is called with the ID of an existing map project", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(BASE_API_URI + "/delete/" + SAMPLE_MAP_PROJECT_ID_1,
                undefined,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 200})));

        // when
        const result = await printmapsService.deleteMapRenderingJob(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of deletion").toBeFalse();
    });

    it("should post to /delete/<MAP_PROJECT_ID> and return false if an error occurs when deleteMapRenderingJob method is called and a http error occurs", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(BASE_API_URI + "/delete/" + SAMPLE_MAP_PROJECT_ID_1,
                undefined,
                jasmine.any(Object))
            .and.returnValue(throwError(new HttpErrorResponse({status: 400})));

        // when
        const result = await printmapsService.deleteMapRenderingJob(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of deletion").toBeTrue();
    });

    it("should map rendering job execution post to /mapfile and return true if status of http response is 202 when launchMapRenderingJob method is called with the ID of an existing map project", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(BASE_API_URI + "/mapfile",
                SAMPLE_MAP_RENDERING_JOB_EXECUTION_1,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 202, body: SAMPLE_MAP_RENDERING_JOB_DEFINITION_1})));

        // when
        const result = await printmapsService.launchMapRenderingJob(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of launch").toBeTrue();
    });

    it("should map rendering job execution post to /mapfile and return true if status of http response is not 202 when launchMapRenderingJob method is called with the ID of an existing map project", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(BASE_API_URI + "/mapfile",
                SAMPLE_MAP_RENDERING_JOB_EXECUTION_1,
                jasmine.any(Object))
            .and.returnValue(of(new HttpResponse({status: 200, body: SAMPLE_MAP_RENDERING_JOB_DEFINITION_1})));

        // when
        const result = await printmapsService.launchMapRenderingJob(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of launch").toBeFalse();
    });

    it("should map rendering job execution post to /mapfile and return true if an error occurs when launchMapRenderingJob method is called with the ID of an existing map project", async () => {
        // given
        spyOn(httpClient, "post")
            .withArgs(BASE_API_URI + "/mapfile",
                SAMPLE_MAP_RENDERING_JOB_EXECUTION_1,
                jasmine.any(Object))
            .and.returnValue(throwError(new HttpErrorResponse({status: 500})));

        // when
        const result = await printmapsService.launchMapRenderingJob(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of launch").toBeFalse();
    });

    it("should open /mapfile/<MAP_PROJECT_ID> in a new window and return true when downloadRenderedMapFile method is called with the ID of an existing map project", async () => {
        // given
        spyOn(window, "open").withArgs(BASE_API_URI + "/mapfile/" + SAMPLE_MAP_PROJECT_ID_1, "_self");

        // when
        const result = await printmapsService.downloadRenderedMapFile(SAMPLE_MAP_PROJECT_ID_1).toPromise();

        // then
        expect(result).withContext("result of download").toBeTrue();
    });
});