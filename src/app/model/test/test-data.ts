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
import {
    FileFormat,
    MapRenderingJobDefinition,
    MapRenderingJobExecution,
    MapStyle
} from "../api/map-rendering-job-definition";
import {MapRenderingJobState} from "../api/map-rendering-job-state";

export const SAMPLE_COORDINATES_1 = {latitude: 46, longitude: 12};
export const SAMPLE_COORDINATES_1_UPDATED = {latitude: 46.01, longitude: 12.02};
export const SAMPLE_COORDINATES_1_UPDATED_MAX_NORTH = {latitude: 85, longitude: 12};
export const SAMPLE_COORDINATES_1_UPDATED_TOO_MUCH_NORTH = {latitude: 88, longitude: 12};
export const SAMPLE_COORDINATES_1_UPDATED_MAX_SOUTH = {latitude: -85, longitude: 12};
export const SAMPLE_COORDINATES_1_UPDATED_TOO_MUCH_SOUTH = {latitude: -88, longitude: 12};
export const SAMPLE_COORDINATES_1_UPDATED_OVER_PRECISE = {latitude: 46.0000000001, longitude: 12.0000000001};


export const SAMPLE_APP_CONF = {
    defaultCoordinates: SAMPLE_COORDINATES_1
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
    center: SAMPLE_COORDINATES_1,
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

export const SAMPLE_MODIFIED_MAP_PROJECT_1: MapProject = {
    ...SAMPLE_MAP_PROJECT_1,
    modifiedLocally: true
};

export const SAMPLE_NEW_MAP_PROJECT_1: MapProject = {
    ...SAMPLE_MODIFIED_MAP_PROJECT_1,
    id: undefined
};

export const SAMPLE_MARGIN_ELEMENT_ID = uuid();

export const SAMPLE_MAP_RENDERING_JOB_DEFINITION_1: MapRenderingJobDefinition = {
    Data: {
        Type: "maps",
        ID: SAMPLE_MAP_PROJECT_ID_1,
        Attributes: {
            Fileformat: FileFormat.PDF,
            Style: MapStyle.OSM_CARTO_ELE20,
            Projection: "3857",
            Scale: 25000,
            Latitude: 46,
            Longitude: 12,
            PrintWidth: 210,
            PrintHeight: 297,
            HideLayers: "",
            UserObjects: [{
                Style: "<!--{\"ID\":\"" + SAMPLE_MARGIN_ELEMENT_ID + "\",\"Type\":\"margins\"}--><PolygonSymbolizer fill='white' fill-opacity='1.0' />",
                WellKnownText: "POLYGON((0 0, 0 297, 210 297, 210 0, 0 0), (8 8, 8 289, 202 289, 202 8, 8 8))"
            }]
        }
    }
};

export const SAMPLE_MAP_RENDERING_JOB_EXECUTION_1: MapRenderingJobExecution = {
    Data: {
        Type: "maps",
        ID: SAMPLE_MAP_PROJECT_ID_1
    }
};

export const SAMPLE_MAP_JOB_RENDERING_STATE_1_NOT_RENDERED: MapRenderingJobState = {
    Data: {
        Type: "maps",
        ID: SAMPLE_MAP_PROJECT_ID_1,
        Attributes: {
            MapMetadataWritten: "2018-12-03T11:05:58+01:00",
            MapOrderSubmitted: "",
            MapBuildStarted: "",
            MapBuildCompleted: "",
            MapBuildSuccessful: "no",
            MapBuildMessage: "",
            MapBuildBoxMillimeter: undefined,
            MapBuildBoxPixel: undefined,
            MapBuildBoxProjection: undefined,
            MapBuildBoxWGS84: undefined
        }
    }
};

export const SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_LAUNCHED: MapRenderingJobState = {
    Data: {
        ...SAMPLE_MAP_JOB_RENDERING_STATE_1_NOT_RENDERED.Data,
        Attributes: {
            ...SAMPLE_MAP_JOB_RENDERING_STATE_1_NOT_RENDERED.Data.Attributes,
            MapOrderSubmitted: "2018-12-03T11:06:35+01:00"
        }
    }
};

export const SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_STARTED: MapRenderingJobState = {
    Data: {
        ...SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_LAUNCHED.Data,
        Attributes: {
            ...SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_LAUNCHED.Data.Attributes,
            MapBuildStarted: "2018-12-03T11:06:37+01:00"
        }
    }
};

export const SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERED: MapRenderingJobState = {
    Data: {
        ...SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_STARTED.Data,
        Attributes: {
            ...SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_STARTED.Data.Attributes,
            MapBuildCompleted: "2018-12-03T11:06:46+01:00",
            MapBuildSuccessful: "yes"
        }
    }
};

export const SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERING_UNSUCCESSFUL: MapRenderingJobState = {
    Data: {
        ...SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERED.Data,
        Attributes: {
            ...SAMPLE_MAP_JOB_RENDERING_STATE_1_RENDERED.Data.Attributes,
            MapBuildSuccessful: "no"
        }
    }
};

export const SAMPLE_MAP_PROJECT_ID_2 = uuid();

export const SAMPLE_MAP_PROJECT_REFERENCE_2: MapProjectReference = {
    id: SAMPLE_MAP_PROJECT_ID_2,
    name: "Test Project 2",
    state: MapProjectState.NOT_RENDERED
};

export const SAMPLE_MAP_PROJECT_2: MapProject = {
    ...SAMPLE_MAP_PROJECT_REFERENCE_2,
    center: SAMPLE_COORDINATES_1,
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
        name: "test.gpx",
        data: "some data",
        modified: 0
    }
};

export const SAMPLE_ADDITIONAL_GPX_ELEMENT_WITH_UNDEFINED_DATA: AdditionalGpxElement = {
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
        name: "test.gpx",
        data: undefined,
        modified: 0
    }
};
