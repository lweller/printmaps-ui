import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Component, CUSTOM_ELEMENTS_SCHEMA, Injector} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatInputHarness} from "@angular/material/input/testing";
import {MatRippleModule} from "@angular/material/core";
import {MatFormFieldControl} from "@angular/material/form-field";
import {AbstractBaseMatFormFieldComponent} from "./abstract-base-mat-form-field.component";
import {cases} from "jasmine-parameterized";
import {EventTestBed} from "../../model/test/test-util";

@Component({
    template: "<input [formControl]=\"control\" type=\"number\" matInput numeric>",
    providers: [{provide: MatFormFieldControl, useClass: TestComponent}]
})
class TestComponent extends AbstractBaseMatFormFieldComponent<number> {
    static readonly DEFAULT_VALUE = 0;

    constructor(injector: Injector, formBuilder: FormBuilder) {
        super(injector);
        this.formControl = formBuilder.control(
            TestComponent.DEFAULT_VALUE,
            [
                Validators.required,
                Validators.min(0),
                Validators.max(359)
            ]);
    }
}

describe("AbstractBaseComponent", () => {
    const VALID_TEST_DATA = [
        {value: 0},
        {value: 90},
        {value: 180},
        {value: 270},
        {value: 30}
    ];

    const INVALID_TEST_DATA = [
        {value: null},
        {value: undefined}
    ];

    let fixture: ComponentFixture<TestComponent>;
    let loader: HarnessLoader;

    let component: TestComponent;

    let inputField: MatInputHarness;
    let eventTestBed: EventTestBed;

    const INITIAL_VALUE = TestComponent.DEFAULT_VALUE + 1 % 360;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatRippleModule, ReactiveFormsModule, FormsModule],
            declarations: [TestComponent],
            providers: [FormBuilder],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(TestComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        inputField = await loader.getHarness(MatInputHarness);

        // initialize to something other than default to ensure that all values are really updates
        await component.writeValue(INITIAL_VALUE);

        eventTestBed = new EventTestBed(component);
    });

    afterEach(() => {
        eventTestBed.unregister();
    });

    it("should create", async () => {
        // when component is created

        // then
        expect(component).toBeDefined();
        expect(component.value).withContext("value of component ").toBe(INITIAL_VALUE);
        expect(component.errorState).withContext("error state").toBeFalse();
        expect(await inputField.getValue()).withContext("value of input field").toBe(INITIAL_VALUE.toString());
    });

    cases(VALID_TEST_DATA)
        .it("should update value in subcomponents when it is written to component", async (data) => {
            // when
            await component.writeValue(data.value);

            // then
            expect(eventTestBed.mock.stateChanges)
                .withContext("number of state changes")
                .toHaveBeenCalledTimes(1);
            expect(eventTestBed.mock.valueChanges)
                .withContext("value change")
                .toHaveBeenCalledOnceWith(data.value);
            expect(component.value).withContext("value of component ").toBe(data.value);
            expect(component.errorState).withContext("error state").toBeFalse();
            expect(await inputField.getValue()).withContext("value of input field").toBe(data.value.toString());
        });

    cases(INVALID_TEST_DATA)
        .it("should update subcomponents to undefined/empty state and report an error when as invalid value is written to component", async (data) => {
            // when
            await component.writeValue(data.value);

            // then
            expect(component.errors?.["required"]).withContext("required validation error").toBeDefined();
            expect(eventTestBed.mock.stateChanges)
                .withContext("number of state changes")
                .toHaveBeenCalledTimes(1);
            expect(eventTestBed.mock.valueChanges)
                .withContext("value change")
                .toHaveBeenCalledOnceWith(data.value);
            expect(component.value).withContext("value of component ").toBeFalsy();
            expect(component.errorState).toBeTrue();
            expect(await inputField.getValue()).withContext("value of input field").toBe("");
        });

    it("should update subcomponents and report an error when a value below 0 is written to component", async () => {
        // when
        await component.writeValue(-1);

        // then
        expect(component.errors?.["min"]).withContext("min validation error").toBeDefined();
        expect(eventTestBed.mock.stateChanges)
            .withContext("number of state changes")
            .toHaveBeenCalledTimes(1);
        expect(eventTestBed.mock.valueChanges)
            .withContext("value change")
            .toHaveBeenCalledOnceWith(-1);
        expect(component.value).withContext("value of component ").toEqual(-1);
        expect(component.errorState).toBeTrue();
        expect(await inputField.getValue()).withContext("value of input field").toBe("-1");
    });


    it("should update subcomponents and report an error when a value above 359 is written to component", async () => {
        // when
        await component.writeValue(360);

        // then
        expect(component.errors?.["max"]).withContext("max validation error").toBeDefined();
        expect(eventTestBed.mock.stateChanges)
            .withContext("number of state changes")
            .toHaveBeenCalledTimes(1);
        expect(eventTestBed.mock.valueChanges)
            .withContext("value change")
            .toHaveBeenCalledOnceWith(360);
        expect(component.value).withContext("value of component ").toEqual(360);
        expect(component.errorState).toBeTrue();
        expect(await inputField.getValue()).withContext("value of input field").toBe("360");
    });

    cases(VALID_TEST_DATA)
        .it("should update checked button toggle and component value if value is entered", async (data) => {
            // when
            await inputField.setValue(data.value.toString());

            // then
            expect(eventTestBed.mock.stateChanges)
                .withContext("number of state changes")
                .toHaveBeenCalledTimes(data.value.toString().length + 1);
            expect(eventTestBed.mock.valueChanges)
                .withContext("value change")
                .toHaveBeenCalledWith(data.value);
            expect(component.value).withContext("value of component ").toBe(data.value);
            expect(component.errorState).withContext("error state").toBeFalse();
        });

    it("should not trigger value change callback when same value is set into input field", async () => {
        // given
        let someOtherValue = (TestComponent.DEFAULT_VALUE + 90 % 360).toString();

        // when
        await inputField.setValue(someOtherValue);
        await inputField.setValue(someOtherValue);

        // then
        expect(eventTestBed.mock.stateChanges)
            .withContext("number of state changes")
            .toHaveBeenCalledTimes(1 + someOtherValue.length);
        expect(eventTestBed.mock.valueChanges)
            .withContext("value change")

            .withContext("to have been called once for empty field and then once per entered digit")
            .toHaveBeenCalledTimes(1 + someOtherValue.length);
    });
});