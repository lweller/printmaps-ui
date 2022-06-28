import {TextOrientationSelector} from "./text-orientation-selector.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatInputHarness} from "@angular/material/input/testing";
import {MatButtonToggleGroupHarness} from "@angular/material/button-toggle/testing";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatRippleModule} from "@angular/material/core";
import {cases} from "jasmine-parameterized";

function buildButtonToggleSelector(angle: number) {
    return {selector: "#orientation-" + angle};
}

describe("TextOrientationSelector", () => {
    const VALID_TEST_DATA = [
        {value: 0},
        {value: 90},
        {value: 180},
        {value: 270}
    ];

    let fixture: ComponentFixture<TextOrientationSelector>;
    let loader: HarnessLoader;

    let component: TextOrientationSelector;

    let inputField: MatInputHarness;
    let buttonToggleGroup: MatButtonToggleGroupHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatRippleModule, ReactiveFormsModule, FormsModule],
            declarations: [MatButtonToggleGroup, MatButtonToggle, TextOrientationSelector],
            providers: [FormBuilder],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(TextOrientationSelector);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        component.formControl = TestBed.inject(FormBuilder).control(undefined);
        buttonToggleGroup = await loader.getHarness(MatButtonToggleGroupHarness);
        inputField = await loader.getHarness(MatInputHarness);
    });

    it("should create", async () => {
        // when component is created

        // then
        expect(component).toBeDefined();
    });

    cases(VALID_TEST_DATA)
        .it("should update preset value in subcomponents when it is written to component", async (data) => {
            // when
            await component.writeValue(data.value);

            // then
            expect(await inputField.getValue()).withContext("value of input field").toBe(data.value.toString());
            expect(await buttonToggleGroup.getToggles({checked: true}))
                .withContext("number of checked button toggles")
                .toHaveSize(1);
            expect(!!await (await buttonToggleGroup.getToggles(buildButtonToggleSelector(data.value)))[0]?.isChecked())
                .withContext("check state of corresponding button toggle")
                .toBe(true);
        });

    it("should update custom value in subcomponents when it is written to component", async () => {
        // when
        await component.writeValue(78);

        // then
        expect(await inputField.getValue()).withContext("value of input field").toBe("78");
        expect(await buttonToggleGroup.getToggles({checked: true}))
            .withContext("number of checked button toggles")
            .toHaveSize(0);
    });

    cases(VALID_TEST_DATA)
        .it("should update input field and component value when button toggle is checked", async (data) => {
            // when
            await (await (await buttonToggleGroup.getToggles(buildButtonToggleSelector(data.value)))[0].toggle());

            // then
            expect(component.value).withContext("value of component ").toBe(data.value);
            expect(await inputField.getValue()).withContext("value of input field").toBe(data.value.toString());
        });

    cases(VALID_TEST_DATA)
        .it("should update checked button toggle and component value when preset value is entered", async (data) => {
            // when
            await inputField.setValue(data.value.toString());

            // then
            expect(component.value).withContext("value of component ").toBe(data.value);
            expect(await buttonToggleGroup.getToggles({checked: true}))
                .withContext("number of checked button toggles")
                .toHaveSize(1);
            expect(!!await (await buttonToggleGroup.getToggles(buildButtonToggleSelector(data.value)))[0]?.isChecked())
                .withContext("check state of corresponding button toggle")
            .toBe(true);
    });

    it("should update checked button toggle and component value when custom value is entered", async () => {
        // when
        await inputField.setValue("88");

        // then
        expect(component.value).withContext("value of component ").toBe(88);
        expect(await buttonToggleGroup.getToggles({checked: true}))
            .withContext("number of checked button toggles")
            .toHaveSize(0);
    });
});