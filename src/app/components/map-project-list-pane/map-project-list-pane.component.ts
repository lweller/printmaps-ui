import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {cloneDeep, isEmpty} from "lodash";
import {MapProjectReference} from "../../model/intern/map-project-reference";
import * as UiActions from "../../actions/main.actions";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {MapProjectState, mapProjectStateTooltip} from "../../model/intern/map-project-state";
import {mapProjectReferences, selectedMapProjectReference} from "../../selectors/main.selectors";
import {compareById, updateListById} from "../../utils/common.util";

@Component({
    selector: "app-map-project-list-pane",
    templateUrl: "./map-project-list-pane.component.html",
    styles: []
})
export class MapProjectListPaneComponent {
    mapProjectReferences: MapProjectReference[] = [];
    selectedMapProjectReferences: MapProjectReference[] = [];

    constructor(private store: Store<any>, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
        this.registerIcons();
        store.select(mapProjectReferences)
            .subscribe(nextMapProjectReferences =>
                this.mapProjectReferences = updateListById(this.mapProjectReferences, nextMapProjectReferences)
            );
        store.select(selectedMapProjectReference)
            .subscribe(nextSelectedMapProjectReference =>
                this.selectedMapProjectReferences = nextSelectedMapProjectReference
                    ? [cloneDeep(nextSelectedMapProjectReference)]
                    : []
            );
    }

    mapProjectReferenceSelected(mapProjectReference: MapProjectReference) {
        if (!isEmpty(mapProjectReference)) {
            this.store.dispatch(UiActions.loadMapProject({mapProjectReference: mapProjectReference[0]}));
        }
    }

    compareMapProjectReferences = compareById;

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