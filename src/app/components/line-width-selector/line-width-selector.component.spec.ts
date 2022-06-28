import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatButtonToggleGroupHarness} from "@angular/material/button-toggle/testing";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatRippleModule} from "@angular/material/core";
import {LineWidthSelector} from "./line-width-selector.component";
import {cases} from "jasmine-parameterized";

function buildButtonToggleSelector(width: number) {
    return {selector: "#line-width-" + width};
}

describe("LineWidthSelector", () => {
    const VALID_TEST_DATA = [
        {value: 2},
        {value: 4},
        {value: 6}
    ];

    let fixture: ComponentFixture<LineWidthSelector>;
    let loader: HarnessLoader;

    let component: LineWidthSelector;

    let buttonToggleGroup: MatButtonToggleGroupHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatRippleModule, ReactiveFormsModule, FormsModule],
            declarations: [MatButtonToggleGroup, MatButtonToggle, LineWidthSelector],
            providers: [FormBuilder],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(LineWidthSelector);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        component.formControl = TestBed.inject(FormBuilder).control(undefined);
        buttonToggleGroup = await loader.getHarness(MatButtonToggleGroupHarness);
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
            expect(await buttonToggleGroup.getToggles({checked: true}))
                .withContext("number of checked button toggles")
                .toHaveSize(1);
            expect(!!await (await buttonToggleGroup.getToggles(buildButtonToggleSelector(data.value)))[0]?.isChecked())
                .withContext("check state of corresponding button toggle")
                .toBe(true);
        });

    it("should update custom value in subcomponents when it is written to component", async () => {
        // when
        await component.writeValue(1);

        // then
        expect(await buttonToggleGroup.getToggles({checked: true}))
            .withContext("number of checked button toggles")
            .toHaveSize(0);
    });

    cases(VALID_TEST_DATA)
        .it("should update component value when button toggle is checked", async (data) => {
            // when
            await (await (await buttonToggleGroup.getToggles(buildButtonToggleSelector(data.value)))[0].toggle());

            // then
            expect(component.value).withContext("value of component ").toBe(data.value);
        });
});