import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {MemoizedSelector} from "@ngrx/store";
import {initialState, PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import {MapProject} from "../../model/intern/map-project";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatInputHarness} from "@angular/material/input/testing";
import {MatSelectHarness} from "@angular/material/select/testing";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInput, MatInputModule} from "@angular/material/input";
import {MatSelect, MatSelectModule} from "@angular/material/select";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption} from "@angular/material/core";
import {MatDialog} from "@angular/material/dialog";
import {of} from "rxjs";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {currentMapProject} from "../../selectors/main.selectors";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MapAreaPartComponent} from "./map-area-part.component";
import {EnumSelectComponent} from "../common/enum-select.component";
import {SAMPLE_MAP_PROJECT_1} from "../../model/test/test-data";
import * as UiActions from "../../actions/main.actions";
import {PaperFormat} from "../../model/intern/paper-format";
import {PaperOrientation} from "../../model/intern/paper-orientation";
import {FormBindingService} from "../../services/form-binding.service";
import Spy = jasmine.Spy;

describe("MapAreaPartComponent", () => {
    let store: MockStore<MapAreaPartComponent>;
    let storeSpy: Spy;
    let currentMapProjectSelector: MemoizedSelector<PrintmapsUiState, MapProject>;

    let fixture: ComponentFixture<MapAreaPartComponent>;
    let component: MapAreaPartComponent;
    let loader: HarnessLoader;

    let latitudeInput: MatInputHarness;
    let longitudeInput: MatInputHarness;
    let widthInMmInput: MatInputHarness;
    let heightInMmInput: MatInputHarness;
    let topMarginInMmInput: MatInputHarness;
    let bottomMarginInMmInput: MatInputHarness;
    let leftMarginInMmInput: MatInputHarness;
    let rightMarginInMmInput: MatInputHarness;
    let formatSelect: MatSelectHarness;
    let orientationSelect: MatSelectHarness;
    let scaleSelect: MatSelectHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule, MatInputModule, MatSelectModule, NoopAnimationsModule],
            declarations: [MapAreaPartComponent, MatFormField, MatLabel, MatInput, MatSelect, MatOption, EnumSelectComponent],
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
        fixture = TestBed.createComponent(MapAreaPartComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
        latitudeInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"latitude\"]"}));
        longitudeInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"longitude\"]"}));
        widthInMmInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"widthInMm\"]"}));
        heightInMmInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"heightInMm\"]"}));
        topMarginInMmInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"topMarginInMm\"]"}));
        bottomMarginInMmInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"bottomMarginInMm\"]"}));
        leftMarginInMmInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"leftMarginInMm\"]"}));
        rightMarginInMmInput = await loader.getHarness(MatInputHarness.with({selector: "[formControlName=\"rightMarginInMm\"]"}));
        formatSelect = await loader.getHarness(MatSelectHarness.with({selector: "[formControlName=\"format\"] mat-select"}));
        orientationSelect = await loader.getHarness(MatSelectHarness.with({selector: "[formControlName=\"orientation\"] mat-select"}));
        scaleSelect = await loader.getHarness(MatSelectHarness.with({selector: "[formControlName=\"scale\"] mat-select"}));
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should be created when store holds initial state", () => {
        // when component is created

        // then
        expect(component).withContext("component").toBeDefined();
    });

    it("should update form fields with values from map project without dispatching any actions when it changed", async () => {
        // when
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();

        // then
        expect(await latitudeInput.getValue()).withContext("value of latitude input field")
            .toBe(SAMPLE_MAP_PROJECT_1.center.latitude.toString());
        expect(await longitudeInput.getValue()).withContext("value of longitude input field")
            .toBe(SAMPLE_MAP_PROJECT_1.center.longitude.toString());
        expect(await widthInMmInput.getValue()).withContext("value of width input field")
            .toBe(SAMPLE_MAP_PROJECT_1.widthInMm.toString());
        expect(await heightInMmInput.getValue()).withContext("value of height input field")
            .toBe(SAMPLE_MAP_PROJECT_1.heightInMm.toString());
        expect(await topMarginInMmInput.getValue()).withContext("value of top margin input field")
            .toBe(SAMPLE_MAP_PROJECT_1.topMarginInMm.toString());
        expect(await bottomMarginInMmInput.getValue()).withContext("value of bottom margin input field")
            .toBe(SAMPLE_MAP_PROJECT_1.bottomMarginInMm.toString());
        expect(await leftMarginInMmInput.getValue()).withContext("value of left margin input field")
            .toBe(SAMPLE_MAP_PROJECT_1.leftMarginInMm.toString());
        expect(await rightMarginInMmInput.getValue()).withContext("value of right margin input field")
            .toBe(SAMPLE_MAP_PROJECT_1.rightMarginInMm.toString());
        expect(await formatSelect.getValueText()).withContext("value of format select field")
            .toBe("A4");
        expect(await orientationSelect.getValueText()).withContext("value of orientation select field")
            .toBe("Portrait");
        expect(await scaleSelect.getValueText()).withContext("value of scale select field")
            .toBe("1:25'000");
    });

    it("should dispatch update center coordinates action when a different latitude is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = -47.02;

        // when
        await latitudeInput.setValue(NEW_VALUE.toString());
        await latitudeInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateCenterCoordinates({
                latitude: NEW_VALUE,
                longitude: SAMPLE_MAP_PROJECT_1.center.longitude
            }));
    });

    it("should dispatch update center coordinates action when a different longitude is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = -179.33;

        // when
        await longitudeInput.setValue(NEW_VALUE.toString());
        await longitudeInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateCenterCoordinates({
                latitude: SAMPLE_MAP_PROJECT_1.center.latitude,
                longitude: NEW_VALUE
            }));
    });

    it("should dispatch update selected area action with width and height when a different width is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = 301;

        // when
        await widthInMmInput.setValue(NEW_VALUE.toString());
        await widthInMmInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                widthInMm: 301,
                heightInMm: SAMPLE_MAP_PROJECT_1.heightInMm
            }));
    });

    it("should dispatch update selected area action with width and height when a different height is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = 301;

        // when
        await heightInMmInput.setValue(NEW_VALUE.toString());
        await heightInMmInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                widthInMm: SAMPLE_MAP_PROJECT_1.widthInMm,
                heightInMm: 301
            }));
    });

    it("should dispatch update selected area action with paper format and orientation when a different paper format is selected", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();

        // when
        await formatSelect.clickOptions({text: "A3"});

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                format: PaperFormat.A3,
                orientation: PaperOrientation.PORTRAIT
            }));
    });

    it("should dispatch update selected area action with paper format and orientation when a different paper orientation is selected with a standard paper format", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();

        // when
        await orientationSelect.clickOptions({text: "Landscape"});

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        // noinspection JSSuspiciousNameCombination
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                format: PaperFormat.A4,
                orientation: PaperOrientation.LANDSCAPE
            }));
    });

    it("should dispatch update selected area action with all margins when a different top margin is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = 22;

        // when
        await topMarginInMmInput.setValue(NEW_VALUE.toString());
        await topMarginInMmInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                topMarginInMm: 22,
                bottomMarginInMm: SAMPLE_MAP_PROJECT_1.bottomMarginInMm,
                leftMarginInMm: SAMPLE_MAP_PROJECT_1.leftMarginInMm,
                rightMarginInMm: SAMPLE_MAP_PROJECT_1.rightMarginInMm
            }));
    });

    it("should dispatch update selected area action with all margins when a different bottom margin is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = 22;

        // when
        await bottomMarginInMmInput.setValue(NEW_VALUE.toString());
        await bottomMarginInMmInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                topMarginInMm: SAMPLE_MAP_PROJECT_1.topMarginInMm,
                bottomMarginInMm: 22,
                leftMarginInMm: SAMPLE_MAP_PROJECT_1.leftMarginInMm,
                rightMarginInMm: SAMPLE_MAP_PROJECT_1.rightMarginInMm
            }));
    });

    it("should dispatch update selected area action with all margins when a different left margin is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = 22;

        // when
        await leftMarginInMmInput.setValue(NEW_VALUE.toString());
        await leftMarginInMmInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                topMarginInMm: SAMPLE_MAP_PROJECT_1.topMarginInMm,
                bottomMarginInMm: SAMPLE_MAP_PROJECT_1.bottomMarginInMm,
                leftMarginInMm: 22,
                rightMarginInMm: SAMPLE_MAP_PROJECT_1.rightMarginInMm
            }));
    });

    it("should dispatch update selected area action with all margins when a different right margin is entered", async () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        storeSpy.calls.reset();
        const NEW_VALUE = 22;

        // when
        await rightMarginInMmInput.setValue(NEW_VALUE.toString());
        await rightMarginInMmInput.blur();

        // then
        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).withContext("dispatched action")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                topMarginInMm: SAMPLE_MAP_PROJECT_1.topMarginInMm,
                bottomMarginInMm: SAMPLE_MAP_PROJECT_1.bottomMarginInMm,
                leftMarginInMm: SAMPLE_MAP_PROJECT_1.leftMarginInMm,
                rightMarginInMm: 22
            }));
    });
});