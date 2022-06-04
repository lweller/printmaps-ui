import {v4 as uuid} from "uuid";
import {
    AdditionalElementType,
    AdditionalGpxElement,
    AdditionalTextElement,
    AnyAdditionalElement
} from "../intern/additional-element";
import {AdditionalElementStyleType, FontStyle} from "../intern/additional-element-style";
import {MapProjectReference} from "../intern/map-project-reference";
import {MapProjectState} from "../intern/map-project-state";
import {MapProject} from "../intern/map-project";
import {Scale} from "../intern/scale";
import {FileFormat, MapStyle} from "../api/map-rendering-job-definition";

export const SAMPLE_COORDINATES = {latitude: 46, longitude: 12};

export const SAMPLE_APP_CONF = {
    defaultCoordinates: SAMPLE_COORDINATES
};

export const SAMPLE_ADDITIONAL_ELEMENT: AnyAdditionalElement = {
    id: uuid(),
    type: AdditionalElementType.TEXT_BOX,
    text: "Some Text...",
    location: {x: 50, y: 50},
    style: {
        type: AdditionalElementStyleType.TEXT,
        fontStyle: FontStyle.NORMAL,
        fontColor: {
            rgbHexValue: "#000000",
            opacity: 1
        },
        textOrientation: 0,
        fontSize: 12
    }
};

export const SAMPLE_MAP_PROJECT_ID_1 = uuid();

export const SAMPLE_MAP_PROJECT_REFERENCE_1: MapProjectReference = {
    id: SAMPLE_MAP_PROJECT_ID_1,
    name: "Test Project 1",
    state: MapProjectState.NOT_RENDERED
};

export const SAMPLE_MAP_PROJECT_1: MapProject = {
    ...SAMPLE_MAP_PROJECT_REFERENCE_1,
    center: SAMPLE_COORDINATES,
    widthInMm: 210,
    heightInMm: 297,
    topMarginInMm: 8,
    bottomMarginInMm: 8,
    leftMarginInMm: 8,
    rightMarginInMm: 8,
    scale: Scale.RATIO_1_25000,
    additionalElements: [],
    options: {
        fileFormat: FileFormat.PDF,
        mapStyle: MapStyle.OSM_CARTO_ELE20
    },
    modifiedLocally: false
};

export const SAMPLE_MAP_PROJECT_ID_2 = uuid();

export const SAMPLE_MAP_PROJECT_REFERENCE_2: MapProjectReference = {
    id: SAMPLE_MAP_PROJECT_ID_2,
    name: "Test Project 2",
    state: MapProjectState.NOT_RENDERED
};

export const SAMPLE_MAP_PROJECT_2: MapProject = {
    ...SAMPLE_MAP_PROJECT_REFERENCE_2,
    center: SAMPLE_COORDINATES,
    widthInMm: 210,
    heightInMm: 297,
    topMarginInMm: 8,
    bottomMarginInMm: 8,
    leftMarginInMm: 8,
    rightMarginInMm: 8,
    scale: Scale.RATIO_1_25000,
    additionalElements: [],
    options: {
        fileFormat: FileFormat.PDF,
        mapStyle: MapStyle.OSM_CARTO_ELE20
    },
    modifiedLocally: false
};

export const SAMPLE_ADDITIONAL_TEXT_ELEMENT: AdditionalTextElement = {
    id: uuid(),
    type: AdditionalElementType.TEXT_BOX,
    text: "Some Text...",
    location: {x: 50, y: 50},
    style: {
        type: AdditionalElementStyleType.TEXT,
        fontStyle: FontStyle.NORMAL,
        fontColor: {
            rgbHexValue: "#000000",
            opacity: 1
        },
        textOrientation: 0,
        fontSize: 12
    }
};

export const SAMPLE_ADDITIONAL_GPX_ELEMENT: AdditionalGpxElement = {
    id: uuid(),
    type: AdditionalElementType.GPX_TRACK,
    style: {
        type: AdditionalElementStyleType.TRACK,
        lineWidth: 2,
        lineColor: {
            rgbHexValue: "#000000",
            opacity: 1
        }
    },
    file: {
        name: "test-gpx",
        data: undefined,
        modified: 0
    }
};
