import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {initialState, PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import {MemoizedSelector} from "@ngrx/store";
import {MapProject} from "../../model/intern/map-project";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HarnessLoader} from "@angular/cdk/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MatDialog} from "@angular/material/dialog";
import {of} from "rxjs";
import {MatInputHarness} from "@angular/material/input/testing";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {GeneralPropertiesPartComponent} from "./general-properties-part.component";
import {MatInput, MatInputModule} from "@angular/material/input";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {SAMPLE_MAP_PROJECT_1} from "../../model/test/test-data";
import * as UiActions from "../../actions/main.actions";
import {range} from "lodash";
import {FileFormat, MapStyle} from "../../model/api/map-rendering-job-definition";
import {cases} from "jasmine-parameterized";
import {allValuesOf} from "../../utils/common.util";
import {currentMapProject} from "../../selectors/main.selectors";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {MatOption} from "@angular/material/core";
import {MatSelectHarness} from "@angular/material/select/testing";
import {EnumSelectComponent} from "../common/enum-select.component";
import {FormBindingService} from "../../services/form-binding.service";
import Spy = jasmine.Spy;

describe("GeneralPropertiesPartComponent", () => {
    let store: MockStore<GeneralPropertiesPartComponent>;
    let storeSpy: Spy;
    let currentMapProjectSelector: MemoizedSelector<PrintmapsUiState, MapProject>;

    let fixture: ComponentFixture<GeneralPropertiesPartComponent>;
    let component: GeneralPropertiesPartComponent;
    let loader: HarnessLoader;

    let nameInput: MatInputHarness;
    let fileFormatSelect: MatSelectHarness;
    let mapStyleSelect: MatSelectHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, NoopAnimationsModule],
            declarations: [GeneralPropertiesPartComponent, MatFormField, MatLabel, MatInput, MatSelect, MatOption, EnumSelectComponent],
            providers: [
                provideMockStore({initialState}),
                FormBindingService,
                {
                    provide: MatDialog,
                    useValue: {
                        open: () => ({
                            afterClosed: () => of(true)
                        })
                    }
                }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        store = TestBed.inject(MockStore);
        storeSpy = spyOn(store, "dispatch");
        currentMapProjectSelector = store.overrideSelector(currentMapProject, undefined);
        fixture = TestBed.createComponent(GeneralPropertiesPartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
        nameInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"name\"]"}));
        fileFormatSelect = await loader.getHarness(MatSelectHarness.with({selector: "[formControlName=\"fileFormat\"] mat-select"}));
        mapStyleSelect = await loader.getHarness(MatSelectHarness.with({selector: "[formControlName=\"mapStyle\"] mat-select"}));
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should be created when store holds initial state", () => {
        // when component is created

        // then
        expect(component).withContext("component").toBeDefined();
    });

    it("should update form fields with values from map project when it changed", async () => {
        // when
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();

        // then
        expect(await nameInput.getValue()).withContext("value of name input field")
            .toBe(SAMPLE_MAP_PROJECT_1.name);
        expect(await fileFormatSelect.getValueText()).withContext("value of file format select field")
            .toBe(SAMPLE_MAP_PROJECT_1.options.fileFormat.toString());
        expect(await mapStyleSelect.getValueText()).withContext("value of map style select field")
            .toBe(SAMPLE_MAP_PROJECT_1.options.mapStyle.toString());
    });

    it("should dispatch update map name action for each entered character when a different name is entered", async () => {
        // given
        const NEW_NAME = "New Map Name";

        // when
        await nameInput.setValue(NEW_NAME);

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(NEW_NAME.length + 1);
        range(0, NEW_NAME.length + 1)
            .map(() => NEW_NAME.substring(0, 1))
            .forEach(value =>
                expect(store.dispatch).withContext("dispatched action")
                    .toHaveBeenCalledWith(UiActions.updateMapName({name: value}))
            );
    });

    cases(allValuesOf(FileFormat))
        .it("should dispatch update map options when a file format is selected", async (fileFormat) => {
            // when
            await fileFormatSelect.open();
            await fileFormatSelect.clickOptions({text: fileFormat});

            // then
            expect(store.dispatch).withContext("dispatched action")
                .toHaveBeenCalledWith(UiActions.updateMapOptions({
                    fileFormat: fileFormat,
                    mapStyle: null
                }));
            expect(await fileFormatSelect.isOpen()).withContext("file format select opening state").toBeFalse();
        });

    cases(allValuesOf(MapStyle))
        .it("should dispatch update map options when a map style is selected", async (mapStyle) => {
            // when
            await mapStyleSelect.open();
            await mapStyleSelect.clickOptions({text: mapStyle});

            // then
            expect(store.dispatch).withContext("dispatched action")
                .toHaveBeenCalledWith(UiActions.updateMapOptions({
                    fileFormat: null,
                    mapStyle: mapStyle
                }));
            expect(await fileFormatSelect.isOpen()).withContext("map style select opening state").toBeFalse();
        });
});