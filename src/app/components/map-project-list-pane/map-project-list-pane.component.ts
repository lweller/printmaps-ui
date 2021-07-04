import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {mapProjectReferences, selectedMapProjectReference} from "../../model/intern/printmaps-ui-state";
import {distinctUntilChanged, filter} from "rxjs/operators";
import {cloneDeep, isEqual} from "lodash";
import {MapProjectReference} from "../../model/intern/map-project-reference";
import * as UiActions from "../../actions/main.actions";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {MapProjectState, mapProjectStateTooltip} from "../../model/intern/map-project-state";
import {MatDialog} from "@angular/material/dialog";
import {Subjectize} from "subjectize";
import {ReplaySubject} from "rxjs";

@Component({
    selector: "app-map-project-list-pane",
    templateUrl: "./map-project-list-pane.component.html",
    styles: []
})
export class MapProjectListPaneComponent {
    mapProjectReferences: MapProjectReference[] = [];
    selectedMapProjectReference: MapProjectReference = undefined;
    @Subjectize("selectedMapProjectReference") selectedMapProjectReference$ = new ReplaySubject<MapProjectReference>(1);

    constructor(private store: Store<any>, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer,
                private dialog: MatDialog) {
        this.registerIcons();
        store
            .select(mapProjectReferences)
            .subscribe(nextMapProjectReferences =>
                this.mapProjectReferences = cloneDeep(nextMapProjectReferences)
            );
        store
            .select(selectedMapProjectReference)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue))
            )
            .subscribe(nextSelectedMapProjectReference => {
                this.selectedMapProjectReference = cloneDeep(nextSelectedMapProjectReference);
            });
        this.selectedMapProjectReference$
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue)),
                filter(nextSelectedMapProjectReference =>
                    nextSelectedMapProjectReference && nextSelectedMapProjectReference.state != MapProjectState.NONEXISTENT)
            )
            .subscribe(nextSelectedMapProjectReference =>
                this.store.dispatch(UiActions.loadMapProject({mapProjectReference: nextSelectedMapProjectReference})));
        this.selectedMapProjectReference$
            .pipe(
                filter(nextSelectedMapProjectReference =>
                    nextSelectedMapProjectReference?.state == MapProjectState.NONEXISTENT)
            )
            .subscribe(nextSelectedMapProjectReference =>
                this.dialog.open(NonexistentMapProjectEvictionConfirmDialog, {disableClose: true})
                    .afterClosed()
                    .subscribe(() =>
                        this.store.dispatch(UiActions.deleteMapProject({id: nextSelectedMapProjectReference.id}))));
    }

    updateSelectedMapProjectReference(selectedMapProjectReferenceIds: string) {
        this.selectedMapProjectReference = this.mapProjectReferences
            ?.filter(mapProjectReference => mapProjectReference.id == selectedMapProjectReferenceIds)[0];
    }

    public mapProjectStateTooltip(state: MapProjectState) {
        return mapProjectStateTooltip(state);
    }

    private registerIcons() {
        for (const mapProjectState of Object.values(MapProjectState)) {
            this.iconRegistry.addSvgIconInNamespace("map-project-state", mapProjectState,
                this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/map-project-state/${mapProjectState}.svg`));
        }
    }
}

@Component({
    selector: "app-nonexistent-map-project-eviction-confirm-dialog",
    templateUrl: "./nonexistent-map-project-eviction-confirm-dialog.component.html",
    styles: []
})
export class NonexistentMapProjectEvictionConfirmDialog {
}