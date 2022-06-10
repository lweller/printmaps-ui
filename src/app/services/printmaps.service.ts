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
import {Scale, SCALES} from "../model/intern/scale";
import {
    AdditionalElementType,
    AdditionalGpxElement,
    AdditionalScaleElement,
    AdditionalTextElement,
    AnyAdditionalElement
} from "../model/intern/additional-element";
import {DEFAULT_SCALE_STYLE, DEFAULT_TEXT_STYLE, DEFAULT_TRACK_STYLE} from "../model/intern/additional-element-style";
import {v4 as uuid} from "uuid";
import {UserFile} from "../model/api/user-file";
import {ScaleService} from "./scale.service";
import {GeoCoordinates} from "../model/intern/geo-coordinates";
import {MapProjectConversionService} from "./map-project-conversion.service";

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
        private readonly mapProjectConversionService: MapProjectConversionService,
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
        return this.http.post<MapRenderingJobDefinition>(
            endpointUrl,
            this.mapProjectConversionService.toMapRenderingJob(mapProject),
            REQUEST_OPTIONS
        ).pipe(
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
                map(([mapRenderingJob, name]) =>
                    this.mapProjectConversionService.toMapProject(name, mapRenderingJob)),
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