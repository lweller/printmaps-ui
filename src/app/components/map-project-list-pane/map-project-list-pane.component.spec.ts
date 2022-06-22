import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {initialState, PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MapProjectListPaneComponent} from "./map-project-list-pane.component";
import {MatListOption, MatSelectionList} from "@angular/material/list";
import {MatListOptionHarness, MatSelectionListHarness} from "@angular/material/list/testing";
import {MatCardHarness} from "@angular/material/card/testing";
import {MatCard} from "@angular/material/card";
import {
    SAMPLE_MAP_PROJECT_1,
    SAMPLE_MAP_PROJECT_2,
    SAMPLE_MAP_PROJECT_REFERENCE_1,
    SAMPLE_MAP_PROJECT_REFERENCE_2
} from "../../model/test/test-data";
import {currentMapProject, mapProjectReferences} from "../../selectors/main.selectors";
import {MemoizedSelector} from "@ngrx/store";
import {MapProjectReference} from "../../model/intern/map-project-reference";
import {HarnessLoader} from "@angular/cdk/testing";
import * as UiActions from "../../actions/main.actions";
import {MapProject} from "../../model/intern/map-project";
import {MatRippleModule} from "@angular/material/core";
import {FormsModule} from "@angular/forms";

describe("MapProjectListPaneComponent", () => {

    let store: MockStore<PrintmapsUiState>;
    let mapProjectReferencesSelector: MemoizedSelector<PrintmapsUiState, MapProjectReference[]>;
    let currentMapProjectSelector: MemoizedSelector<PrintmapsUiState, MapProject>;

    let fixture: ComponentFixture<MapProjectListPaneComponent>;
    let component: MapProjectListPaneComponent;
    let loader: HarnessLoader;

    let card: MatCardHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FormsModule, MatRippleModule],
            declarations: [MapProjectListPaneComponent, MatCard, MatSelectionList, MatListOption],
            providers: [provideMockStore({initialState})],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        store = TestBed.inject(MockStore);
        spyOn(store, "dispatch");
        mapProjectReferencesSelector = store.overrideSelector(mapProjectReferences, undefined);
        currentMapProjectSelector = store.overrideSelector(currentMapProject, undefined);
        fixture = TestBed.createComponent(MapProjectListPaneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
        card = await loader.getHarness(MatCardHarness);
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should be created just with a information message when store holds initial state", async () => {
        // when
        // component is just initialized

        // then
        expect(component).withContext("component").toBeDefined();
        expect((await loader.getAllHarnesses(MatSelectionListHarness))[0]).withContext("selection list").toBeUndefined();
        expect(await card.getText()).toContain("No map projects have been created yet.");
    });

    it("should be created just with a information message when map project reference list is empty", async () => {
        // when
        mapProjectReferencesSelector.setResult([]);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(component).withContext("component").toBeDefined();
        expect((await loader.getAllHarnesses(MatSelectionListHarness))[0]).withContext("selection list").toBeUndefined();
        expect(await card.getText()).toContain("No map projects have been created yet.");
    });

    it("should create a selection list when some map project references are loaded", async () => {
        // when
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(component).withContext("component").toBeDefined();
        expect(await loader.getAllHarnesses(MatListOptionHarness)).withContext("list options").toHaveSize(2);
        expect(await card.getText()).not.toContain("No map projects have been created yet.");
    });

    it("should update list without altering selection when a new map reference is added", async () => {
        // given
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_2]);
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_2);
        store.refreshState();
        fixture.detectChanges();

        // when
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(await loader.getAllHarnesses(MatListOptionHarness)).withContext("list options").toHaveSize(2);
        expect(await (await loader.getAllHarnesses(MatListOptionHarness))[1].isSelected())
            .withContext("selected list option").toBeTrue();
        expect(store.dispatch).withContext("store dispatch method").not.toHaveBeenCalled();
    });

    it("should update list without altering selection when reference other than the selected one is remove", async () => {
        // given
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_2);
        store.refreshState();
        fixture.detectChanges();

        // when
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_2]);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(await loader.getAllHarnesses(MatListOptionHarness)).withContext("list options").toHaveSize(1);
        expect(await (await loader.getAllHarnesses(MatListOptionHarness))[0].isSelected())
            .withContext("selected list option").toBeTrue();
        expect(store.dispatch).withContext("store dispatch method").not.toHaveBeenCalled();
    });

    it("should update list and remove selection when selected reference is remove", async () => {
        // given
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        fixture.detectChanges();

        // when
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_2]);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(await loader.getAllHarnesses(MatListOptionHarness)).withContext("list options").toHaveSize(1);
        expect(await (await loader.getAllHarnesses(MatListOptionHarness))[0].isSelected())
            .withContext("selected list option").toBeFalse();
        expect(store.dispatch).withContext("store dispatch method").not.toHaveBeenCalled();
    });

    it("should update list and select new item when a new map reference corresponding to the current map project is added and", async () => {
        // given
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1]);
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        fixture.detectChanges();

        // when
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_2);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(await loader.getAllHarnesses(MatListOptionHarness)).withContext("list options").toHaveSize(2);
        expect(await (await loader.getAllHarnesses(MatListOptionHarness))[1].isSelected())
            .withContext("selected list option").toBeTrue();
        expect(store.dispatch).withContext("store dispatch method").not.toHaveBeenCalled();
    });

    it("should dispatch loadMapProject action when a list element is selected", async () => {
        // given
        mapProjectReferencesSelector.setResult([SAMPLE_MAP_PROJECT_REFERENCE_1, SAMPLE_MAP_PROJECT_REFERENCE_2]);
        store.refreshState();
        fixture.detectChanges();

        // when
        await (await card.getAllHarnesses(MatListOptionHarness))[1].select();

        // then
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.loadMapProject({mapProjectReference: SAMPLE_MAP_PROJECT_REFERENCE_2}));
    });
});