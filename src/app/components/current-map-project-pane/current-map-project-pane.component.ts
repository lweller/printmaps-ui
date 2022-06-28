import {Component, ViewChild} from "@angular/core";
import {Store} from "@ngrx/store";
import {cloneDeep, isEqual} from "lodash";
import * as UiActions from "../../actions/main.actions";
import {MapProject} from "../../model/intern/map-project";
import {distinctUntilChanged, filter} from "rxjs/operators";
import {MapProjectState} from "../../model/intern/map-project-state";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {ADDITIONAL_ELEMENT_TYPES, AdditionalElementType} from "../../model/intern/additional-element";
import {MatExpansionPanel} from "@angular/material/expansion";
import {AdditionalElementListComponent} from "../additional-element-list/additional-element-list.component";
import {MatDialog} from "@angular/material/dialog";
import {currentMapProject, selectedAdditionalElementId} from "../../selectors/main.selectors";

@Component({
    selector: "app-current-map-project-pane",
    templateUrl: "./current-map-project-pane.component.html",
    styles: []
})
export class CurrentMapProjectPaneComponent {
    readonly additionalElementTypes = ADDITIONAL_ELEMENT_TYPES;

    mapProject: MapProject = undefined;
    selectedAdditionalElementId: string = undefined;

    generalPropertiesPartExpanded = false;
    mapAreaPartExpanded = true;
    additionalElementsPartExpanded = false;

    @ViewChild(AdditionalElementListComponent) additionalElementList: AdditionalElementListComponent;

    constructor(private store: Store<any>, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer,
                private dialog: MatDialog) {
        this.registerIcons();
        store
            .select(currentMapProject)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) => isEqual(previousValue, nextValue))
            )
            .subscribe(nextValue => {
                if (this.mapProject?.id && this.mapProject?.modifiedLocally && this.mapProject?.id != nextValue?.id) {
                    store.dispatch(UiActions.ensureMapProjectIsUploadedAndDispatch({mapProject: this.mapProject}));
                }
                this.mapProject = cloneDeep(nextValue);
            });
        store
            .select(selectedAdditionalElementId)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) => isEqual(previousValue, nextValue))
            )
            .subscribe(nextValue => this.selectedAdditionalElementId = cloneDeep(nextValue));
    }

    addAdditionalElement(type: AdditionalElementType) {
        this.additionalElementsPartExpanded = true;
        this.store.dispatch(UiActions.addAdditionalElement({elementType: type}));
    }

    removeAdditionalElement() {
        if (this.mapProject.additionalElements.find(element => element.id == this.selectedAdditionalElementId)?.type == AdditionalElementType.ATTRIBUTION) {
            this.dialog.open(RemoveAttributionConfirmDialog, {disableClose: true})
                .afterClosed()
                .pipe(filter(result => result))
                .subscribe(() =>
                    this.store.dispatch(UiActions.removeAdditionalElement({id: this.selectedAdditionalElementId})));
        } else {
            this.store.dispatch(UiActions.removeAdditionalElement({id: this.selectedAdditionalElementId}));
        }
    }

    scrollTo(panel: MatExpansionPanel) {
        panel._body.nativeElement.scrollIntoView({behavior: "smooth"});
    }

    private registerIcons() {
        for (const mapProjectState of Object.values(MapProjectState)) {
            this.iconRegistry.addSvgIconInNamespace("map-project-state", mapProjectState,
                this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/map-project-state/${mapProjectState}.svg`));
        }
        this.iconRegistry.addSvgIconInNamespace("edition-state", "edited-locally",
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/edition-state/edited-locally.svg`));
    }
}

@Component({
    selector: "app-remove-attribution-confirm-dialog.component",
    templateUrl: "./remove-attribution-confirm-dialog.component.html",
    styles: []
})
export class RemoveAttributionConfirmDialog {
}