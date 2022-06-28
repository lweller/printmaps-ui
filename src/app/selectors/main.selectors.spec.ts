import {
    currentAdditionalElements,
    currentAdditionalGpxElements,
    currentMapProject,
    currentMapProjectCenter,
    currentMapProjectFormat,
    currentMapProjectGeneralProperties,
    currentMapProjectMargins,
    currentMapProjectScale,
    currentMapProjectSize,
    isCurrentMapProjectCopiable,
    isCurrentMapProjectDeletable,
    isCurrentMapProjectDownloadable,
    isCurrentMapProjectRenderable,
    isCurrentMapProjectSaved,
    mapProjectReferences,
    selectedAdditionalElementId,
    selectedMapCenter,
    selectedMapProjectReference
} from "./main.selectors";
import {initialState} from "../model/intern/printmaps-ui-state";
import {MapProjectState} from "../model/intern/map-project-state";
import {cases} from "jasmine-parameterized";
import {allValuesOf} from "../utils/common.util";
import {GeoCoordinates} from "../model/intern/geo-coordinates";
import {
    SAMPLE_ADDITIONAL_GPX_ELEMENT,
    SAMPLE_ADDITIONAL_TEXT_ELEMENT,
    SAMPLE_MAP_PROJECT_1,
    SAMPLE_MAP_PROJECT_2,
    SAMPLE_MAP_PROJECT_REFERENCE_1
} from "../model/test/test-data";
import {PaperFormat} from "../model/intern/paper-format";
import {PaperOrientation} from "../model/intern/paper-orientation";

const SAMPLE_GEO_COORDINATES: GeoCoordinates = {
    latitude: 46,
    longitude: 12
};

describe("mapProjectReferences", () => {
    it("should return undefined with initial state ", () => {
        // when
        let result = mapProjectReferences.projector(initialState);

        // then
        expect(result).toBeUndefined();
    });

    it("should return array of map project references when they have been loaded", () => {
        // when
        let result = mapProjectReferences.projector({
            ...initialState,
            mapProjectReferences: [SAMPLE_MAP_PROJECT_REFERENCE_1]
        });

        // then
        expect(result).toContain(SAMPLE_MAP_PROJECT_REFERENCE_1);
    });
});

describe("currentMapProject", () => {
    it("should return undefined with initial state ", () => {
        // when
        let result = currentMapProject.projector(initialState);

        // then
        expect(result).toBeUndefined();
    });

    it("should return current map project references when it as been defined", () => {
        // when
        let result = currentMapProject.projector({
            ...initialState,
            currentMapProject: SAMPLE_MAP_PROJECT_1
        });

        // then
        expect(result).toEqual(SAMPLE_MAP_PROJECT_1);
    });
});

describe("isCurrentMapProjectSaved", () => {
    it("should return false when current project is undefined", () => {
        // when
        let result = isCurrentMapProjectSaved.projector(undefined);

        // then
        expect(result).toBeFalse();
    });

    it("should return false project references when current project has no ID", () => {
        // when
        let result = isCurrentMapProjectSaved.projector({
            ...SAMPLE_MAP_PROJECT_1,
            id: undefined
        });

        // then
        expect(result).toEqual(false);
    });

    it("should return true project references when current project has an ID", () => {
        // when
        let result = isCurrentMapProjectSaved.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toBeTrue();
    });
});

describe("isCurrentMapProjectCopiable", () => {
    it("should be equal to isCurrentMapProjectSaved", () => {
        expect(isCurrentMapProjectCopiable).toBe(isCurrentMapProjectSaved);
    });
});

describe("isCurrentMapProjectDeletable", () => {
    it("should be equal to isCurrentMapProjectSaved", () => {
        expect(isCurrentMapProjectDeletable).toBe(isCurrentMapProjectSaved);
    });
});

describe("isCurrentMapProjectRenderable", () => {
    it("should return false when current project is undefined", () => {
        // when
        let result = isCurrentMapProjectRenderable.projector(undefined);

        // then
        expect(result).toBeFalse();
    });

    it("should return true project references when current project has is in state NOT_RENDERED", () => {
        // when
        let result = isCurrentMapProjectRenderable.projector({
            ...SAMPLE_MAP_PROJECT_1,
            state: MapProjectState.NOT_RENDERED
        });

        // then
        expect(result).toBeTrue();
    });

    cases(allValuesOf(MapProjectState).filter(state => state != MapProjectState.NOT_RENDERED))
        .it("should return false project references when current project has is not in state NOT_RENDERED", (state) => {
            // when
            let result = isCurrentMapProjectRenderable.projector({
                ...SAMPLE_MAP_PROJECT_1,
                state: state
            });

            // then
            expect(result).toEqual(false);
        });
});

