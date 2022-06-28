import {ComponentFixture, TestBed} from "@angular/core/testing";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {initialState, PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MapComponent} from "../map/map.component";
import {MapPaneComponent} from "./map-pane.component";
import {ConfigurationService} from "../../services/configuration.service";
import {MockComponent, ngMocks} from "ng-mocks";
import {MemoizedSelector} from "@ngrx/store";
import {MapProject} from "../../model/intern/map-project";
import {currentMapProject} from "../../selectors/main.selectors";
import {
    SAMPLE_APP_CONF,
    SAMPLE_COORDINATES_1,
    SAMPLE_DEFAULT_COORDINATES,
    SAMPLE_MAP_PROJECT_1
} from "../../model/test/test-data";
import * as L from "leaflet";
import * as UiActions from "../../actions/main.actions";

describe("MapPaneComponent", () => {

    let store: MockStore<PrintmapsUiState>;
    let currentMapProjectSelector: MemoizedSelector<PrintmapsUiState, MapProject>;

    let fixture: ComponentFixture<MapPaneComponent>;
    let component: MapPaneComponent;

    let mapComponent: MapComponent;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MapPaneComponent, MockComponent(MapComponent)],
            providers: [
                provideMockStore({initialState}),
                {provide: ConfigurationService, useValue: new ConfigurationService(undefined)}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        spyOnProperty(TestBed.inject(ConfigurationService), "appConf", "get").and.returnValue(SAMPLE_APP_CONF);
        store = TestBed.inject(MockStore);
        currentMapProjectSelector = store.overrideSelector(currentMapProject, undefined);
        spyOn(store, "dispatch");
        fixture = TestBed.createComponent(MapPaneComponent);
        component = fixture.componentInstance;
        mapComponent = ngMocks.findInstance(MapComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should be created with map located at default coordinates taken from configuration service when store holds initial state", () => {
        // when
        // component is initialized

        // then
        expect(component).withContext("component").toBeDefined();
        expect(mapComponent.centerCoordinates).withContext("center coordinate of map component")
            .toEqual(L.latLng(SAMPLE_DEFAULT_COORDINATES.latitude, SAMPLE_DEFAULT_COORDINATES.longitude));
        expect(mapComponent.enableAreaSelection).withContext("enabling of area selection in map component")
            .toBeFalse();
        expect(mapComponent.selectedArea).withContext("selected area in map component")
            .toBeUndefined();
        expect(mapComponent.reductionFactor).withContext("selected area in map component")
            .toBeUndefined();
    });

    it("should update center coordinates of map when current map project ist set", () => {
        // when
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        fixture.detectChanges();

        // then
        expect(mapComponent.centerCoordinates).withContext("center coordinate of map component")
            .toEqual(L.latLng(SAMPLE_COORDINATES_1.latitude, SAMPLE_COORDINATES_1.longitude));
        expect(mapComponent.enableAreaSelection).withContext("enabling of area selection in map component")
            .toBeTrue();
        expect(mapComponent.selectedArea).withContext("selected area in map component")
            // Paper size A4 (210x297mm) minus 8mm margin on each side multiplied by real 25m for each map mm (scale 1:25'000)
            .toEqual({width: 4850, height: 7025});
        expect(mapComponent.reductionFactor).withContext("selected area in map component")
            .toBe(25000);
    });

    it("should dispatch update center coordinates action when coordinates changed in map", () => {
        // when
        mapComponent.centerCoordinatesChange.emit(L.latLng(39, -15));

        // then
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.updateCenterCoordinates({latitude: 39, longitude: -15}));
    });

    it("should dispatch no action when selected area changed in map but no map project is currently selected", () => {
        // when
        mapComponent.selectedAreaChange.emit({width: 2000, height: 3000});

        // then
        expect(store.dispatch)
            .withContext("store dispatch method")
            .not.toHaveBeenCalled();
    });

    it("should dispatch update selected area action with new width and height and all other attributes with unchanged values when a map project is currently selected and selected area changed in map", () => {
        // given
        currentMapProjectSelector.setResult(SAMPLE_MAP_PROJECT_1);
        store.refreshState();
        fixture.detectChanges();

        // when
        mapComponent.selectedAreaChange.emit({width: 2000, height: 3000});

        // then
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.updateSelectedArea({
                widthInMm: 80,
                heightInMm: 120,
                scale: SAMPLE_MAP_PROJECT_1.scale,
                leftMarginInMm: SAMPLE_MAP_PROJECT_1.leftMarginInMm,
                topMarginInMm: SAMPLE_MAP_PROJECT_1.topMarginInMm,
                rightMarginInMm: SAMPLE_MAP_PROJECT_1.rightMarginInMm,
                bottomMarginInMm: SAMPLE_MAP_PROJECT_1.bottomMarginInMm
            }));
    });
});