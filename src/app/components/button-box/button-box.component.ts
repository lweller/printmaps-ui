import {Component, Inject, LOCALE_ID} from "@angular/core";
import {MapProject} from "../../model/intern/map-project";
import {Store} from "@ngrx/store";
import {distinctUntilChanged} from "rxjs/operators";
import {cloneDeep, isEqual} from "lodash";
import {currentMapProject} from "../../model/intern/printmaps-ui-state";
import {MapProjectState} from "../../model/intern/map-project-state";
import * as UiActions from "../../actions/main.actions";
import {ConfigurationService} from "../../services/configuration.service";

@Component({
    selector: "app-button-box",
    templateUrl: "./button-box.component.html",
    styles: []
})
export class ButtonBoxComponent {
    currentMapProject: MapProject = undefined;

    constructor(private readonly configurationService: ConfigurationService,
                @Inject(LOCALE_ID) private readonly locale: string,
                private store: Store<any>) {
        store
            .select(currentMapProject)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue))
            )
            .subscribe(nextCurrentMapProject => {
                this.currentMapProject = nextCurrentMapProject?.id ? cloneDeep(nextCurrentMapProject) : undefined;
            });
    }

    isDeleteDisabled(): boolean {
        return !this.currentMapProject;
    }

    isLaunchRenderingDisabled(): boolean {
        return this.currentMapProject?.state != MapProjectState.NOT_RENDERED;
    }

    isDownloadDisabled(): boolean {
        return this.currentMapProject?.state != MapProjectState.READY_FOR_DOWNLOAD;
    }

    createMapProject() {
        let name = $localize`New Map Project ${new Date().toLocaleString(this.locale)}`;
        this.store.dispatch(UiActions.createMapProject({name: name}));
    }

    deleteMapProject(id: string) {
        this.store.dispatch(UiActions.deleteMapProject({id: id}));
    }

    launchMapProjectRendering(mapProject: MapProject) {
        this.store.dispatch(UiActions.uploadMapProject({
            mapProject: mapProject,
            followUpAction: "launchRendering"
        }));
    }

    downloadRenderedMapFile(id: string) {
        window.open(`${this.configurationService.appConf.printmapsApiBaseUri}/mapfile/${id}`, "_self");
    }
}