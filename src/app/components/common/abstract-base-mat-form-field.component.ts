import {ControlContainer, ControlValueAccessor, FormControl, NgControl, ValidationErrors} from "@angular/forms";
import {Component, ElementRef, HostBinding, InjectFlags, Injector, Input, OnDestroy} from "@angular/core";
import {MAT_FORM_FIELD, MatFormField, MatFormFieldControl} from "@angular/material/form-field";
import {Subject, Subscription} from "rxjs";
import {distinct, tap} from "rxjs/operators";
import {isEqual} from "lodash";

@Component({template: ""})
export abstract class AbstractBaseMatFormFieldComponent<T>
    implements MatFormFieldControl<T>, ControlValueAccessor, OnDestroy {

    private static nextId = 0;

    @HostBinding() readonly id = `component-${AbstractBaseMatFormFieldComponent.nextId++}`;
    @HostBinding("class.floating") shouldLabelFloat = true;

    @Input() formControl: FormControl;
    @Input() formControlName: string;

    get control() {
        return this.formControl || <FormControl>this.controlContainer?.control?.get(this.formControlName);
    }

    set control(formControl: FormControl) {
        this.formControl = formControl;
    }

    readonly stateChanges = new Subject<void>();

    readonly placeholder = undefined;
    readonly focused = false;

    private onChangeSubscription: Subscription;

    public readonly ngControl: NgControl;
    private readonly controlContainer: ControlContainer;
    private readonly elementRef: ElementRef<HTMLElement>;
    private readonly formField: MatFormField;

    protected constructor(injector: Injector) {
        this.ngControl = injector.get(NgControl, null, InjectFlags.Self & InjectFlags.Optional);
        this.controlContainer = injector.get(ControlContainer, null);
        this.elementRef = injector.get(ElementRef);
        this.formField = injector.get(MAT_FORM_FIELD, null, InjectFlags.Optional);
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
        if (this.formField) {
            this.setDescribedByIds([this.formField.getLabelId()]);
        }
        this.formControlName = this.elementRef.nativeElement.getAttribute("formControlName");
    }

    @Input()
    get value(): T {
        return this.control.value;
    }

    set value(value: T | null) {
        if (!isEqual(value, this.value)) {
            this.control.setValue(value);
        }
    }

    get empty() {
        return !this.control.value;
    }

    private _required = false;

    @Input()
    get required() {
        return this._required;
    }

    set required(required: boolean) {
        this._required = required;
        this.stateChanges.next();
    }

    private _disabled = false;

    @Input()
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(disabled: boolean) {
        this._disabled = disabled;
        this.stateChanges.next();
    }

    get errorState(): boolean {
        return !!this.control.errors;
    }

    get errors(): ValidationErrors | null {
        return this.control.errors;
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.onChangeSubscription?.unsubscribe();
    }

    convertToString(value: T): string {
        return value?.toString() ?? "";
    }

    setDescribedByIds(ids: string[]) {
        this.elementRef.nativeElement.setAttribute("aria-describedby", ids.join(" "));
    }

    writeValue(value: T): void {
        this.value = value;
    }

    registerOnChange(callbackFunction: any): void {
        this.onChangeSubscription?.unsubscribe();
        if (callbackFunction) {
            this.onChangeSubscription =
                this.control.valueChanges
                    .pipe(
                        distinct(),
                        tap(() => this.stateChanges.next())
                    )
                    .subscribe(callbackFunction);
        }
    }

    onTouched = () => undefined;

    registerOnTouched(callbackFunction: any): void {
        this.onTouched = callbackFunction;
    }

    onContainerClick = () => undefined;

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }
}