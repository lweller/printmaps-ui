import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {EMPTY, Observable, of} from "rxjs";
import {catchError, concatMap, map, mapTo} from "rxjs/operators";
import {MapRenderingJobDefinition} from "../model/api/map-rendering-job-definition";
import {MapProject, toMapRenderingJobExecution} from "../model/intern/map-project";
import {MapRenderingJobState} from "../model/api/map-rendering-job-state";
import {fromMapRenderingJobState, MapProjectState} from "../model/intern/map-project-state";
import {MapProjectReference} from "../model/intern/map-project-reference";
import {ConfigurationService} from "./configuration.service";
import {fromReductionFactor, getScaleProperties} from "../model/intern/scale";
import {
    ADDITIONAL_ELEMENT_TYPES,
    AdditionalElementType,
    AnyAdditionalElement
} from "../model/intern/additional-element";
import {TemplateService} from "./template-service";
import {UserObject} from "../model/api/user-object";
import {UserObjectMetadata} from "../model/api/user-object-metadata";
import {AdditionalElementStyleType, FONT_STYLE_BY_FONTSET_NAME} from "../model/intern/additional-element-style";
import {FontStyle} from "../components/font-style-selector/font-style-selector.component";
import {v4 as uuid} from "uuid";
import {parse} from "wellknown";

const REQUEST_OPTIONS = {
    headers: new HttpHeaders({
        "Accept": "application/vnd.api+json; charset=utf-8",
        "Content-Type": "application/vnd.api+json; charset=utf-8"
    })
};

@Injectable()
export class PrintmapsService {
    constructor(private readonly configurationService: ConfigurationService, private templateService: TemplateService, private http: HttpClient) {
    }

    private get baseUrl() {
        return this.configurationService.appConf.printmapsApiBaseUri;
    }

    private static convertUserObjectToAdditionalElement(userObject: UserObject): AnyAdditionalElement {
        let metadata = JSON.parse(userObject.Style.match(/^<!--(.*)-->/)[1]) as UserObjectMetadata;
        if (metadata?.Type == AdditionalElementType.TEXT_BOX || metadata?.Type == AdditionalElementType.ATTRIBUTION) {
            let parser = new DOMParser();
            let styleXml = parser.parseFromString(userObject.Style, "application/xml");
            let textSymbolizer = styleXml.getElementsByTagName("TextSymbolizer")[0];
            let wkt = parse(userObject.WellKnownText);
            let textSymbolizerAttributes = textSymbolizer.attributes;
            return {
                type: metadata.Type,
                id: metadata.ID ?? uuid(),
                text: metadata.Text ?? "",
                style: {
                    type: AdditionalElementStyleType.TEXT,
                    fontStyle: FONT_STYLE_BY_FONTSET_NAME
                        .get(textSymbolizerAttributes.getNamedItem("fontset-name")?.value) ?? FontStyle.NORMAL,
                    fontSize: parseInt(textSymbolizerAttributes.getNamedItem("size")?.value ?? "10"),
                    textOrientation: parseInt(textSymbolizerAttributes.getNamedItem("orientation")?.value ?? "0"),
                    fontColor: {
                        rgbHexValue: textSymbolizerAttributes.getNamedItem("fill")?.value ?? "#000000",
                        opacity: parseFloat(textSymbolizerAttributes.getNamedItem("opacity")?.value ?? "1")
                    }
                },
                location: {x: wkt.coordinates[0], y: wkt.coordinates[1]}
            };
        }
        return undefined;
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

    loadMapProject(mapProjectReference: MapProjectReference): Observable<MapProject> {
        let endpointUrl = `${this.baseUrl}/metadata/${mapProjectReference.id}`;
        return this.http.get<MapRenderingJobDefinition>(endpointUrl)
            .pipe(
                map(mapRenderingJob => this.fromMapRenderingJob(mapProjectReference.name, mapRenderingJob)),
                concatMap(mapProject =>
                    this.loadMapProjectState(mapProject.id)
                        .pipe(
                            map(mapProjectState => {
                                mapProject.state = mapProjectState;
                                return mapProject;
                            })
                        )
                ),
                catchError(() => EMPTY)
            );
    }

    deleteMapRenderingJob(id: string): Observable<boolean> {
        let endpointUrl = `${this.baseUrl}/delete/${id}`;
        return this.http.post(endpointUrl, null, REQUEST_OPTIONS)
            .pipe(
                mapTo(true),
                catchError(() => of(false))
            );
    }

    launchMapRenderingJob(id: string): Observable<boolean> {
        let endpointUrl = `${this.baseUrl}/mapfile`;
        return this.http.post(endpointUrl, toMapRenderingJobExecution(id), REQUEST_OPTIONS)
            .pipe(
                mapTo(true),
                catchError(() => of(false))
            );

    }

    createOrUpdateMapRenderingJob(mapProject: MapProject): Observable<MapProject> {
        let endpointUrl = `${this.baseUrl}/metadata${mapProject.id ? "/patch" : ""}`;
        return this.http.post<MapRenderingJobDefinition>(endpointUrl, this.toMapRenderingJob(mapProject), REQUEST_OPTIONS)
            .pipe(
                map(mapRenderingJob => this.fromMapRenderingJob(mapProject.name, mapRenderingJob)),
                concatMap(savedMapProject =>
                    this.loadMapProjectState(savedMapProject.id)
                        .pipe(
                            map(mapProjectState => {
                                savedMapProject.state = mapProjectState;
                                return savedMapProject;
                            })
                        )
                ),
                catchError(() => EMPTY)
            );
    }

    private fromMapRenderingJob(name: string, mapRenderingJob: MapRenderingJobDefinition): MapProject {
        let data = mapRenderingJob.Data;
        let attributes = data.Attributes;
        return {
            id: data.ID,
            name: name,
            state: undefined,
            scale: fromReductionFactor(attributes.Scale),
            center: {latitude: attributes.Latitude, longitude: attributes.Longitude},
            widthInMm: attributes.PrintWidth,
            heightInMm: attributes.PrintHeight,
            options: {
                fileFormat: attributes.Fileformat,
                mapStyle: attributes.Style
            },
            additionalElements: mapRenderingJob.Data.Attributes.UserObjects
                .map(userObject => PrintmapsService.convertUserObjectToAdditionalElement(userObject)),
            modifiedLocally: false
        };
    }

    private toMapRenderingJob(mapProject: MapProject): MapRenderingJobDefinition {
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
                    UserObjects: mapProject.additionalElements.map(element => ADDITIONAL_ELEMENT_TYPES.get(element.type)
                        .toUserObject(this.templateService, mapProject, element))
                }
            }
        };
    }
}