import {FormBuilder, NgControl, Validators} from "@angular/forms";
import {Component, ElementRef, Inject, Optional, Self} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AbstractBaseMatFormFieldComponent} from "../common/abstract-base-mat-form-field.component";

@Component({
    selector: "text-orientation-selector",
    templateUrl: "./text-orientation-selector.component.html",
    styleUrls: ["./text-orientation-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: TextOrientationSelector}]
})
export class TextOrientationSelector extends AbstractBaseMatFormFieldComponent<number> {
    static readonly DEFAULT_VALUE = 0;

    readonly iconNamespace = "text-orientations";
    readonly values = [0, 90, 270, 180];

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        formBuilder: FormBuilder,
        @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder.control(
                TextOrientationSelector.DEFAULT_VALUE,
                [
                    Validators.required,
                    Validators.min(0),
                    Validators.max(359)
                ]),
            ngControl);
        this.values.forEach(value => this.registerIcon(value));
    }

    setDescribedByIds(ids: string[]) {
        const controlElement = this.elementRef.nativeElement
            .querySelector(".text-orientation-selector-container")!;
        controlElement.setAttribute("aria-describedby", ids.join(" "));
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