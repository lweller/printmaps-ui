import {Component, Injector} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";
import {AbstractBaseMatFormFieldComponent} from "../common/abstract-base-mat-form-field.component";

@Component({
    selector: "line-width-selector",
    templateUrl: "./line-width-selector.component.html",
    styleUrls: ["./line-width-selector.component.css"],
    providers: [{provide: MatFormFieldControl, useExisting: LineWidthSelector}]
})
export class LineWidthSelector extends AbstractBaseMatFormFieldComponent<number> {
    static readonly DEFAULT_VALUE = 2;

    readonly iconNamespace = "line-width";
    readonly values = [2, 4, 6];

    constructor(
        private iconRegistry: MatIconRegistry,
        private sanitizer: DomSanitizer,
        private injector: Injector
    ) {
        super(injector);
        this.values.forEach(value => this.registerIcon(value));
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