import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {EMPTY, Observable, of} from "rxjs";
import {catchError, concatMap, map, mapTo} from "rxjs/operators";
import {MapRenderingJobDefinition} from "../model/api/map-rendering-job-definition";
import {
    fromMapRenderingJob,
    MapProject,
    toMapRenderingJob,
    toMapRenderingJobExecution
} from "../model/intern/map-project";
import {MapRenderingJobState} from "../model/api/map-rendering-job-state";
import {fromMapRenderingJobState, MapProjectState} from "../model/intern/map-project-state";
import {MapProjectReference} from "../model/intern/map-project-reference";
import {ConfigurationService} from "./configuration.service";

const REQUEST_OPTIONS = {
    headers: new HttpHeaders({
        "Accept": "application/vnd.api+json; charset=utf-8",
        "Content-Type": "application/vnd.api+json; charset=utf-8"
    })
};

@Injectable()
export class PrintmapsService {
    constructor(private readonly configurationService: ConfigurationService, private http: HttpClient) {
    }

    private get baseUrl() {
        return this.configurationService.appConf.printmapsApiBaseUri;
    }

    loadMapProject(mapProjectReference: MapProjectReference): Observable<MapProject> {
        let endpointUrl = `${this.baseUrl}/metadata/${mapProjectReference.id}`;
        return this.http.get<MapRenderingJobDefinition>(endpointUrl)
            .pipe(
                map(mapRenderingJob => fromMapRenderingJob(mapProjectReference.name, mapRenderingJob)),
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

    createOrUpdateMapRenderingJob(mapProject: MapProject): Observable<MapProject> {
        let endpointUrl = `${this.baseUrl}/metadata${mapProject.id ? "/patch" : ""}`;
        return this.http.post<MapRenderingJobDefinition>(endpointUrl, toMapRenderingJob(mapProject), REQUEST_OPTIONS)
            .pipe(
                map(mapRenderingJob => fromMapRenderingJob(mapProject.name, mapRenderingJob)),
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
}