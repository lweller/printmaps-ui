import {v4 as uuid} from "uuid";
import {Injectable} from "@angular/core";
import {MapProject} from "../model/intern/map-project";
import {MapRenderingJobDefinition, MapStyle} from "../model/api/map-rendering-job-definition";
import {
    ADDITIONAL_ELEMENT_TYPES,
    AdditionalElementType,
    AdditionalGpxElement,
    AdditionalScaleElement,
    AdditionalTextElement,
    AnyAdditionalElement
} from "../model/intern/additional-element";
import {fromReductionFactor} from "../model/intern/scale";
import {UserObject} from "../model/api/user-object";
import {UserObjectMetadata} from "../model/api/user-object-metadata";
import {template} from "lodash";
import {
    AdditionalElementStyleType,
    DEFAULT_SCALE_STYLE,
    DEFAULT_TEXT_STYLE,
    DEFAULT_TRACK_STYLE,
    FONT_STYLE_BY_FONTSET_NAME
} from "../model/intern/additional-element-style";
import {parse} from "wellknown";

export interface TemplateCompiler {
    compileTextTemplate(mapProject: MapProject, text: string): string;
}

const DEFAULT_OSM_COPYRIGHT = "© OpenStreetMap contributors (ODbL)";
const NO_COPY_RIGHT = "no copy right";
const MAP_STYLES_COPY_RIGHTS = new Map<MapStyle, string>([
    [MapStyle.OSM_CARTO, DEFAULT_OSM_COPYRIGHT],
    [MapStyle.OSM_CARTO_MONO, DEFAULT_OSM_COPYRIGHT],
    [MapStyle.OSM_CARTO_ELE20, DEFAULT_OSM_COPYRIGHT + ", © opensnowmap.org (based on ASTER GDEM, SRTM, EU-DEM)"],
    [MapStyle.SCHWARZPLAN, DEFAULT_OSM_COPYRIGHT],
    [MapStyle.SCHWARZPLAN_PLUS, DEFAULT_OSM_COPYRIGHT],
    [MapStyle.RASTER10, NO_COPY_RIGHT],
    [MapStyle.TRANSPARENT, NO_COPY_RIGHT]
]);

@Injectable()
export class MapProjectConversionService implements TemplateCompiler {

    toMapProject(name: string, mapRenderingJob: MapRenderingJobDefinition): MapProject {
        let data = mapRenderingJob.Data;
        let attributes = data.Attributes;
        let margins = mapRenderingJob.Data.Attributes.UserObjects
            .map(userObject => MapProjectConversionService.extractMargins(userObject))
            .filter(element => !!element)[0];
        return {
            id: data.ID,
            name: name,
            state: undefined,
            scale: fromReductionFactor(attributes.Scale),
            center: {latitude: attributes.Latitude, longitude: attributes.Longitude},
            widthInMm: attributes.PrintWidth,
            heightInMm: attributes.PrintHeight,
            topMarginInMm: margins?.top ?? 8,
            bottomMarginInMm: margins?.bottom ?? 8,
            leftMarginInMm: margins?.left ?? 8,
            rightMarginInMm: margins?.right ?? 8,
            options: {
                fileFormat: attributes.Fileformat,
                mapStyle: attributes.Style
            },
            additionalElements: mapRenderingJob.Data.Attributes.UserObjects
                .map(userObject => MapProjectConversionService.convertUserObjectToAdditionalElement(userObject))
                .filter(additionalElement => !!additionalElement),
            modifiedLocally: false
        };
    }

    toMapRenderingJob(mapProject: MapProject): MapRenderingJobDefinition {
        let gpxTracks = mapProject.additionalElements
            .filter(element => element.type == AdditionalElementType.GPX_TRACK)
            .map(element => ADDITIONAL_ELEMENT_TYPES.get(element.type)
                .toUserObject(this, mapProject, element));
        let otherAdditionalElementUserObjects = mapProject.additionalElements
            .filter(element => element.type != AdditionalElementType.GPX_TRACK)
            .map(element => ADDITIONAL_ELEMENT_TYPES.get(element.type)
                .toUserObject(this, mapProject, element));
        return {
            Data: {
                Type: "maps",
                ID: mapProject.id,
                Attributes: {
                    Fileformat: mapProject.options.fileFormat,
                    Style: mapProject.options.mapStyle,
                    Projection: "3857",
                    Scale: mapProject.scale,
                    Latitude: mapProject.center.latitude,
                    Longitude: mapProject.center.longitude,
                    PrintWidth: mapProject.widthInMm,
                    PrintHeight: mapProject.heightInMm,
                    HideLayers: "",
                    UserObjects: [
                        ...gpxTracks,
                        MapProjectConversionService.generateMargins(mapProject),
                        ...otherAdditionalElementUserObjects
                    ]
                }
            }
        };
    }

    compileTextTemplate(mapProject: MapProject, text: string): string {
        let parameters = {
            project_name: mapProject.name,
            attribution: MAP_STYLES_COPY_RIGHTS.get(mapProject.options.mapStyle)
        };
        try {
            return template(text)(parameters);
        } catch (error) {
            return text;
        }
    }

    static generateAdditionalElementId(): string {
        return uuid();
    }