describe("isCurrentMapProjectDownloadable", () => {
    it("should return false when current project is undefined", () => {
        // when
        let result = isCurrentMapProjectDownloadable.projector(undefined);

        // then
        expect(result).toBeFalse();
    });

    it("should return true project references when current project has is in state READY_FOR_DOWNLOAD", () => {
        // when
        let result = isCurrentMapProjectDownloadable.projector({
            ...SAMPLE_MAP_PROJECT_1,
            state: MapProjectState.READY_FOR_DOWNLOAD
        });

        // then
        expect(result).toBeTrue();
    });

    cases(allValuesOf(MapProjectState).filter(state => state != MapProjectState.READY_FOR_DOWNLOAD))
        .it("should return false project references when current project has is not in state READY_FOR_DOWNLOAD", (state) => {
            // when
            let result = isCurrentMapProjectDownloadable.projector({
                ...SAMPLE_MAP_PROJECT_1,
                state: state
            });

            // then
            expect(result).toBeFalse();
        });
});

describe("selectedMapProjectReference", () => {
    it("should return undefined when current project is undefined", () => {
        // when
        let result = selectedMapProjectReference.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return corresponding map project reference when current project is defined", () => {
        // when
        let result = selectedMapProjectReference.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual(SAMPLE_MAP_PROJECT_REFERENCE_1);
    });
});

describe("currentMapProjectGeneralProperties", () => {
    it("should return an undefined value when current project is undefined", () => {
        // when
        let result = currentMapProjectGeneralProperties.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return corresponding values when current project is defined", () => {
        // when
        let result = currentMapProjectGeneralProperties.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual({
            description: {
                name: SAMPLE_MAP_PROJECT_1.name
            },
            options: SAMPLE_MAP_PROJECT_1.options
        });
    });
});

describe("currentMapProjectCenter", () => {
    it("should return an undefined value when current project is undefined", () => {
        // when
        let result = currentMapProjectCenter.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return corresponding values when current project is defined", () => {
        // when
        let result = currentMapProjectCenter.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual(SAMPLE_MAP_PROJECT_1.center);
    });
});

describe("currentMapProjectFormat", () => {
    it("should return an undefined value when current project is undefined", () => {
        // when
        let result = currentMapProjectFormat.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return predefined paper size when current project is defined with corresponding width and height", () => {
        // when
        let result = currentMapProjectFormat.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual({
            format: PaperFormat.A4,
            orientation: PaperOrientation.PORTRAIT
        });
    });

    it("should return custom paper size when current project is defined with width and height not corresponding to a predefined size", () => {
        // when
        let result = currentMapProjectFormat.projector(SAMPLE_MAP_PROJECT_2);

        // then
        expect(result).toEqual({
            format: PaperFormat.CUSTOM,
            orientation: PaperOrientation.PORTRAIT
        });
    });

    it("should return portrait orientation when current project is defined with same width and height", () => {
        // when
        // noinspection JSSuspiciousNameCombination
        let result = currentMapProjectFormat.projector({
            ...SAMPLE_MAP_PROJECT_2,
            widthInMm: SAMPLE_MAP_PROJECT_2.widthInMm,
            heightInMm: SAMPLE_MAP_PROJECT_2.widthInMm
        });

        // then
        expect(result).toEqual({
            format: PaperFormat.CUSTOM,
            orientation: PaperOrientation.PORTRAIT
        });
    });

    it("should return landscape orientation when current project is defined with width greater than height", () => {
        // when
        // noinspection JSSuspiciousNameCombination
        let result = currentMapProjectFormat.projector({
            ...SAMPLE_MAP_PROJECT_2,
            widthInMm: SAMPLE_MAP_PROJECT_2.heightInMm,
            heightInMm: SAMPLE_MAP_PROJECT_2.widthInMm
        });

        // then
        expect(result).toEqual({
            format: PaperFormat.CUSTOM,
            orientation: PaperOrientation.LANDSCAPE
        });
    });
});

