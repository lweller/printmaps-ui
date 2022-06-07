import {HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Inject, Injectable, LOCALE_ID} from "@angular/core";
import {EMPTY, Observable, of, zip} from "rxjs";
import {catchError, concatMap, map, tap, withLatestFrom} from "rxjs/operators";
import {FileFormat, MapRenderingJobDefinition, MapStyle} from "../model/api/map-rendering-job-definition";
import {MapProject, toMapRenderingJobExecution} from "../model/intern/map-project";
import {MapRenderingJobState} from "../model/api/map-rendering-job-state";
import {fromMapRenderingJobState, MapProjectState} from "../model/intern/map-project-state";
import {MapProjectReference} from "../model/intern/map-project-reference";
import {ConfigurationService} from "./configuration.service";
import {fromReductionFactor, getScaleProperties, Scale, SCALES} from "../model/intern/scale";
import {
    ADDITIONAL_ELEMENT_TYPES,
    AdditionalElementType,
    AdditionalGpxElement,
    AdditionalScaleElement,
    AdditionalTextElement,
    AnyAdditionalElement
} from "../model/intern/additional-element";
import {TemplateService} from "./template-service";
import {UserObject} from "../model/api/user-object";
import {UserObjectMetadata} from "../model/api/user-object-metadata";
import {
    AdditionalElementStyleType,
    DEFAULT_SCALE_STYLE,
    DEFAULT_TEXT_STYLE,
    DEFAULT_TRACK_STYLE,
    FONT_STYLE_BY_FONTSET_NAME
} from "../model/intern/additional-element-style";
import {v4 as uuid} from "uuid";
import {parse} from "wellknown";
import {UserFile} from "../model/api/user-file";
import {ScaleService} from "./scale.service";
import {GeoCoordinates} from "../model/intern/geo-coordinates";

const REQUEST_OPTIONS = {
    headers: new HttpHeaders({
        "Accept": "application/vnd.api+json; charset=utf-8",
        "Content-Type": "application/vnd.api+json; charset=utf-8"
    })
};

@Injectable()
export class PrintmapsService {
    constructor(
        @Inject(LOCALE_ID) private readonly locale: string,
        private readonly http: HttpClient,
        private readonly configurationService: ConfigurationService,
        private readonly templateService: TemplateService,
        private readonly scaleService: ScaleService) {
    }

    private get baseUrl() {
        return this.configurationService.appConf.printmapsApiBaseUri;
    }

    private static generateMapProjectCloneName(name: string): string {
        let copySuffix = $localize`copy`;
        let pattern = new RegExp("(.*?)\\s*\\(" + copySuffix + "(\\s*\\d+)?\\)$");
        let matches = name.match(pattern);
        if (matches) {
            let number = matches[2] ? (parseInt(matches[2]) + 1) : 2;
            return matches[1] + " (" + copySuffix + " " + number + ")";
        } else {
            return name + " (" + copySuffix + ")";
        }
    }

