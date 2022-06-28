import {Component, Injector, Input} from "@angular/core";
import {allValuesOf} from "../../utils/common.util";
import {MatFormFieldControl} from "@angular/material/form-field";
import {AbstractBaseMatFormFieldComponent} from "./abstract-base-mat-form-field.component";

@Component({
    selector: "enum-select",
    template: `
        <mat-select [formControl]="control">
            <mat-option *ngFor="let value of values" [value]=value class="mat-body">
                {{labelOf(value)}}
            </mat-option>
        </mat-select>`,
    providers: [
        {provide: MatFormFieldControl, useExisting: EnumSelectComponent}
    ]
})
export class EnumSelectComponent extends AbstractBaseMatFormFieldComponent<any> {
    @Input() type: any;
    @Input() labels: Map<any, string> | ((any) => string);

    constructor(injector: Injector) {
        super(injector);
    }

    get values() {
        return this.type ? allValuesOf(this.type) : [];
    }

    labelOf(value: any) {
        switch (true) {
            case this.labels instanceof Map:
                return (<Map<any, string>>this.labels).get(value) ?? value.toString();
            case this.labels instanceof Function:
                return (<(any) => string>this.labels)(value);
            default:
                return value.toString();
        }
    }
}