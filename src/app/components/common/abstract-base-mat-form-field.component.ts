import {ControlValueAccessor, FormControl, NgControl, ValidationErrors} from "@angular/forms";
import {Component, HostBinding, Input, OnDestroy} from "@angular/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {Subject, Subscription} from "rxjs";
import {distinct, tap} from "rxjs/operators";

@Component({template: ""})
export abstract class AbstractBaseMatFormFieldComponent<T> implements MatFormFieldControl<T>, ControlValueAccessor, OnDestroy {
    private static nextId = 0;
    @HostBinding() readonly id = `component-${AbstractBaseMatFormFieldComponent.nextId++}`;
    readonly placeholder = undefined;
    readonly stateChanges = new Subject<void>();
    @HostBinding("class.floating") shouldLabelFloat = true;
    focused = false;
    public ngControl: NgControl;
    private onChangeSubscription: Subscription;

    protected constructor(
        public formControl: FormControl,
        ngControl: NgControl
    ) {
        this.ngControl = ngControl;
        if (this.ngControl != null) {
            this.ngControl.valueAccessor = this;
        }
    }

    @Input()
    get value(): T {
        return this.formControl.value;
    }

    set value(value: T | null) {
        this.formControl.patchValue(value);
    }

    get empty() {
        return !this.formControl.value;
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
        return !!this.formControl.errors;
    }

    get errors(): ValidationErrors | null {
        return this.formControl.errors;
    }

    ngOnDestroy() {
        this.stateChanges.complete();
        this.onChangeSubscription?.unsubscribe();
    }

    convertToString(value: T): string {
        return value?.toString() ?? "";
    }

    onTouched = () => {
        // This is intentional
    };

    abstract setDescribedByIds(ids: string[]);

    onContainerClick(): void {
        // This is intentional
    }

    writeValue(value: T): void {
        this.value = value;
    }

    registerOnChange(callbackFunction: any): void {
        this.onChangeSubscription?.unsubscribe();
        if (callbackFunction) {
            this.onChangeSubscription =
                this.formControl.valueChanges
                    .pipe(distinct(), tap(() => this.stateChanges.next()))
                    .subscribe(callbackFunction);
        }
    }

    registerOnTouched(callbackFunction: any): void {
        this.onTouched = callbackFunction;
    }

    setDisabledState(disabled: boolean): void {
        this.disabled = disabled;
    }
}