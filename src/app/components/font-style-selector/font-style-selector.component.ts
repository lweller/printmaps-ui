import {FormBuilder, NgControl, Validators} from "@angular/forms";
import {Component, ElementRef, Inject, Optional, Self} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AbstractBaseMatFormFieldComponent} from "../common/abstract-base-mat-form-field.component";
import {FontStyle} from "../../model/intern/additional-element-style";
import {allValuesOf} from "../../utils/common.util";

@Component({
    selector: "font-style-selector",
    templateUrl: "./font-style-selector.component.html",
    styleUrls: ["./font-style-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: FontStyleSelector}]
})
export class FontStyleSelector extends AbstractBaseMatFormFieldComponent<FontStyle> {
    static readonly DEFAULT_VALUE = FontStyle.NORMAL;

    readonly iconNamespace = "fontsets";
    readonly values = allValuesOf(FontStyle);

    constructor(
        private elementRef: ElementRef<HTMLElement>,
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        formBuilder: FormBuilder,
        @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
        @Optional() @Self() ngControl: NgControl
    ) {
        super(formBuilder.control(
                FontStyleSelector.DEFAULT_VALUE,
                [
                    Validators.required
                ]),
            ngControl);
        this.values.forEach(value => this.registerIcon(value));
    }

    setDescribedByIds(ids: string[]) {
        const controlElement = this.elementRef.nativeElement
            .querySelector(".font-style-selector-container")!;
        controlElement.setAttribute("aria-describedby", ids.join(" "));
    }

    private registerIcon(iconName: string) {
        this.iconRegistry.addSvgIconInNamespace(this.iconNamespace, iconName,
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/${this.iconNamespace}/${iconName}.svg`));
    }
}