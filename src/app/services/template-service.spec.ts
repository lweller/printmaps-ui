import {TemplateService} from "./template-service";
import {MapProjectState} from "../model/intern/map-project-state";
import {Scale} from "../model/intern/scale";
import {FileFormat, MapStyle} from "../model/api/map-rendering-job-definition";
import {cases} from "jasmine-parameterized";

describe("TemplateService", () => {

    let mapProject = {
        id: undefined,
        name: "test project",
        modifiedLocally: true,
        state: MapProjectState.NOT_RENDERED,
        center: {longitude: 12, latitude: 46},
        widthInMm: 210,
        heightInMm: 297,
        topMarginInMm: 8,
        bottomMarginInMm: 8,
        leftMarginInMm: 8,
        rightMarginInMm: 8,
        scale: Scale.RATIO_1_50000,
        options: {
            fileFormat: FileFormat.PNG,
            mapStyle: MapStyle.OSM_CARTO
        },
        additionalElements: []
    };

    let service: TemplateService;

    beforeEach(() => {
        service = new TemplateService();
    });

    cases([
        {template: "${project_name}", result: "test project"},
        {template: "${attribution}", result: "© OpenStreetMap contributors (ODbL)"},
        {template: "${not_existent}", result: "${not_existent}"}
    ])
        .it("should resolve variable values when template is compiled", (data) => {
            expect(service.compile(mapProject, data.template)).toBe(data.result);
        });
});