    private static generateMargins(mapProject: MapProject): UserObject {
        let metadata: UserObjectMetadata = {
            ID: MapProjectConversionService.generateAdditionalElementId(),
            Type: "margins",
            Text: undefined
        };
        let outerWidth = mapProject.widthInMm;
        let outerHeight = mapProject.heightInMm;
        let innerWidth1 = mapProject.leftMarginInMm;
        let innerWidth2 = mapProject.widthInMm - mapProject.rightMarginInMm;
        let innerHeight1 = mapProject.bottomMarginInMm;
        let innerHeight2 = mapProject.heightInMm - mapProject.topMarginInMm;
        return {
            Style: `<!--${JSON.stringify(metadata)}--><PolygonSymbolizer fill='white' fill-opacity='1.0' />`,
            WellKnownText: `POLYGON((0 0, 0 ${outerHeight}, ${outerWidth} ${outerHeight}, ${outerWidth} 0, 0 0), (${innerWidth1} ${innerHeight1}, ${innerWidth1} ${innerHeight2}, ${innerWidth2} ${innerHeight2}, ${innerWidth2} ${innerHeight1}, ${innerWidth1} ${innerHeight1}))`
        };
    }

    private static convertUserObjectToAdditionalElement(userObject: UserObject): AnyAdditionalElement {
        if (!userObject.Style.match(/^<!--(.*)-->/)) {
            return undefined;
        }
        let metadata = JSON.parse(userObject.Style.match(/^<!--(.*)-->/)[1]) as UserObjectMetadata;
        if (metadata?.Type == AdditionalElementType.TEXT_BOX || metadata?.Type == AdditionalElementType.ATTRIBUTION) {
            return this.extractTextElement(userObject, metadata);
        } else if (metadata?.Type == AdditionalElementType.SCALE) {
            return this.extractScaleElement(userObject, metadata);
        } else if (metadata?.Type == AdditionalElementType.GPX_TRACK) {
            return this.extractGpxElement(userObject, metadata);
        }
        return undefined;
    }

    private static extractTextElement(userObject: UserObject, metadata: UserObjectMetadata): AdditionalTextElement {
        let parser = new DOMParser();
        let styleXml = parser.parseFromString(userObject.Style, "application/xml");
        let wkt = parse(userObject.WellKnownText);
        let textSymbolizerAttributes = styleXml.getElementsByTagName("TextSymbolizer")[0].attributes;
        return {
            type: metadata.Type as AdditionalElementType,
            id: metadata.ID ?? uuid(),
            text: metadata.Text ?? "",
            style: {
                type: AdditionalElementStyleType.TEXT,
                fontStyle: FONT_STYLE_BY_FONTSET_NAME
                        .get(textSymbolizerAttributes.getNamedItem("fontset-name")?.value) ??
                    DEFAULT_TEXT_STYLE.fontStyle,
                fontSize: parseInt(textSymbolizerAttributes.getNamedItem("size")?.value ??
                    DEFAULT_TEXT_STYLE.fontSize.toString()),
                textOrientation: parseInt(textSymbolizerAttributes.getNamedItem("orientation")?.value ??
                    DEFAULT_TEXT_STYLE.textOrientation.toString()),
                fontColor: {
                    rgbHexValue: textSymbolizerAttributes.getNamedItem("fill")?.value ??
                        DEFAULT_TEXT_STYLE.fontColor.rgbHexValue,
                    opacity: parseFloat(textSymbolizerAttributes.getNamedItem("opacity")?.value ??
                        DEFAULT_TEXT_STYLE.fontColor.opacity.toString())
                }
            },
            location: {x: wkt.coordinates[0], y: wkt.coordinates[1]}
        };
    }

    private static extractScaleElement(userObject: UserObject, metadata: UserObjectMetadata): AdditionalScaleElement {
        let wkt = parse(userObject.WellKnownText);
        return {
            type: metadata.Type as AdditionalElementType,
            id: metadata.ID ?? uuid(),
            style: DEFAULT_SCALE_STYLE,
            location: {x: wkt.coordinates[0], y: wkt.coordinates[1]}
        };
    }

    private static extractGpxElement(userObject: UserObject, metadata: UserObjectMetadata): AdditionalGpxElement {
        let parser = new DOMParser();
        let styleXml = parser.parseFromString(userObject.Style, "application/xml");
        let lineSymbolizerAttributes = styleXml.getElementsByTagName("LineSymbolizer")[0].attributes;
        return {
            type: AdditionalElementType.GPX_TRACK,
            id: metadata.ID ?? uuid(),
            style: {
                type: AdditionalElementStyleType.TRACK,
                lineWidth: parseFloat(lineSymbolizerAttributes.getNamedItem("stroke-width")?.value
                    ?? DEFAULT_TRACK_STYLE.lineWidth.toString()),
                lineColor: {
                    rgbHexValue: lineSymbolizerAttributes.getNamedItem("stroke")?.value
                        ?? DEFAULT_TRACK_STYLE.lineColor.rgbHexValue,
                    opacity: parseFloat(lineSymbolizerAttributes.getNamedItem("stroke-opacity")?.value
                        ?? DEFAULT_TRACK_STYLE.lineColor.opacity.toString())
                }
            },
            file: {name: metadata.File, data: undefined, modified: new Date().getTime()}
        };
    }

    private static extractMargins(userObject: UserObject): { top: number, bottom: number, left: number, right: number } {
        if (!userObject.Style.match(/^<!--(.*)-->/)) {
            return undefined;
        }
        let metadata = JSON.parse(userObject.Style.match(/^<!--(.*)-->/)[1]) as UserObjectMetadata;
        if (metadata?.Type == "margins") {
            let wkt = parse(userObject.WellKnownText);
            return {
                top: wkt.coordinates[0][2][1] - wkt.coordinates[1][2][1],
                bottom: wkt.coordinates[1][0][1],
                left: wkt.coordinates[1][0][0],
                right: wkt.coordinates[0][2][0] - wkt.coordinates[1][2][0]
            };
        }
        return undefined;
    }
}