    private static generateMargins(mapProject: MapProject): UserObject {
        let metadata: UserObjectMetadata = {
            ID: uuid(),
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

    createMapProject(mapCenter: GeoCoordinates): Observable<MapProject> {
        let mapProject = {
            id: undefined,
            name: $localize`New Map Project ${new Date().toLocaleString(this.locale)}`,
            modifiedLocally: true,
            state: MapProjectState.NOT_RENDERED,
            center: mapCenter,
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
        return this.createOrUpdateMapRenderingJob({
            ...mapProject,
            additionalElements: [this.createAdditionalElement(mapProject, AdditionalElementType.ATTRIBUTION)]
        });
    }

    createAdditionalElement(mapProject: MapProject, type: AdditionalElementType): AnyAdditionalElement {
        let baseElement = {
            type: type,
            id: uuid()
        };
        switch (type) {
            case AdditionalElementType.TEXT_BOX:
                return {
                    ...baseElement,
                    text: $localize`New Text Element`,
                    style: DEFAULT_TEXT_STYLE,
                    location: {
                        x: Math.round(mapProject.widthInMm / 2),
                        y: Math.round(mapProject.heightInMm / 2)
                    }
                } as AdditionalTextElement;
            case AdditionalElementType.ATTRIBUTION:
                return {
                    ...baseElement,
                    text: "${attribution}",
                    style: DEFAULT_TEXT_STYLE,
                    location: {x: 40, y: 7}
                } as AdditionalTextElement;
            case AdditionalElementType.SCALE:
                return {
                    ...baseElement,
                    style: DEFAULT_SCALE_STYLE,
                    location: {x: 160, y: 10}
                } as AdditionalScaleElement;
            case AdditionalElementType.GPX_TRACK:
                return {
                    ...baseElement,
                    style: DEFAULT_TRACK_STYLE
                } as AdditionalGpxElement;
            default :
                return undefined;
        }
    }

    cloneMapProject(mapProject: MapProject): Observable<MapProject> {
        return this.createOrUpdateMapRenderingJob({
            ...mapProject,
            id: undefined,
            name: PrintmapsService.generateMapProjectCloneName(mapProject.name),
            modifiedLocally: true
        });
    }

    createOrUpdateMapRenderingJob(mapProject: MapProject): Observable<MapProject> {
        let endpointUrl = `${this.baseUrl}/metadata${mapProject.id ? "/patch" : ""}`;
        return this.http.post<MapRenderingJobDefinition>(endpointUrl, this.toMapRenderingJob(mapProject), REQUEST_OPTIONS)
            .pipe(
                withLatestFrom(of(mapProject.name)),
                this.buildMapProject(),
                tap(savedMapProject =>
                    this.toUserFiles(mapProject).forEach(userFile =>
                        this.uploadUserFile(savedMapProject.id, userFile.content, userFile.name).subscribe()))
            );
    }

    buildMapProject() {
        return (source: Observable<[MapRenderingJobDefinition, string]>): Observable<MapProject> =>
            source.pipe(
                map(([mapRenderingJob, name]) => this.fromMapRenderingJob(name, mapRenderingJob)),
                concatMap(mapProject => zip(of(mapProject), this.loadMapProjectState(mapProject.id))),
                map(([mapProject, mapProjectState]) => ({
                        ...mapProject,
                        state: mapProjectState,
                        modifiedLocally: false
                    })
                ),
                catchError(() => EMPTY)
            );
    }

    uploadUserFile(mapProjectId: string, content: string | Blob, name: string): Observable<boolean> {
        let formData = new FormData();
        formData.append("file", new Blob([content], {type: "image/svg+xml"}), name);
        let endpointUrl = `${this.baseUrl}/upload/${mapProjectId}`;
        let requestOptions = {
            headers: new HttpHeaders({
                "Accept": "application/vnd.api+json; charset=utf-8"
            })
        };

        return this.http.post<HttpResponse<any>>(endpointUrl, formData, requestOptions)
            .pipe(
                map(response => response.status == 201),
                catchError(() => of(false))
            );
    }

    loadMapProject(mapProjectReference: MapProjectReference): Observable<MapProject> {
        let endpointUrl = `${this.baseUrl}/metadata/${mapProjectReference.id}`;
        return this.http.get<MapRenderingJobDefinition>(endpointUrl)
            .pipe(
                withLatestFrom(of(mapProjectReference.name)),
                this.buildMapProject()
            );
    }

    loadMapProjectState(id: string): Observable<MapProjectState> {
        let endpointUrl = `${this.baseUrl}/mapstate/${id}`;
        return this.http.get<MapRenderingJobState>(endpointUrl)
            .pipe(
                map(fromMapRenderingJobState),
                catchError((error: HttpErrorResponse) => {
                    if (error.status == 400) {
                        return of(MapProjectState.NONEXISTENT);
                    }
                    return of(MapProjectState.RENDERING_UNSUCCESSFUL);
                })
            );
    }

    deleteMapRenderingJob(id: string): Observable<boolean> {
        let endpointUrl = `${this.baseUrl}/delete/${id}`;
        return this.http.post<HttpResponse<any>>(endpointUrl, REQUEST_OPTIONS)
            .pipe(
                map(response => response.status == 204),
                catchError(() => of(false))
            );
    }

    launchMapRenderingJob(id: string): Observable<boolean> {
        let endpointUrl = `${this.baseUrl}/mapfile`;
        return this.http.post<HttpResponse<any>>(endpointUrl, toMapRenderingJobExecution(id), REQUEST_OPTIONS)
            .pipe(
                map(response => response.status == 202),
                catchError(() => of(false))
            );

    }

    downloadRenderedMapFile(id: string): Observable<boolean> {
        window.open(`${this.configurationService.appConf.printmapsApiBaseUri}/mapfile/${id}`, "_self");
        return of(true);
    }

    fromMapRenderingJob(name: string, mapRenderingJob: MapRenderingJobDefinition): MapProject {
        let data = mapRenderingJob.Data;
        let attributes = data.Attributes;
        let margins = mapRenderingJob.Data.Attributes.UserObjects
            .map(userObject => PrintmapsService.extractMargins(userObject))
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
                .map(userObject => PrintmapsService.convertUserObjectToAdditionalElement(userObject))
                .filter(additionalElement => !!additionalElement),
            modifiedLocally: false
        };
    }

    toMapRenderingJob(mapProject: MapProject): MapRenderingJobDefinition {
        let gpxTracks = mapProject.additionalElements
            .filter(element => element.type == AdditionalElementType.GPX_TRACK)
            .map(element => ADDITIONAL_ELEMENT_TYPES.get(element.type)
                .toUserObject(this.templateService, mapProject, element));
        let otherAdditionalElementUserObjects = mapProject.additionalElements
            .filter(element => element.type != AdditionalElementType.GPX_TRACK)
            .map(element => ADDITIONAL_ELEMENT_TYPES.get(element.type)
                .toUserObject(this.templateService, mapProject, element));
        let userObject = [
            ...gpxTracks,
            PrintmapsService.generateMargins(mapProject),
            ...otherAdditionalElementUserObjects
        ];
        return {
            Data: {
                Type: "maps",
                ID: mapProject.id,
                Attributes: {
                    Fileformat: mapProject.options.fileFormat,
                    Style: mapProject.options.mapStyle,
                    Projection: "3857",
                    Scale: getScaleProperties(mapProject.scale).reductionFactor,
                    Latitude: mapProject.center.latitude,
                    Longitude: mapProject.center.longitude,
                    PrintWidth: mapProject.widthInMm,
                    PrintHeight: mapProject.heightInMm,
                    HideLayers: "",
                    UserObjects: userObject
                }
            }
        };
    }

    private toUserFiles(mapProject: MapProject): UserFile[] {
        let reductionFactor = SCALES.get(mapProject.scale).reductionFactor;
        let scaleRatio = Math.pow(10, Math.ceil(Math.log10(10 * reductionFactor))) / reductionFactor;
        let unitLengthInM;
        if (scaleRatio >= 30) {
            unitLengthInM = scaleRatio * reductionFactor / 4000;
        } else if (scaleRatio >= 15) {
            unitLengthInM = scaleRatio * reductionFactor / 2000;
        } else {
            unitLengthInM = scaleRatio * reductionFactor / 1000;
        }
        return mapProject.additionalElements
            .filter(addAdditionalElement => addAdditionalElement.type == AdditionalElementType.SCALE)
            .map(element => ({
                name: `scale_${element.id}.svg`,
                content: this.scaleService.buildScaleSvg(unitLengthInM, SCALES.get(mapProject.scale).reductionFactor)
            }))
            .concat(
                mapProject.additionalElements
                    .filter(addAdditionalElement => addAdditionalElement.type == AdditionalElementType.GPX_TRACK)
                    .map(element => element as AdditionalGpxElement)
                    .filter(element => element.file?.data)
                    .map(element => ({
                        name: element.file.name,
                        content: element.file.data
                    }))
            );
    }
}