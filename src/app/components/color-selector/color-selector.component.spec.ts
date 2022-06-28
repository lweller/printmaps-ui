import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MatRippleModule} from "@angular/material/core";
import {ColorSelector} from "./color-selector.component";
import {Overlay, OverlayModule} from "@angular/cdk/overlay";
import {ColorSketchModule} from "ngx-color/sketch";
import {PortalModule} from "@angular/cdk/portal";

const rgb2hex = (rgb) => `#${rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/).slice(1).map(n => parseInt(n, 10).toString(16).padStart(2, "0")).join("")}`;

describe("ColorSelector", () => {
    let SAMPLE_COLOR = {
        rgbHexValue: "#123456",
        opacity: 0.5
    };

    let fixture: ComponentFixture<ColorSelector>;

    let component: ColorSelector;

    let colorFieldSample: HTMLElement;
    let colorField: HTMLElement;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatRippleModule, ReactiveFormsModule, FormsModule, ColorSketchModule, PortalModule, OverlayModule],
            declarations: [ColorSelector],
            providers: [FormBuilder, Overlay],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(ColorSelector);
        component = fixture.componentInstance;
        component.formControl = TestBed.inject(FormBuilder).control(undefined);
        spyOn(component, "openColorPicker");
        colorField = fixture.nativeElement.querySelector(".color-field");
        colorFieldSample = fixture.nativeElement.querySelector(".color-field-sample");
    });

    it("should create", async () => {
        // when component is created

        // then
        expect(component).toBeDefined();
    });

    it("should update display color sample when it is written to component", () => {
        // when
        component.writeValue(SAMPLE_COLOR);
        fixture.detectChanges();

        // then
        expect(rgb2hex(colorFieldSample.style.backgroundColor))
            .withContext("RGB (hex string) value of selected color")
            .toBe(SAMPLE_COLOR.rgbHexValue);
        expect(colorFieldSample.style.opacity)
            .withContext("opacity of selected color")
            .toBe(SAMPLE_COLOR.opacity.toString());
        expect(component.rgbaValue).toEqual({r: 18, b: 86, g: 52, a: 0.5});
    });

    it("should open color picker when clicking on color sample", () => {
        // when
        colorField.click();

        // then
        expect(component.openColorPicker).toHaveBeenCalled();
    });
});