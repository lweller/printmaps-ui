import {Component, Inject, LOCALE_ID, OnInit} from "@angular/core";
import {Store} from "@ngrx/store";
import * as UiActions from "./actions/main.actions";
import {mapProjectReferences} from "./model/intern/printmaps-ui-state";
import {filter, first} from "rxjs/operators";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AdditionalElementType} from "./model/intern/additional-element";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

    constructor(private store: Store<any>,
                @Inject(LOCALE_ID) public readonly locale: string,
                private iconRegistry: MatIconRegistry,
                private sanitizer: DomSanitizer) {
        this.registerIcons();
        store.dispatch(UiActions.loadMapProjectReferences());
        store.select(mapProjectReferences)
            .pipe(filter(loadedMapProjectReferences => !!loadedMapProjectReferences), first())
            .subscribe(loadedMapProjectReferences =>
                loadedMapProjectReferences?.forEach(mapProjectReference =>
                    store.dispatch(UiActions.refreshMapProjectState({id: mapProjectReference.id}))));
    }

    ngOnInit(): void {
        this.store.dispatch(UiActions.init());
    }

    private registerIcons() {
        this.registerIcon("actions", "add");
        this.registerIcon("actions", "delete");
        this.registerIcon("actions", "launch-rendering");
        this.registerIcon("actions", "download");
        for (const type of Object.values(AdditionalElementType)) {
            this.registerIcon("additional-elements", type);
        }
    }

    private registerIcon(namespace: string, iconName: string) {
        this.iconRegistry.addSvgIconInNamespace(namespace, iconName,
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/${namespace}/${iconName}.svg`));
    }
}
