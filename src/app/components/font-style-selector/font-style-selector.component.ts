import {Component, Injector} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
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
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private injector: Injector
    ) {
        super(injector);
        this.values.forEach(value => this.registerIcon(value));
    }

    private registerIcon(iconName: string) {
        this.iconRegistry.addSvgIconInNamespace(this.iconNamespace, iconName,
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/${this.iconNamespace}/${iconName}.svg`));
    }
}