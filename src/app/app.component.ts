import {Component, OnInit} from "@angular/core";
import {Store} from "@ngrx/store";
import * as UiActions from "./actions/main.actions";
import {mapProjectReferences} from "./model/intern/printmaps-ui-state";
import {filter, first} from "rxjs/operators";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit {

    constructor(private store: Store<any>) {
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
}
