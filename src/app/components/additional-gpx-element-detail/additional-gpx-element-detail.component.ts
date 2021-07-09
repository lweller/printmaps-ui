import {Component, Input, OnDestroy, Self} from "@angular/core";
import {AdditionalGpxElement} from "../../model/intern/additional-element";
import {ControlValueAccessor, FormBuilder, FormGroup, NgControl} from "@angular/forms";
import {Subject, Subscription} from "rxjs";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {switchMap, takeUntil} from "rxjs/operators";
import {FileInput} from "ngx-material-file-input";
import {Color} from "../color-selector/color-selector.component";

@Component({
    selector: "app-additional-gpx-element-detail",
    templateUrl: "./additional-gpx-element-detail.component.html",
    styles: [`
        .collapsable {
            overflow: hidden;
        }
    `],
    animations: [
        trigger("detailExpand", [
            state("collapsed", style({height: "0px", minHeight: "0"})),
            state("expanded", style({height: "*"})),
            transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
        ])
    ]
})
export class AdditionalGpxElementDetailComponent implements ControlValueAccessor, OnDestroy {

    @Input() disabled = false;

    startPropagateChanges = new Subject();
    endPropagateChanges = new Subject();
    element: AdditionalGpxElement;
    form: FormGroup;
    @Input() mapProjectId: string;
    private subscriptions: Subscription[] = [];

    constructor(private formBuilder: FormBuilder,
                @Self() public ngControl: NgControl) {
        this.form = formBuilder.group({
            file: [undefined],
            style: formBuilder.group({
                lineWidth: 4,
                lineColor: [{
                    rgbHexValue: "#0000ff",
                    opacity: 0.4
                } as Color]
            })
        });

        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }

        this.startPropagateChanges.next();
    }

    private _expanded = false;

    @Input() get expanded() {
        return this._expanded;
    }

    set expanded(expanded) {
        this._expanded = expanded;
    }

    onTouched = () => {
        // This is intentional
    };

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    registerOnChange(callbackFunction: any): void {
        this.subscriptions.push(
            this.startPropagateChanges
                .pipe(switchMap(() => this.form.valueChanges.pipe(takeUntil(this.endPropagateChanges))))
                .subscribe(updatedElement => {
                        if (updatedElement?.file?.files?.length > 0) {
                            updatedElement.file.files[0].text().then(gpxTrack =>
                                callbackFunction({
                                        ...this.element,
                                        style: {
                                            ...this.element.style,
                                            ...updatedElement.style
                                        },
                                        file: {
                                            name: updatedElement.file.fileNames,
                                            data: gpxTrack,
                                            modified: new Date().getTime()
                                        }
                                    }
                                )
                            );
                        }
                    }
                )
        );
    }

    registerOnTouched(callbackFunction: any): void {
        this.onTouched = callbackFunction;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }

    writeValue(element: AdditionalGpxElement) {
        this.element = element;
        this.endPropagateChanges.next();
        if (element?.file?.name && !this.form.value?.file) {
            this.form.patchValue({file: new FileInput([new File([], element.file.name)])});
        }
        this.form.patchValue({style: element?.style});
        this.startPropagateChanges.next();
    }

    elementName() {
        return this.element?.file?.name ?? $localize`No file selected`;
    }
}
