import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
    concatMap,
    debounce,
    delay,
    distinctUntilChanged,
    expand,
    filter,
    groupBy,
    ignoreElements,
    map,
    mergeAll,
    switchMap,
    takeWhile
} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {PrintmapsService} from "../services/printmaps.service";
import {currentMapProject, mapProjectReferences} from "../model/intern/printmaps-ui-state";
import * as UiActions from "../actions/main.actions";
import {of, timer, zip} from "rxjs";
import {MapProjectReferenceService} from "../services/map-project-reference.service";
import {isEqual} from "lodash";
import {MapProjectState} from "../model/intern/map-project-state";
import {ConfigurationService} from "../services/configuration.service";

// noinspection JSUnusedGlobalSymbols
@Injectable()
export class MainEffects {

    init = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.init),
                map(() => UiActions.updateCenterCoordinates({
                    center: this.configurationService.appConf.defaultCoordinates
                }))
            )
    );

    deleteMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.deleteMapProject),
                switchMap(action => zip(of(action.id), this.printmapsService.deleteMapRenderingJob(action.id))),
                map(([id]) => UiActions.mapProjectDeleted({id: id}))
            )
    );

    loadMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.loadMapProject),
                switchMap(action => this.printmapsService.loadMapProject(action.mapProjectReference)),
                map(mapProject => UiActions.mapProjectLoaded({mapProject: mapProject}))
            )
    );
    loadMapProjectReferences = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.loadMapProjectReferences),
                switchMap(() => this.mapProjectReferenceService.loadMapProjectReferences()),
                map(loadedMapProjectReferences =>
                    UiActions.mapProjectReferencesLoaded({mapProjectReferences: loadedMapProjectReferences}))
            )
    );

    uploadMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.uploadMapProject),
                concatMap(action =>
                    (action.mapProject.modifiedLocally
                        ? this.printmapsService.createOrUpdateMapRenderingJob(action.mapProject)
                        : of(action.mapProject))
                        .pipe(
                            map(mapProject =>
                                UiActions.mapProjectUploaded({
                                    mapProjectReference: {
                                        id: mapProject.id,
                                        name: mapProject.name,
                                        state: mapProject.state
                                    },
                                    followUpAction: action.followUpAction
                                })
                            )
                        )
                )
            )
    );

    mapProjectUploaded = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.mapProjectUploaded),
                concatMap(action => [
                        UiActions.refreshMapProjectState({id: action.mapProjectReference.id}),
                        UiActions.createUploadMapProjectFollowUpAction(action.followUpAction, action.mapProjectReference.id)
                    ].filter(followUpAction => !!followUpAction)
                )
            )
    );

    launchMapProjectRendering = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.launchMapProjectRendering),
                map(action => action.id),
                switchMap(id =>
                    this.printmapsService
                        .launchMapRenderingJob(id)
                        .pipe(map(() => UiActions.refreshMapProjectState({id: id})))
                )
            )
    );

    autoSaveMapProjectReferences = createEffect(
        () => this.store
            .select(mapProjectReferences)
            .pipe(
                filter(nextMapProjectReferences => !!nextMapProjectReferences),
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue)),
                concatMap(nextMapProjectReferences =>
                    this.mapProjectReferenceService.saveMapProjectReferences(nextMapProjectReferences)),
                ignoreElements()
            ),
        {
            dispatch: false
        }
    );

    autoUploadMapProject = createEffect(
        () => this.store
            .select(currentMapProject)
            .pipe(
                filter(mapProject => mapProject?.modifiedLocally),
                debounce(mapProject => mapProject.id ?
                    timer(this.configurationService.appConf.autoUploadIntervalInSeconds * 1000) :
                    of()),
                map(mapProject => UiActions.uploadMapProject({mapProject: mapProject}))
            )
    );

    refreshMapProjectState = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.refreshMapProjectState),
                groupBy(action => action.id),
                map(group =>
                    group.pipe(
                        switchMap(action => of(action.id).pipe(
                            expand(id =>
                                of(id)
                                    .pipe(
                                        delay(this.configurationService.appConf.mapStatePollingIntervalInSeconds * 1000)
                                    )
                            ),
                            switchMap(id => this.printmapsService.loadMapProjectState(id)),
                            map((mapProjectState, index) => [mapProjectState, index] as [MapProjectState, number]),
                            takeWhile(([mapProjectState, index]) =>
                                    (index == 0
                                        || mapProjectState == MapProjectState.WAITING_FOR_RENDERING
                                        || mapProjectState == MapProjectState.RENDERING),
                                true),
                            map(([mapProjectState]) => mapProjectState),
                            distinctUntilChanged(),
                            map(mapProjectState =>
                                UiActions.mapProjectStateUpdated({id: action.id, mapProjectState: mapProjectState}))
                            )
                        )
                    )
                ),
                mergeAll()
            )
    );

    constructor(
        private store: Store<any>,
        private actions: Actions,
        private readonly configurationService: ConfigurationService,
        private mapProjectReferenceService: MapProjectReferenceService,
        private printmapsService: PrintmapsService
    ) {
    }
}