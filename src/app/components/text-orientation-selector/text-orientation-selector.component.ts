import {ControlValueAccessor, FormBuilder, FormControl, NgControl} from "@angular/forms";
import {Component, ElementRef, HostBinding, Inject, Input, OnDestroy, Optional, Self} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {Subject, Subscription} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {filter} from "rxjs/operators";

@Component({
    selector: "text-orientation-selector",
    templateUrl: "./text-orientation-selector.component.html",
    styleUrls: ["./text-orientation-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: TextOrientationSelector}]
})
export class TextOrientationSelector implements MatFormFieldControl<number>, ControlValueAccessor, OnDestroy {
    private static nextId = 0;
    readonly controlType = "text-orientation-selector";
    readonly iconNamespace = "text-orientations";
    readonly values = [0, 90, 270, 180];
    readonly placeholder = undefined;
    readonly stateChanges = new Subject<void>();
    @HostBinding("class.floating") shouldLabelFloat = true;
    focused = false;
    touched = false;
    @HostBinding() readonly id = `text-orientation-selector-${TextOrientationSelector.nextId++}`;
    @Input("aria-describedby") userAriaDescribedBy: string;

    formControl: FormControl;

    private subscriptions: Subscription[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private _elementRef: ElementRef<HTMLElement>,
        @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
        @Optional() @Self() public ngControl: NgControl
    ) {
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
        this.formControl = formBuilder.control(0);
        this.values.forEach(value => this.registerIcon(value));
    }

    @Input()
    get value(): number {
        return parseInt(this.formControl.value);
    }

    set value(value) {
        this.formControl.setValue(value);
        this.stateChanges.next();
    }

    get empty() {
        return !this.formControl.value;
    }

    private _required = false;

    @Input()
    get required() {
        return this._required;
    }

    set required(required) {
        this._required = coerceBooleanProperty(required);
        this.stateChanges.next();
    }

    private _disabled = false;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(disabled: boolean) {
        this._disabled = coerceBooleanProperty(disabled);
        this.stateChanges.next();
    }

    get errorState(): boolean {
        return false;
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    onTouched = () => {
        // This is intentional
    };

    setDescribedByIds(ids: string[]) {
        const controlElement = this._elementRef.nativeElement
            .querySelector(".text-orientation-selector-container")!;
        controlElement.setAttribute("aria-describedby", ids.join(" "));
    }

    onContainerClick(event: MouseEvent): void {
        // This is intentional
    }

    writeValue(value: number | null): void {
        this.value = value;
        this.formControl.patchValue(value);
    }

    registerOnChange(callbackFunction: any): void {
        this.subscriptions.push(this.formControl.valueChanges
            .pipe(filter(newValue => newValue != this.value))
            .subscribe(callbackFunction));
    }

    registerOnTouched(callbackFunction: any): void {
        this.onTouched = callbackFunction;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }

    toIconName(textOrientation: number) {
        switch (textOrientation) {
            case 0:
                return "normal";
            case 90:
                return "vertical-up";
            case 270:
                return "vertical-down";
            case 180:
                return "upside-down";
            default:
                return undefined;
        }
    }

    private registerIcon(textOrientation: number) {
        let iconName = this.toIconName(textOrientation);
        this.iconRegistry.addSvgIconInNamespace(this.iconNamespace, iconName,
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/${this.iconNamespace}/${iconName}.svg`));
    }
}