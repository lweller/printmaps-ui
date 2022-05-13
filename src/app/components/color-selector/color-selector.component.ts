import {ControlValueAccessor, FormBuilder, NgControl} from "@angular/forms";
import {
    AfterViewInit,
    Component,
    ElementRef,
    HostBinding,
    Inject,
    Injector,
    Input,
    OnDestroy,
    Optional,
    Self,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {Subject} from "rxjs";
import {coerceBooleanProperty} from "@angular/cdk/coercion";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {ConnectionPositionPair, Overlay, OverlayRef} from "@angular/cdk/overlay";
import {takeUntil} from "rxjs/operators";
import {CdkPortal} from "@angular/cdk/portal";
import {ColorEvent, ColorMode, RGBA} from "ngx-color";
import {isEqual} from "lodash";
import {TinyColor} from "@ctrl/tinycolor";

export interface Color {
    rgbHexValue: string;
    opacity: number;
}

@Component({
    selector: "color-selector",
    templateUrl: "./color-selector.component.html",
    styleUrls: ["./color-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: ColorSelector}]
})
export class ColorSelector implements MatFormFieldControl<Color>, ControlValueAccessor, OnDestroy, AfterViewInit {
    private static nextId = 0;
    readonly ColorMode = ColorMode;
    readonly controlType = "color-selector";
    readonly placeholder = undefined;
    readonly stateChanges = new Subject<void>();
    readonly unsubscribe = new Subject<void>();

    @HostBinding() readonly id = `color-selector-${ColorSelector.nextId++}`;
    @HostBinding("class.floating") shouldLabelFloat = true;
    focused = false;
    touched = false;

    @Input("aria-describedby") userAriaDescribedBy: string;

    @ViewChild("colorField") colorPickerOrigin: HTMLElement;
    @ViewChild("colorPicker") colorPickerTemplate: CdkPortal;

    private colorPickerOverlayRef: OverlayRef;

    private formBuilder: FormBuilder;
    private overlay: Overlay;
    private iconRegistry: MatIconRegistry;
    private sanitizer: DomSanitizer;

    constructor(
        private injector: Injector,
        private elementRef: ElementRef<HTMLElement>,
        private viewContainerRef: ViewContainerRef,
        @Optional() @Inject(MAT_FORM_FIELD) public formField: MatFormField,
        @Optional() @Self() public ngControl: NgControl
    ) {
        this.formBuilder = injector.get<FormBuilder>(FormBuilder);
        this.overlay = injector.get<Overlay>(Overlay);
        this.iconRegistry = injector.get<MatIconRegistry>(MatIconRegistry);
        this.sanitizer = injector.get<DomSanitizer>(DomSanitizer);

        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    private _value: Color;

    @Input()
    get value(): Color {
        return this._value;
    }

    set value(value) {
        if (!isEqual(this._value, value)) {
            this._value = value;
            this.stateChanges.next();
        }
    }

    get rgbaValue(): RGBA {
        let color = new TinyColor(this._value.rgbHexValue).setAlpha(this._value.opacity);
        return {r: color.r, b: color.b, g: color.g, a: color.a};
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

    updateColor(event: ColorEvent) {
        this.value = {
            rgbHexValue: event.color.hex,
            opacity: event.color.source == "hex" ? this.value.opacity : event.color.rgb.a
        };
        this.onChange(this.value);
    }

    onChange = (_: any) => {
        // This is intentional
    };

    onTouched = () => {
        // This is intentional
    };

    ngAfterViewInit() {
        this.createColorPicker();
    }

    ngOnDestroy() {
        this.closeColorPicker();
        this.stateChanges.complete();
        this.unsubscribe.next();
        this.unsubscribe.complete();
    }

    setDescribedByIds(ids: string[]) {
        const controlElement = this.elementRef.nativeElement
            .querySelector(".color-selector-container")!;
        controlElement.setAttribute("aria-describedby", ids.join(" "));
    }

    onContainerClick(_event: MouseEvent): void {
        // This is intentional
    }

    writeValue(value: Color | null): void {
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

    public openColorPicker(): void {
        if (!this._disabled && !this.colorPickerOverlayRef.hasAttached()) {
            this.colorPickerOverlayRef.attach(new CdkPortal(this.colorPickerTemplate.templateRef, this.viewContainerRef));
        }
    }

    private createColorPicker() {
        const scrollStrategy = this.overlay.scrollStrategies.close();
        const positionStrategy = this.overlay
            .position()
            .flexibleConnectedTo(this.colorPickerOrigin)
            .withPositions([
                new ConnectionPositionPair({originX: "end", originY: "top"}, {
                    overlayX: "start",
                    overlayY: "top"
                }, 5, 0),
                new ConnectionPositionPair({originX: "end", originY: "bottom"}, {
                    overlayX: "start",
                    overlayY: "bottom"
                }, 5, 0)
            ])
            .withPush(false);

        this.colorPickerOverlayRef = this.overlay.create({
            positionStrategy,
            scrollStrategy,
            hasBackdrop: true,
            backdropClass: "cdk-overlay-transparent-backdrop"
        });

        this.colorPickerOverlayRef
            .backdropClick()
            .pipe(takeUntil(this.unsubscribe))
            .subscribe(() => {
                this.closeColorPicker();
            });
    }

    private closeColorPicker(): void {
        if (this.colorPickerOverlayRef.hasAttached()) {
            this.colorPickerOverlayRef.detach();
        }
    }
}