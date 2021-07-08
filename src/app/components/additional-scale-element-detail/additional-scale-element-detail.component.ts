import {Component, Input, OnDestroy, Self} from "@angular/core";
import {AdditionalTextElement} from "../../model/intern/additional-element";
import {ControlValueAccessor, FormBuilder, FormGroup, NgControl} from "@angular/forms";
import {Subject, Subscription} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {switchMap, takeUntil} from "rxjs/operators";

@Component({
    selector: "app-additional-scale-element-detail",
    templateUrl: "./additional-scale-element-detail.component.html",
    styles: [`
        .collapsable {
            overflow: hidden;
        }
    `],
    animations: [
        trigger("detailExpand", [
            state("collapsed", style({height: "0px", minHeight: "0"})),
            state("expanded", style({height: "*"})),
            transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
        ])
    ]
})
export class AdditionalScaleElementDetailComponent implements ControlValueAccessor, OnDestroy {

    @Input() disabled = false;

    startPropagateChanges = new Subject();
    endPropagateChanges = new Subject();
    element: AdditionalTextElement;
    form: FormGroup;

    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                @Self() public ngControl: NgControl) {
        this.form = formBuilder.group({
            location: formBuilder.group({
                x: [0],
                y: [0]
            })
        });

        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }

        this.startPropagateChanges.next();
    }

    private _expanded = false;

    @Input() get expanded() {
        return this._expanded;
    }

    set expanded(expanded) {
        this._expanded = expanded;
    }

    onTouched = () => {
        // This is intentional
    };

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    registerOnChange(callbackFunction: any): void {
        this.subscriptions.push(
            this.startPropagateChanges
                .pipe(switchMap(() => this.form.valueChanges.pipe(takeUntil(this.endPropagateChanges))))
                .subscribe(updatedElement =>
                    callbackFunction({
                        ...this.element,
                        ...updatedElement,
                        style: {
                            ...this.element.style,
                            ...updatedElement.style
                        }
                    })
                )
        );
    }

    registerOnTouched(callbackFunction: any): void {
        this.onTouched = callbackFunction;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }

    writeValue(element: AdditionalTextElement) {
        this.element = element;
        this.endPropagateChanges.next();
        if (element) {
            this.form.patchValue(element);
        }
        this.startPropagateChanges.next();
    }

    elementName() {
        return $localize`Scale`;
    }
}
