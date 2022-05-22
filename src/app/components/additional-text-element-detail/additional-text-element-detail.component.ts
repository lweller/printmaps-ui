import {Component, Input, OnDestroy, Self} from "@angular/core";
import {AdditionalElementType, AdditionalTextElement} from "../../model/intern/additional-element";
import {ControlValueAccessor, FormBuilder, FormGroup, NgControl, Validators} from "@angular/forms";
import {Color} from "../color-selector/color-selector.component";
import {Subject, Subscription} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {switchMap, takeUntil} from "rxjs/operators";
import {FontStyle} from "../../model/intern/additional-element-style";

@Component({
    selector: "app-additional-text-element-detail",
    templateUrl: "./additional-text-element-detail.component.html",
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
export class AdditionalTextElementDetailComponent implements ControlValueAccessor, OnDestroy {

    @Input() disabled = false;

    readonly AdditionalElementType = AdditionalElementType;
    startPropagateChanges = new Subject();
    endPropagateChanges = new Subject();
    element: AdditionalTextElement;
    form: FormGroup;

    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                @Self() public ngControl: NgControl) {
        this.form = formBuilder.group({
            text: [""],
            style: formBuilder.group({
                fontSize: [10, [Validators.min(4), Validators.max(100)]],
                fontStyle: [FontStyle.NORMAL],
                fontColor: [{
                    rgbHexValue: "#000000",
                    opacity: 1
                } as Color],
                textOrientation: [0, [Validators.min(0), Validators.max(360)]]
            }),
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
        switch (this.element?.type) {
            case AdditionalElementType.TEXT_BOX:
                return this.element.text;
            case AdditionalElementType.ATTRIBUTION:
                return $localize`Attribution`;
            default:
                return $localize`Unknown Element`;
        }
    }
}
