import {Component, Injector} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
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
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private injector: Injector
    ) {
        super(injector);
        this.values.forEach(value => this.registerIcon(value));
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