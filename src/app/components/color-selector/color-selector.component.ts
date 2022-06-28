import {AfterViewInit, Component, Injector, ViewChild, ViewContainerRef} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {ConnectionPositionPair, Overlay, OverlayRef} from "@angular/cdk/overlay";
import {takeUntil} from "rxjs/operators";
import {CdkPortal} from "@angular/cdk/portal";
import {ColorEvent, ColorMode, RGBA} from "ngx-color";
import {TinyColor} from "@ctrl/tinycolor";
import {AbstractBaseMatFormFieldComponent} from "../common/abstract-base-mat-form-field.component";
import {Subject} from "rxjs";

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
export class ColorSelector extends AbstractBaseMatFormFieldComponent<Color> implements AfterViewInit {
    static readonly DEFAULT_VALUE = {rgbHexValue: "#000000", opacity: 1};

    readonly ColorMode = ColorMode;

    @ViewChild("colorField") private colorPickerOrigin: HTMLElement;
    @ViewChild("colorPicker") private colorPickerTemplate: CdkPortal;

    private readonly unsubscribe = new Subject<void>();
    private colorPickerOverlayRef: OverlayRef;

    constructor(
        private viewContainerRef: ViewContainerRef,
        private overlay: Overlay,
        private injector: Injector
    ) {
        super(injector);
    }

    get rgbaValue(): RGBA {
        let color = new TinyColor(this.value.rgbHexValue).setAlpha(this.value.opacity);
        return {r: color.r, b: color.b, g: color.g, a: color.a};
    }

    onColorChange(event: ColorEvent) {
        this.writeValue({
            rgbHexValue: event.color.hex,
            opacity: event.color.source == "hex" ? this.value.opacity : event.color.rgb.a
        });
    }

    ngAfterViewInit() {
        this.createColorPicker();
    }

    ngOnDestroy() {
        this.closeColorPicker();
        this.unsubscribe.next();
        this.unsubscribe.complete();
        super.ngOnDestroy();
    }

    public openColorPicker(): void {
        if (!this.disabled && !this.colorPickerOverlayRef.hasAttached()) {
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
        if (this.colorPickerOverlayRef?.hasAttached()) {
            this.colorPickerOverlayRef.detach();
        }
    }
}