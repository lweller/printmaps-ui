import {Component} from "@angular/core";
import {MapProject} from "../../model/intern/map-project";
import {Store} from "@ngrx/store";
import {currentMapProject, mapProjectReferences} from "../../model/intern/printmaps-ui-state";
import {distinctUntilChanged} from "rxjs/operators";
import {cloneDeep, isEqual} from "lodash";
import {MapProjectReference} from "../../model/intern/map-project-reference";
import * as UiActions from "../../actions/main.actions";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {MapProjectState, mapProjectStateTooltip} from "../../model/intern/map-project-state";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: "app-map-project-list-pane",
    templateUrl: "./map-project-list-pane.component.html",
    styles: []
})
export class MapProjectListPaneComponent {
    mapProjectReferences: MapProjectReference[] = [];
    currentMapProject: MapProject = undefined;

    constructor(private store: Store<any>, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer,
                private dialog: MatDialog) {
        this.registerIcons();
        store
            .select(mapProjectReferences)
            .subscribe(nextMapProjectReferences =>
                this.mapProjectReferences = cloneDeep(nextMapProjectReferences)
            )
        ;
        store
            .select(currentMapProject)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue))
            )
            .subscribe(nextCurrentMapProject => {
                this.currentMapProject = cloneDeep(nextCurrentMapProject);
            });
    }

    loadMapProject(selectedMapProjectReferenceIds: string) {
        let selectedMapProjectReference = this.mapProjectReferences
            ?.filter(mapProjectReference => mapProjectReference.id == selectedMapProjectReferenceIds)[0];
        if (!selectedMapProjectReference) {
            return;
        }
        if (selectedMapProjectReference.state == MapProjectState.NONEXISTENT) {
            this.dialog.open(NonexistentMapProjectEvictionConfirmDialog, {disableClose: true})
                .afterClosed()
                .subscribe(() =>
                    this.store.dispatch(UiActions.deleteMapProject({id: selectedMapProjectReference.id})));
            return;
        }
        if (this.currentMapProject) {
            this.store.dispatch(UiActions.uploadMapProject({
                mapProject: this.currentMapProject,
                followUpAction: "close"
            }));
        }
        if (this.currentMapProject?.id != selectedMapProjectReference.id) {
            this.store.dispatch(UiActions.loadMapProject({mapProjectReference: selectedMapProjectReference}));
        }
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