import {ControlValueAccessor, FormBuilder, NgControl} from "@angular/forms";
import {Component, ElementRef, HostBinding, Inject, Input, OnDestroy, Optional, Self} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {Subject} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

export enum FontStyle {
    NORMAL = "normal",
    ITALIC = "italic",
    BOLD = "bold"
}

@Component({
    selector: "font-style-selector",
    templateUrl: "./font-style-selector.component.html",
    styleUrls: ["./font-style-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: FontStyleSelector}]
})
export class FontStyleSelector implements MatFormFieldControl<FontStyle>, ControlValueAccessor, OnDestroy {
    private static nextId = 0;
    readonly controlType = "font-style-selector";
    readonly iconNamespace = "fontsets";
    readonly values = ["normal", "italic", "bold"];
    readonly placeholder = undefined;
    readonly stateChanges = new Subject<void>();
    @HostBinding("class.floating") shouldLabelFloat = true;
    focused = false;
    touched = false;
    @HostBinding() readonly id = `font-style-selector-${FontStyleSelector.nextId++}`;
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

    private _value: FontStyle;

    @Input()
    get value(): FontStyle {
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
            .querySelector(".font-style-selector-container")!;
        controlElement.setAttribute("aria-describedby", ids.join(" "));
    }

    onContainerClick(event: MouseEvent): void {
        // This is intentional
    }

    writeValue(fontStyle: FontStyle | null): void {
        this.value = fontStyle;
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

    private registerIcon(iconName: string) {
        this.iconRegistry.addSvgIconInNamespace(this.iconNamespace, iconName,
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/${this.iconNamespace}/${iconName}.svg`));
    }
}