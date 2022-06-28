import {MatFormFieldControl} from "@angular/material/form-field";
import {ControlValueAccessor} from "@angular/forms";

export class EventTestBed {
    public mock = {
        stateChanges: () => undefined,
        valueChanges: _value => undefined
    };

    private stateChangesSubscription;

    constructor(private component: MatFormFieldControl<any> & ControlValueAccessor) {
        spyOn(this.mock, "stateChanges");
        spyOn(this.mock, "valueChanges").and.callThrough();
        this.stateChangesSubscription = component.stateChanges.subscribe(this.mock.stateChanges);
        component.registerOnChange(this.mock.valueChanges);
    }

    public unregister() {
        this.stateChangesSubscription?.unsubscribe();
        this.stateChangesSubscription = null;
        this.component.registerOnChange(null);
    }
}