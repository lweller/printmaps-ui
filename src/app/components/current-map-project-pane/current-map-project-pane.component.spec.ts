import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {initialState, PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import {MemoizedSelector} from "@ngrx/store";
import {MapProject} from "../../model/intern/map-project";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {HarnessLoader} from "@angular/cdk/testing";
import {MatCard, MatCardModule} from "@angular/material/card";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {currentMapProject} from "../../selectors/main.selectors";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {CurrentMapProjectPaneComponent} from "./current-map-project-pane.component";
import {MatDialog} from "@angular/material/dialog";
import {of} from "rxjs";
import {MatAccordion, MatExpansionModule, MatExpansionPanel} from "@angular/material/expansion";
import {MatMenuModule} from "@angular/material/menu";
import {NoopAnimationsModule} from "@angular/platform-browser/animations";

describe("CurrentMapProjectPaneComponent", () => {
    let store: MockStore<PrintmapsUiState>;
    let currentMapProjectSelector: MemoizedSelector<PrintmapsUiState, MapProject>;

    let fixture: ComponentFixture<CurrentMapProjectPaneComponent>;
    let component: CurrentMapProjectPaneComponent;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatCardModule, MatExpansionModule, MatMenuModule, NoopAnimationsModule],
            declarations: [CurrentMapProjectPaneComponent, MatCard, MatAccordion, MatExpansionPanel],
            providers: [provideMockStore({initialState}),
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
        spyOn(store, "dispatch");
        currentMapProjectSelector = store.overrideSelector(currentMapProject, undefined);
        fixture = TestBed.createComponent(CurrentMapProjectPaneComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should be created when store holds initial state", async () => {
        // when
        // component initialized with initial state

        // then
        expect(component).withContext("component").toBeDefined();
    });
});