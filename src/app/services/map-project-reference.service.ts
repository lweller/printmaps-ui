import {Injectable} from "@angular/core";
import {MapProjectReference} from "../model/intern/map-project-reference";
import {defer, from, Observable, of, throwError, zip} from "rxjs";
import {PrintmapsService} from "./printmaps.service";
import {catchError, concatMap, map, mapTo, switchMap, tap, toArray} from "rxjs/operators";

export const SCHEMA_VERSION = "schemaVersion";
export const MAP_PROJECT_REFERENCES = "mapProjectReferences";

export const CURRENT_SCHEMA_VERSION = 1;

export const INCOMPATIBLE_SCHEMA_ERROR = "Locally stored projects are reset because they seam to be incompatible with current version of Printmaps UI.";
export const INVALID_DATA_ERROR = "Locally stored projects are reset due to an error while loading them.";

class SchemaError {
}

@Injectable()
export class MapProjectReferenceService {

    constructor(private printmapsService: PrintmapsService) {
    }

    private checkOrResetSchemaVersion(): Observable<boolean> {
        let currentSchemaVersion = JSON.parse(localStorage.getItem(SCHEMA_VERSION)) as number;
        if (!currentSchemaVersion) {
            localStorage.setItem(SCHEMA_VERSION, JSON.stringify(CURRENT_SCHEMA_VERSION));
        } else if (currentSchemaVersion != CURRENT_SCHEMA_VERSION) {
            this.resetLocalStore();
            throw new SchemaError();
        }
        return of(true);
    }


    private static updateSchemaVersion(): Observable<boolean> {
        localStorage.setItem(SCHEMA_VERSION, CURRENT_SCHEMA_VERSION.toString());
        return of(true);
    }

    loadMapProjectReferences(): Observable<MapProjectReference[]> {
        return defer(() => this.checkOrResetSchemaVersion())
            .pipe(
                map(() => localStorage.getItem(MAP_PROJECT_REFERENCES)),
                map(data => <MapProjectReference[]>(data ? JSON.parse(data) : [])),
                switchMap(mapProjectReferences => from(mapProjectReferences)),
                concatMap(mapProjectReference => zip(
                    of(mapProjectReference),
                    this.printmapsService.loadMapProjectState(mapProjectReference.id))),
                map(([mapProjectReference, mapProjectState]) => ({
                    ...mapProjectReference,
                    state: mapProjectState
                })),
                toArray(),
                tap(() => console.log("Successfully loaded map project references.")),
                catchError(error => {
                    tap(() => console.log("Error while loading map project references."));
                    this.resetLocalStore();
                    if (error.constructor === SchemaError) {
                        return throwError(INCOMPATIBLE_SCHEMA_ERROR);
                    } else {
                        return throwError(INVALID_DATA_ERROR);
                    }
                })
            );
    }

    saveMapProjectReferences(mapProjectReferences: MapProjectReference[]): Observable<boolean> {
        return defer(() => MapProjectReferenceService.updateSchemaVersion())
            .pipe(
                map(() => localStorage.setItem(MAP_PROJECT_REFERENCES, JSON.stringify(mapProjectReferences))),
                tap(() => console.log("Successfully saved map project references.")),
                mapTo(true)
            );
    }

    resetLocalStore() {
        console.log("Resetting local storage");
        localStorage.clear();
    }
}