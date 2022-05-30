import {Component, ElementRef, Host, Optional} from "@angular/core";
import {AdditionalElement, AdditionalElementType, AnyAdditionalElement} from "../../model/intern/additional-element";
import {distinctUntilChanged, filter, map} from "rxjs/operators";
import {assignIn, cloneDeep, isEqual} from "lodash";
import {Store} from "@ngrx/store";
import * as UiActions from "../../actions/main.actions";
import {timer} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {
    currentAdditionalElements,
    currentMapProject,
    selectedAdditionalElementId
} from "../../selectors/main.selectors";

@Component({
    selector: "app-additional-element-list",
    templateUrl: "./additional-element-list.component.html",
    styleUrls: ["./additional-element-list.component.scss"],
    animations: [
        trigger("expansionIndicator", [
            state("collapsed", style({transform: "rotate(0deg)"})),
            state("expanded", style({transform: "rotate(180deg)"})),
            transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
        ])
    ]
})
export class AdditionalElementListComponent {

    AdditionalElementType = AdditionalElementType;

    additionalElements: AdditionalElement[] = [];
    selectedElementId = undefined;

    mapProjectId: string;

    @Host() elementHostRef: HTMLElement;

    constructor(@Optional() private elementRef: ElementRef<HTMLElement>,
                private store: Store<any>) {
        store
            .select(currentAdditionalElements)
            .pipe(
                filter(nextValue => !isEqual(this.additionalElements, nextValue))
            )
            .subscribe(nextAdditionalElements => this.additionalElements = cloneDeep(nextAdditionalElements));
        store
            .select(selectedAdditionalElementId)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) => isEqual(previousValue, nextValue))
            )
            .subscribe(nextValue => this.expand(nextValue));
        store.select(currentMapProject)
            .pipe(
                map(mapProject => mapProject?.id),
                distinctUntilChanged((previousValue, nextValue) => isEqual(previousValue, nextValue))
            )
            .subscribe(nextValue => this.mapProjectId = nextValue);
    }

    dispatchElementChanged(updatedElement: AnyAdditionalElement) {
        let element = this.additionalElements.find(currentElement => currentElement.id == updatedElement.id);
        if (element && !isEqual(element, updatedElement)) {
            assignIn(element, updatedElement);
            this.store.dispatch(UiActions.updateAdditionalElement({element: updatedElement}));
        }
    }

    expand(elementId: string) {
        this.selectedElementId = elementId;
        if (this.selectedElementId) {
            this.store.dispatch(UiActions.selectAdditionalElement({id: elementId}));
            timer(300).subscribe(() => this.elementRef.nativeElement
                .scrollIntoView({behavior: "smooth"}));
        }
    }

    collapse() {
        this.selectedElementId = undefined;
        this.store.dispatch(UiActions.selectAdditionalElement({id: undefined}));
    }

    toggleExpansion(elementId: string) {
        if (this.selectedElementId === elementId) {
            this.collapse();
        } else {
            this.expand(elementId);
        }
    }
}
