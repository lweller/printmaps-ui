import {ComponentFixture, TestBed} from "@angular/core/testing";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatButtonToggleGroupHarness} from "@angular/material/button-toggle/testing";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatRippleModule} from "@angular/material/core";
import {cases} from "jasmine-parameterized";
import {FontStyleSelector} from "./font-style-selector.component";
import {FontStyle} from "../../model/intern/additional-element-style";
import {allValuesOf} from "../../utils/common.util";

function buildButtonToggleSelector(style: FontStyle) {
    return {selector: "#font-style-" + style.toString()};
}

describe("FontStyleSelector", () => {
    const VALID_TEST_DATA = allValuesOf(FontStyle).map(value => ({
        value: value
    }));

    let fixture: ComponentFixture<FontStyleSelector>;
    let loader: HarnessLoader;

    let component: FontStyleSelector;

    let buttonToggleGroup: MatButtonToggleGroupHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatRippleModule, ReactiveFormsModule, FormsModule],
            declarations: [MatButtonToggleGroup, MatButtonToggle, FontStyleSelector],
            providers: [FormBuilder],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(FontStyleSelector);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
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

    cases(VALID_TEST_DATA)
        .it("should update component value when button toggle is checked", async (data) => {
            // when
            await (await (await buttonToggleGroup.getToggles(buildButtonToggleSelector(data.value)))[0].toggle());

            // then
            expect(component.value).withContext("value of component ").toBe(data.value);
        });
});