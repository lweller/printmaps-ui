import {PrintLocation} from "./print-location";
import {UserObject} from "../api/user-object";
import {
    ADDITIONAL_ELEMENT_TYPE_STYLES,
    AdditionalElementStyle,
    AdditionalElementTextStyle
} from "./additional-element-style";
import {TemplateService} from "../../services/template-service";
import {MapProject} from "./map-project";
import {Ordered} from "../../utils/common.util";

export interface AdditionalElement {
    readonly  type: AdditionalElementType;
    id: string,
    style: AdditionalElementStyle;
}

export interface AdditionalTextElement extends AdditionalElement {
    text: string;
    style: AdditionalElementTextStyle;
    location: PrintLocation;
}

export interface AdditionalScaleElement extends AdditionalElement {
    location: PrintLocation;
}

export type AnyAdditionalElement = AdditionalTextElement | AdditionalScaleElement;

export enum AdditionalElementType {
    TEXT_BOX = "text-box",
    GPX_TRACK = "gpx-track",
    SCALE = "scale",
    ATTRIBUTION = "attribution"
}

export class AdditionalElementTypeProperties implements Ordered {
    constructor(public readonly label: string,
                public readonly order: number,
                public readonly disabled: boolean,
                public toUserObject: (templateService: TemplateService, mapProject: MapProject, AdditionalElement: AdditionalElement) => UserObject
    ) {
    }

    public toString(): string {
        return this.label;
    }
}

export const ADDITIONAL_ELEMENT_TYPES = new Map<AdditionalElementType, AdditionalElementTypeProperties>([
    [AdditionalElementType.TEXT_BOX,
        new AdditionalElementTypeProperties(
            $localize`Text Box`,
            1,
            false,
            convertAdditionalElementToUserObject
        )
    ],
    [AdditionalElementType.ATTRIBUTION,
        new AdditionalElementTypeProperties(
            $localize`Attribution`,
            2,
            false,
            convertAdditionalElementToUserObject
        )
    ],
    [AdditionalElementType.SCALE,
        new AdditionalElementTypeProperties(
            $localize`Scale`,
            3,
            false,
            convertAdditionalElementToUserObject
        )
    ],
    [AdditionalElementType.GPX_TRACK,
        new AdditionalElementTypeProperties(
            $localize`GPX Track`,
            4,
            true,
            undefined
        )
    ]
]);

function convertAdditionalElementToUserObject(templateService: TemplateService, mapProject: MapProject, element: AdditionalTextElement): UserObject {
    return {
        Style: ADDITIONAL_ELEMENT_TYPE_STYLES.get(element.style.type).toSymbolizer(templateService, mapProject, element),
        WellKnownText: `POINT(${element.location.x} ${element.location.y})`
    };
}