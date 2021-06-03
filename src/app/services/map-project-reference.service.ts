import {Injectable} from "@angular/core";
import {MapProjectReference} from "../model/intern/map-project-reference";
import {from, Observable, of, zip} from "rxjs";
import {PrintmapsService} from "./printmaps.service";
import {concatMap, map, switchMap, toArray} from "rxjs/operators";

const SCHEMA_VERSION = "schemaVersion";
const MAP_PROJECT_REFERENCES = "mapProjectReferences";

const CURRENT_SCHEMA_VERSION = 1;

@Injectable()
export class MapProjectReferenceService {

    constructor(private printmapsService: PrintmapsService) {
    }


    private static checkOrUpdateSchemaVersion() {
        let currentSchemaVersion = JSON.parse(localStorage.getItem(SCHEMA_VERSION)) as number;
        if (!currentSchemaVersion) {
            localStorage.setItem(SCHEMA_VERSION, JSON.stringify(CURRENT_SCHEMA_VERSION));
        } else if (currentSchemaVersion != CURRENT_SCHEMA_VERSION) {
            throw Error("Schema in local storage has an incompatible version.");
        }
    }

    loadMapProjectReferences(): Observable<MapProjectReference[]> {
        MapProjectReferenceService.checkOrUpdateSchemaVersion();
        return from(new Promise<MapProjectReference[]>(resolve => {
            let mapProjectReferences = localStorage.getItem(MAP_PROJECT_REFERENCES);
            resolve(mapProjectReferences ? JSON.parse(mapProjectReferences) : []);
        }))
            .pipe(
                switchMap(mapProjectReferences => from(mapProjectReferences)),
                concatMap(mapProjectReference => zip(
                    of(mapProjectReference),
                    this.printmapsService.loadMapProjectState(mapProjectReference.id))),
                map(([mapProjectReference, mapProjectState]) => {
                    mapProjectReference.state = mapProjectState;
                    return mapProjectReference;
                }),
                toArray()
            );
    }

    saveMapProjectReferences(mapProjectReferences: MapProjectReference[]): Observable<boolean> {
        MapProjectReferenceService.checkOrUpdateSchemaVersion();
        return from(new Promise<boolean>((resolve) => {
            localStorage.setItem(MAP_PROJECT_REFERENCES, JSON.stringify(mapProjectReferences));
            resolve(true);
        }));
    }
}