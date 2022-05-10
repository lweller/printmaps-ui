import {AdditionalElement, AdditionalTextElement} from "./additional-element";
import {FontStyle} from "../../components/font-style-selector/font-style-selector.component";
import {Color} from "../../components/color-selector/color-selector.component";
import {UserObjectMetadata} from "../api/user-object-metadata";
import {TemplateService} from "../../services/template-service";
import {MapProject} from "./map-project";

export interface AdditionalElementStyle {
    readonly type: AdditionalElementStyleType;
}

export interface AdditionalElementTextStyle extends AdditionalElementStyle {
    fontStyle: FontStyle;
    fontSize: number;
    fontColor: Color;
    textOrientation: number;
}

export enum AdditionalElementStyleType {
    TEXT = "text"
}

export class AdditionalElementStyleTypeProperties {
    constructor(public toSymbolizer: (templateService: TemplateService, mapProject: MapProject, element: AdditionalElement) => string) {
    }
}

export const ADDITIONAL_ELEMENT_TYPE_STYLES = new Map<AdditionalElementStyleType, AdditionalElementStyleTypeProperties>([
    [
        AdditionalElementStyleType.TEXT,
        new AdditionalElementStyleTypeProperties(convertAdditionalTextElementToSymbolizer)
    ]
]);

function convertAdditionalTextElementToSymbolizer(templateService: TemplateService, mapProject: MapProject, element: AdditionalTextElement): string {
    let metadata: UserObjectMetadata = {
        ID: element.id,
        Type: element.type,
        Text: element.text
    };
    return `<!--${JSON.stringify(metadata)}--><TextSymbolizer fontset-name='${FONTSET_NAME_BY_FONT_STYLE.get(element.style.fontStyle)}' size='${element.style.fontSize}' fill='${element.style.fontColor.rgbHexValue}' opacity='${element.style.fontColor.opacity}' orientation='${element.style.textOrientation}' allow-overlap='true'>'${templateService.compile(mapProject, element.text)}'</TextSymbolizer>`;
}

export const FONT_STYLE_BY_FONTSET_NAME = new Map<string, FontStyle>([
    ["fontset-0", FontStyle.NORMAL],
    ["fontset-1", FontStyle.ITALIC],
    ["fontset-2", FontStyle.BOLD]
]);

export const FONTSET_NAME_BY_FONT_STYLE = new Map<FontStyle, string>([
    [FontStyle.NORMAL, "fontset-0"],
    [FontStyle.ITALIC, "fontset-1"],
    [FontStyle.BOLD, "fontset-2"]
]);

export const DEFAULT_TEXT_STYLE: AdditionalElementTextStyle = {
    type: AdditionalElementStyleType.TEXT,
    fontSize: 10,
    fontStyle: FontStyle.NORMAL,
    fontColor: {
        rgbHexValue: "#000000",
        opacity: 1
    },
    textOrientation: 0
};