describe("currentMapProjectSize", () => {
    it("should return an undefined value when current project is undefined", () => {
        // when
        let result = currentMapProjectSize.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return corresponding values when current project is defined", () => {
        // when
        let result = currentMapProjectSize.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual({
            widthInMm: SAMPLE_MAP_PROJECT_1.widthInMm,
            heightInMm: SAMPLE_MAP_PROJECT_1.heightInMm
        });
    });
});

describe("currentMapProjectMargins", () => {
    it("should return an undefined value when current project is undefined", () => {
        // when
        let result = currentMapProjectMargins.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return corresponding values when current project is defined", () => {
        // when
        let result = currentMapProjectMargins.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual({
            topMarginInMm: SAMPLE_MAP_PROJECT_1.topMarginInMm,
            bottomMarginInMm: SAMPLE_MAP_PROJECT_1.bottomMarginInMm,
            leftMarginInMm: SAMPLE_MAP_PROJECT_1.leftMarginInMm,
            rightMarginInMm: SAMPLE_MAP_PROJECT_1.rightMarginInMm
        });
    });
});

describe("currentMapProjectScale", () => {
    it("should return an undefined value when current project is undefined", () => {
        // when
        let result = currentMapProjectScale.projector(undefined);

        // then
        expect(result).toBeUndefined();
    });

    it("should return corresponding values when current project is defined", () => {
        // when
        let result = currentMapProjectScale.projector(SAMPLE_MAP_PROJECT_1);

        // then
        expect(result).toEqual(SAMPLE_MAP_PROJECT_1.scale);
    });
});

describe("currentAdditionalElements", () => {
    it("should return an empty array when current project is undefined", () => {
        // when
        let result = currentAdditionalElements.projector(undefined);

        // then
        expect(result).toHaveSize(0);
    });

    it("should return array with additional elements when current project with some elements is defined", () => {
        // when
        let result = currentAdditionalElements.projector({
            ...SAMPLE_MAP_PROJECT_1,
            additionalElements: [SAMPLE_ADDITIONAL_TEXT_ELEMENT, SAMPLE_ADDITIONAL_GPX_ELEMENT]
        });

        // then
        expect(result).toEqual([SAMPLE_ADDITIONAL_TEXT_ELEMENT, SAMPLE_ADDITIONAL_GPX_ELEMENT]);
    });
});

describe("currentAdditionalGpxElements", () => {
    it("should return an empty array when currently no additional elements are available (i.e. it consists of an empty array)", () => {
        // when
        let result = currentAdditionalGpxElements.projector([]);

        // then
        expect(result).toHaveSize(0);
    });

    it("should return array containing only additional GPX track elements when current project with such elements is defined", () => {
        // when
        let result = currentAdditionalGpxElements.projector([SAMPLE_ADDITIONAL_TEXT_ELEMENT, SAMPLE_ADDITIONAL_GPX_ELEMENT]);

        // then
        expect(result).toEqual([SAMPLE_ADDITIONAL_GPX_ELEMENT]);
    });
});

describe("selectedAdditionalElementId", () => {
    it("should return undefined when no additional element is selected", () => {
        // when
        let result = selectedAdditionalElementId.projector(initialState);

        // then
        expect(result).toBeUndefined();
    });

    it("should return ID of selected additional element when an additional element is selected", () => {
        // when
        let result = selectedAdditionalElementId.projector({
            ...initialState,
            selectedAdditionalElementId: SAMPLE_ADDITIONAL_TEXT_ELEMENT.id
        });

        // then
        expect(result).toBe(SAMPLE_ADDITIONAL_TEXT_ELEMENT.id);
    });
});

describe("selectedMapCenter", () => {
    it("should return undefined when no map center has been defined", () => {
        // when
        let result = selectedMapCenter.projector(initialState);

        // then
        expect(result).toBeUndefined();
    });

    it("should return ID of selected additional element when a map center has been defined", () => {
        // when
        let result = selectedMapCenter.projector({
            ...initialState,
            mapCenter: SAMPLE_GEO_COORDINATES
        });

        // then
        expect(result).toBe(SAMPLE_GEO_COORDINATES);
    });
});