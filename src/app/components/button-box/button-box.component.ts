import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import * as UiActions from "../../actions/main.actions";
import {
    isCurrentMapProjectCopiable,
    isCurrentMapProjectDeletable,
    isCurrentMapProjectDownloadable,
    isCurrentMapProjectRenderable
} from "../../selectors/main.selectors";

@Component({
    selector: "app-button-box",
    templateUrl: "./button-box.component.html",
    styles: []
})
export class ButtonBoxComponent {
    copyButtonDisabled = true;
    deleteButtonDisabled = true;
    launchRenderingButtonDisabled = true;
    downloadButtonDisabled = true;

    constructor(private store: Store<PrintmapsUiState>) {
        store.select(isCurrentMapProjectCopiable).subscribe(isCopiable => this.copyButtonDisabled = !isCopiable);
        store.select(isCurrentMapProjectDeletable).subscribe(isDeletable => this.deleteButtonDisabled = !isDeletable);
        store.select(isCurrentMapProjectRenderable).subscribe(isRenderable => this.launchRenderingButtonDisabled = !isRenderable);
        store.select(isCurrentMapProjectDownloadable).subscribe(isDownloadable => this.downloadButtonDisabled = !isDownloadable);
    }

    createMapProject() {
        this.store.dispatch(UiActions.createMapProject());
    }

    copyMapProject() {
        this.store.dispatch(UiActions.copyMapProject());
    }

    deleteMapProject() {
        this.store.dispatch(UiActions.deleteMapProject({}));
    }

    launchMapProjectRendering() {
        this.store.dispatch(UiActions.uploadMapProject({followUpAction: "launchRendering"}));
    }

    downloadRenderedMapFile() {
        this.store.dispatch(UiActions.downloadRenderedMapProject());
    }
}