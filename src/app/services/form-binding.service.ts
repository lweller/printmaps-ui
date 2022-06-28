import {Injectable} from "@angular/core";
import {ActionCreator, Selector, Store} from "@ngrx/store";
import {AbstractControl} from "@angular/forms";
import {distinctUntilChanged} from "rxjs/operators";
import {isArray, isEqual} from "lodash";

@Injectable()
export class FormBindingService {

    constructor(private store: Store) {
    }

    bindAction(controls: AbstractControl | AbstractControl[], action: ActionCreator<string, any>) {
        (isArray(controls) ? controls : [controls]).forEach(
            control => control.valueChanges
                .pipe(distinctUntilChanged(isEqual))
                .subscribe(value => this.store.dispatch(action(value)))
        );
    }

    bindSelector(controls: AbstractControl | AbstractControl[], selector: Selector<any, any>) {
        this.store.select(selector)
            .pipe(distinctUntilChanged(isEqual))
            .subscribe(value =>
                (isArray(controls) ? controls : [controls]).forEach(control => control.patchValue(value)));
    }
}