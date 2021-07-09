import {ControlValueAccessor, FormBuilder, NgControl} from "@angular/forms";
import {Component, ElementRef, HostBinding, Inject, Input, OnDestroy, Optional, Self} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {Subject} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: "line-width-selector",
    templateUrl: "./line-width-selector.component.html",
    styleUrls: ["./line-width-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: LineWidthSelector}]
})
export class LineWidthSelector implements MatFormFieldControl<number>, ControlValueAccessor, OnDestroy {
    private static nextId = 0;
    readonly controlType = "line-width-selector";
    readonly iconNamespace = "line-width";
    readonly values = [2, 4, 6];
    readonly placeholder = undefined;
    readonly stateChanges = new Subject<void>();
    @HostBinding("class.floating") shouldLabelFloat = true;
    focused = false;
    @HostBinding() readonly id = `line-width-selector-${LineWidthSelector.nextId++}`;
    @Input("aria-describedby") userAriaDescribedBy: string;

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
        this.values.forEach(value => this.registerIcon(value));
    }

    private _value = this.values[0];

    @Input()
    get value(): number {
        return this._value;
    }

    set value(value) {
        this._value = value;
        this.stateChanges.next();
    }

    get empty() {
        return !this._value;
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

    onChange = (_: any) => {
        // This is intentional
    };

    onTouched = () => {
        // This is intentional
    };

    ngOnDestroy() {
        this.stateChanges.complete();
    }

    setDescribedByIds(ids: string[]) {
        const controlElement = this._elementRef.nativeElement
            .querySelector(".line-width-selector-container")!;
        controlElement.setAttribute("aria-describedby", ids.join(" "));
    }

    onContainerClick(_event: MouseEvent): void {
        // This is intentional
    }

    writeValue(value: number | null): void {
        this.value = value;
    }

    registerOnChange(callbackFunction: any): void {
        this.onChange = callbackFunction;
    }

    registerOnTouched(callbackFunction: any): void {
        this.onTouched = callbackFunction;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }

    toIconName(lineWidth: number) {
        switch (lineWidth) {
            case 2:
                return "thin";
            case 4:
                return "medium";
            case 6:
                return "thick";
            default:
                return undefined;
        }
    }

    private registerIcon(lineWidth: number) {
        let iconName = this.toIconName(lineWidth);
        this.iconRegistry.addSvgIconInNamespace(this.iconNamespace, iconName,
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/${this.iconNamespace}/${iconName}.svg`));
    }
}