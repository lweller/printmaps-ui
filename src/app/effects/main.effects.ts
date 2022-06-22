import {Injectable} from "@angular/core";
import {Actions, createEffect, ofType} from "@ngrx/effects";
import {
    concatMap,
    debounce,
    distinctUntilChanged,
    expand,
    filter,
    groupBy,
    ignoreElements,
    map,
    mergeAll,
    switchMap,
    takeWhile,
    withLatestFrom
} from "rxjs/operators";
import {Store} from "@ngrx/store";
import {PrintmapsService} from "../services/printmaps.service";
import * as UiActions from "../actions/main.actions";
import {UploadMapProjectFollowUpAction} from "../actions/main.actions";
import {EMPTY, identity, of, zip} from "rxjs";
import {MapProjectReferenceService} from "../services/map-project-reference.service";
import {MapProjectState} from "../model/intern/map-project-state";
import {ConfigurationService} from "../services/configuration.service";
import {currentMapProject, mapProjectReferences, selectedMapCenter} from "../selectors/main.selectors";
import {MapProject, toMapProjectReference} from "../model/intern/map-project";
import {MatDialog} from "@angular/material/dialog";
import {
    NonexistentMapProjectEvictionConfirmDialog
} from "../components/dialogs/nonexistent-map-project-eviction-confirm-dialog.component";

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

    private static mapProjectCreatedAndSelected(mapProject: MapProject) {
        return [
            UiActions.mapProjectCreated({mapProject: mapProject}),
            UiActions.mapProjectSelected({mapProject: mapProject})
        ];
    }

    createMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.createMapProject),
                withLatestFrom(this.store.select(selectedMapCenter)),
                map(([_, mapCenter]) => mapCenter),
                filter(mapCenter => !!mapCenter),
                concatMap(mapCenter => this.printmapsService.createMapProject(mapCenter)),
                concatMap(mapProject => MainEffects.mapProjectCreatedAndSelected(mapProject))
            )
    );

    copyMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.copyMapProject),
                withLatestFrom(this.store.select(currentMapProject)),
                map(([_, mapProject]) => mapProject),
                filter(mapProject => !!mapProject),
                concatMap(mapProject => this.printmapsService.cloneMapProject(mapProject)),
                concatMap(mapProject => MainEffects.mapProjectCreatedAndSelected(mapProject))
            )
    );

    addAdditionalElement = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.addAdditionalElement),
                withLatestFrom(this.store.select(currentMapProject)),
                filter(([_, mapProject]) => !!mapProject),
                map(([action, mapProject]) => UiActions.additionalElementAdded({
                    additionalElement: this.printmapsService.createAdditionalElement(mapProject, action.elementType)
                }))
            )
    );

    deleteMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.deleteMapProject),
                withLatestFrom(this.store.select(currentMapProject)),
                map(([action, curMapProject]) => action.id ?? curMapProject?.id),
                filter(id => !!id),
                concatMap(id => zip(of(id), this.printmapsService.deleteMapRenderingJob(id))),
                filter(([_, deletionSuccess]) => deletionSuccess),
                map(([id]) => UiActions.mapProjectDeleted({id: id}))
            )
    );

    loadMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.loadMapProject),
                map(action => action.mapProjectReference),
                filter(mapProjectReference => !!mapProjectReference),
                distinctUntilChanged((previousMapProjectReference, currentMapProjectReference) =>
                    previousMapProjectReference.id == currentMapProjectReference.id),
                switchMap(mapProjectReference =>
                    mapProjectReference.state == MapProjectState.NONEXISTENT
                        ? this.dialog.open(NonexistentMapProjectEvictionConfirmDialog, {disableClose: true})
                            .afterClosed()
                            .pipe(map(() => UiActions.deleteMapProject({id: mapProjectReference.id})))
                        : this.printmapsService.loadMapProject(mapProjectReference)
                            .pipe(map(mapProject => UiActions.mapProjectSelected({mapProject: mapProject})))
                )
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

    ensureMapProjectIsUploadedAndDispatch = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.ensureMapProjectIsUploadedAndDispatch),
                withLatestFrom(this.store.select(currentMapProject)),
                map(([action, mapProject]) =>
                    <[MapProject, UploadMapProjectFollowUpAction]>
                        [action.mapProject ?? mapProject, action.followUpAction]),
                filter(([mapProject]) => !!mapProject),
                concatMap(([mapProject, followUpAction]) =>
                    zip(mapProject.modifiedLocally
                            ? this.printmapsService.createOrUpdateMapRenderingJob(mapProject)
                            : of(mapProject),
                        of(followUpAction)
                    )
                ),
                map(([mapProject, followUpAction]) =>
                    UiActions.mapProjectUploaded({
                        mapProjectReference: toMapProjectReference(mapProject),
                        followUpAction: followUpAction
                    })
                )
            )
    );

    mapProjectUploaded = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.mapProjectUploaded),
                filter(action => !!action.mapProjectReference?.id),
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
                filter(id => !!id),
                concatMap(id => zip(of(id), this.printmapsService.launchMapRenderingJob(id))),
                map(([id]) => UiActions.refreshMapProjectState({id: id}))
            )
    );

    downloadRenderedMapProject = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.downloadRenderedMapProject),
                withLatestFrom(this.store.select(currentMapProject)),
                map(([_, mapProject]) => mapProject),
                filter(mapProject => !!mapProject?.id),
                filter(mapProject => mapProject.state == MapProjectState.READY_FOR_DOWNLOAD),
                map(mapProject => this.printmapsService.downloadRenderedMapFile(mapProject.id)),
                ignoreElements()
            ),
        {
            dispatch: false
        }
    );

    autoSaveMapProjectReferences = createEffect(
        () => this.store
            .select(mapProjectReferences)
            .pipe(
                filter(currentMapProjectReferences => !!currentMapProjectReferences),
                concatMap(currentMapProjectReferences =>
                    this.mapProjectReferenceService.saveMapProjectReferences(currentMapProjectReferences)),
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
                filter(mapProject => !!mapProject),
                debounce(mapProject => mapProject.id ? this.configurationService.autoUploadDebounceTimer() : EMPTY),
                filter(mapProject => mapProject.modifiedLocally),
                map(mapProject => UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: mapProject}))
            )
    );

    refreshMapProjectState = createEffect(
        () => this.actions
            .pipe(
                ofType(UiActions.refreshMapProjectState),
                map(action => action.id),
                groupBy(identity),
                map(group =>
                    group.pipe(
                        switchMap(groupedId => of(groupedId).pipe(
                            expand(id => this.configurationService.deferUntilNextMapStatePolling(id)),
                            switchMap(id => zip(this.printmapsService.loadMapProjectState(id), of(id))),
                            map((mapProjectStateAndId, index) => [mapProjectStateAndId, index] as [[MapProjectState, string], number]),
                            takeWhile(([[mapProjectState, _id], index]) =>
                                    (index == 0
                                        || mapProjectState == MapProjectState.WAITING_FOR_RENDERING
                                        || mapProjectState == MapProjectState.RENDERING),
                                true),
                            map(([mapProjectStateAndId]) => mapProjectStateAndId),
                            distinctUntilChanged(
                                ([previousMapProjectState], [currentMapProjectState]) => previousMapProjectState == currentMapProjectState),
                            map(([mapProjectState, id]) =>
                                UiActions.mapProjectStateUpdated({id: id, mapProjectState: mapProjectState}))
                        ))
                    )
                ),
                mergeAll()
            )
    );

    constructor(
        private readonly store: Store<any>,
        private readonly actions: Actions,
        private readonly configurationService: ConfigurationService,
        private readonly mapProjectReferenceService: MapProjectReferenceService,
        private readonly printmapsService: PrintmapsService,
        private readonly dialog: MatDialog
    ) {
    }
}