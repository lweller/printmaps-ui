import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {MapProjectConversionService} from "./map-project-conversion.service";
import {
    SAMPLE_ADDITIONAL_ATTRIBUTION_ELEMENT,
    SAMPLE_ADDITIONAL_GPX_ELEMENT,
    SAMPLE_ADDITIONAL_SCALE_ELEMENT,
    SAMPLE_ADDITIONAL_TEXT_ELEMENT,
    SAMPLE_ATTRIBUTION,
    SAMPLE_ATTRIBUTION_USER_OBJECT,
    SAMPLE_GPX_TRACK_USER_OBJECT,
    SAMPLE_MAP_PROJECT_1,
    SAMPLE_MAP_RENDERING_JOB_DEFINITION_1,
    SAMPLE_MARGIN_ELEMENT_ID,
    SAMPLE_MARGIN_USER_OBJECT,
    SAMPLE_SCALE_USER_OBJECT,
    SAMPLE_TEXT_BOX_USER_OBJECT
} from "../model/test/test-data";
import {cases} from "jasmine-parameterized";

describe("MapProjectConversionService", () => {

    let mapProjectConversionService: MapProjectConversionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MapProjectConversionService]
        });

        mapProjectConversionService = TestBed.inject(MapProjectConversionService);
    });

    it("should convert a map proect to a map rendering job suitable for upload to backend", () => {
        // given
        spyOn(MapProjectConversionService, "generateAdditionalElementId")
            .and.returnValue(SAMPLE_MARGIN_ELEMENT_ID);

        // when
        const mapRenderingJob = mapProjectConversionService.toMapRenderingJob(SAMPLE_MAP_PROJECT_1);

        // then
        expect(mapRenderingJob)
            .withContext("converted map rendering job")
            .toEqual(SAMPLE_MAP_RENDERING_JOB_DEFINITION_1);
    });

    it("should enfrce the following order while converting additional elements to user objects: first GX tracks, then margins and finally the other elements", () => {
        // given
        spyOn(MapProjectConversionService, "generateAdditionalElementId")
            .and.returnValue(SAMPLE_MARGIN_ELEMENT_ID);
        spyOn(mapProjectConversionService, "compileTextTemplate")
            .and.callFake((_, text) => text)
            .withArgs(jasmine.any(Object), "${attribution}")
            .and.returnValue(SAMPLE_ATTRIBUTION);

        // when
        const mapRenderingJob = mapProjectConversionService.toMapRenderingJob({
            ...SAMPLE_MAP_PROJECT_1,
            additionalElements: [
                SAMPLE_ADDITIONAL_ATTRIBUTION_ELEMENT,
                SAMPLE_ADDITIONAL_SCALE_ELEMENT,
                SAMPLE_ADDITIONAL_TEXT_ELEMENT,
                SAMPLE_ADDITIONAL_GPX_ELEMENT
            ]
        });

        // then
        expect(mapRenderingJob.Data.Attributes.UserObjects)
            .withContext("converted map rendering job")
            .toEqual([
                    SAMPLE_GPX_TRACK_USER_OBJECT,
                    SAMPLE_MARGIN_USER_OBJECT,
                    SAMPLE_ATTRIBUTION_USER_OBJECT,
                    SAMPLE_SCALE_USER_OBJECT,
                    SAMPLE_TEXT_BOX_USER_OBJECT
                ]
            );
    });

    cases([
        {template: "${project_name}", result: SAMPLE_MAP_PROJECT_1.name},
        {
            template: "${attribution}",
            result: "© OpenStreetMap contributors (ODbL), © opensnowmap.org (based on ASTER GDEM, SRTM, EU-DEM)"
        },
        {template: "${not_existent}", result: "${not_existent}"}
    ])
        .it("should resolve variable values when text template is compiled", (data) => {
            expect(mapProjectConversionService.compileTextTemplate(SAMPLE_MAP_PROJECT_1, data.template)).toBe(data.result);
        });
});