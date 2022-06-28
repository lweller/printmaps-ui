import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MatOption} from "@angular/material/core";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {EnumSelectComponent} from "./enum-select.component";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatSelectHarness} from "@angular/material/select/testing";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {EventTestBed} from "../../model/test/test-util";

describe("EnumSelectComponent", () => {
    let fixture: ComponentFixture<EnumSelectComponent>;
    let loader: HarnessLoader;

    let component: EnumSelectComponent;

    let selectField: MatSelectHarness;
    let eventTestBed: EventTestBed;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, MatSelectModule, NoopAnimationsModule],
            declarations: [EnumSelectComponent, MatSelect, MatOption],
            providers: [FormBuilder],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(EnumSelectComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        component.formControl = TestBed.inject(FormBuilder).control(undefined);
        selectField = await loader.getHarness(MatSelectHarness);
        eventTestBed = new EventTestBed(component);
    });

    afterEach(() => {
        fixture?.destroy();
        eventTestBed?.unregister();
    });

    it("should create without errors", () => {
        // when component is created

        // then
        expect(component).toBeDefined();
        expect(TEST_ENUM_LABEL_FUNCTION instanceof Function).toBeTrue();
    });

    it("should create an option for each enum value when enum type ist set", async () => {
        // when
        component.type = TestEnum;
        await selectField.open();

        // then
        expect(await selectField.getOptions()).withContext("select option count").toHaveSize(3);
        expect((await selectField.getOptions({text: "1"}))[0]).withContext("option 1").toBeDefined();
        expect((await selectField.getOptions({text: "2"}))[0]).withContext("option 2").toBeDefined();
        expect((await selectField.getOptions({text: "3"}))[0]).withContext("option 3").toBeDefined();
    });

    it("should create an option using labels from map for each enum value when enum type ist set", async () => {
        // when
        component.type = TestEnum;
        component.labels = TEST_ENUM_LABELS;
        await selectField.open();

        // then
        expect(await selectField.getOptions()).withContext("select option count").toHaveSize(3);
        expect((await selectField.getOptions({text: "One"}))[0]).withContext("option 1").toBeDefined();
        expect((await selectField.getOptions({text: "Two"}))[0]).withContext("option 2").toBeDefined();
        expect((await selectField.getOptions({text: "Three"}))[0]).withContext("option 3").toBeDefined();
    });

    it("should create an option using labels returned by function for each enum value when enum type ist set", async () => {
        // when
        component.type = TestEnum;
        component.labels = TEST_ENUM_LABEL_FUNCTION;
        await selectField.open();

        // then
        expect(await selectField.getOptions()).withContext("select option count").toHaveSize(3);
        expect((await selectField.getOptions({text: "One !"}))[0]).withContext("option 1").toBeDefined();
        expect((await selectField.getOptions({text: "Two !"}))[0]).withContext("option 2").toBeDefined();
        expect((await selectField.getOptions({text: "Three !"}))[0]).withContext("option 3").toBeDefined();
    });

    it("should update selected option when value is set", async () => {
        // given
        component.type = TestEnum;

        // when
        component.control.setValue(TestEnum.VALUE_2);
        await selectField.open();

        // then
        expect(await (await selectField.getOptions({text: "2"}))[0].isSelected())
            .withContext("selection state of option 2")
            .toBeTrue();
    });

    it("should emit value change event when an option is selected", async () => {
        // given
        component.type = TestEnum;
        fixture.detectChanges();

        // when
        await selectField.clickOptions({text: "2"});

        // then
        expect(eventTestBed.mock.valueChanges).toHaveBeenCalledWith(TestEnum.VALUE_2);
    });
});

// noinspection JSUnusedGlobalSymbols
enum TestEnum {
    VALUE_1 = 1,
    VALUE_2 = 2,
    VALUE_3 = 3
}

const TEST_ENUM_LABELS = new Map<number, string>([
    [1, "One"],
    [2, "Two"],
    [3, "Three"]
]);

const TEST_ENUM_LABEL_FUNCTION = (value) => TEST_ENUM_LABELS.get(value) + " !";