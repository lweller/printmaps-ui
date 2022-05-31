import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {initialState, PrintmapsUiState} from "../../model/intern/printmaps-ui-state";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {ButtonBoxComponent} from "./button-box.component";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MemoizedSelector} from "@ngrx/store";
import * as UiActions from "../../actions/main.actions";
import {TestbedHarnessEnvironment} from "@angular/cdk/testing/testbed";
import {MatButtonHarness} from "@angular/material/button/testing";
import {
    isCurrentMapProjectCopiable,
    isCurrentMapProjectDeletable,
    isCurrentMapProjectDownloadable,
    isCurrentMapProjectRenderable
} from "../../selectors/main.selectors";

describe("ButtonBox", () => {

    let store: MockStore<PrintmapsUiState>;

    let isCurrentMapProjectCopiableSelector: MemoizedSelector<PrintmapsUiState, boolean>;
    let isCurrentMapProjectDeletableSelector: MemoizedSelector<PrintmapsUiState, boolean>;
    let isCurrentMapProjectRenderableSelector: MemoizedSelector<PrintmapsUiState, boolean>;
    let isCurrentMapProjectDownloadableSelector: MemoizedSelector<PrintmapsUiState, boolean>;

    let fixture: ComponentFixture<ButtonBoxComponent>;

    let component: ButtonBoxComponent;

    let addButton: MatButtonHarness;
    let copyButton: MatButtonHarness;
    let deleteButton: MatButtonHarness;
    let lauchRenderingButton: MatButtonHarness;
    let downloadButton: MatButtonHarness;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ButtonBoxComponent],
            providers: [provideMockStore({initialState})],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        store = TestBed.inject(MockStore);
        spyOn(store, "dispatch");
        isCurrentMapProjectCopiableSelector = store.overrideSelector(isCurrentMapProjectCopiable, undefined);
        isCurrentMapProjectDeletableSelector = store.overrideSelector(isCurrentMapProjectDeletable, undefined);
        isCurrentMapProjectRenderableSelector = store.overrideSelector(isCurrentMapProjectRenderable, undefined);
        isCurrentMapProjectDownloadableSelector = store.overrideSelector(isCurrentMapProjectDownloadable, undefined);
        fixture = TestBed.createComponent(ButtonBoxComponent);
        component = fixture.componentInstance;
        let loader = TestbedHarnessEnvironment.loader(fixture);
        addButton = await loader.getHarness(MatButtonHarness.with({selector: "#add"}));
        copyButton = await loader.getHarness(MatButtonHarness.with({selector: "#copy"}));
        deleteButton = await loader.getHarness(MatButtonHarness.with({selector: "#delete"}));
        lauchRenderingButton = await loader.getHarness(MatButtonHarness.with({selector: "#launchRendering"}));
        downloadButton = await loader.getHarness(MatButtonHarness.with({selector: "#download"}));
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should dispatch createMapProject action when add button is clicked", async () => {
        // when
        await addButton.click();

        // then
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.createMapProject());
    });

    it("should disable copy button when current map project isn't copiable", async () => {
        // when
        isCurrentMapProjectCopiableSelector.setResult(false);
        store.refreshState();

        // then
        expect(await copyButton.isDisabled()).withContext("disable state of copy button").toBeTrue();
    });

    it("should dispatch copyMapProject action when current map project is copiable and copy button is clicked", async () => {
        // when
        isCurrentMapProjectCopiableSelector.setResult(true);
        store.refreshState();
        fixture.detectChanges();
        await copyButton.click();

        // then
        expect(await copyButton.isDisabled()).withContext("disable state of copy button").toBeFalse();
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.copyMapProject());
    });

    it("should disable delete button when current map project isn't deletable", async () => {
        // when
        isCurrentMapProjectDeletable.setResult(false);
        store.refreshState();

        // then
        expect(await deleteButton.isDisabled()).withContext("disable state of delete button").toBeTrue();
    });

    it("should dispatch deleteMapProject action when current map project is deletable and delete button is clicked", async () => {
        // when
        isCurrentMapProjectDeletable.setResult(true);
        store.refreshState();
        fixture.detectChanges();
        await deleteButton.click();

        // then
        expect(await deleteButton.isDisabled()).withContext("disable state of delete button").toBeFalse();
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.deleteMapProject({}));
    });

    it("should disable launch rendering button when current map project isn't renderable", async () => {
        // when
        isCurrentMapProjectRenderableSelector.setResult(false);
        store.refreshState();

        // then
        expect(await lauchRenderingButton.isDisabled()).withContext("disable state of launch rendering button").toBeTrue();
    });

    it("should dispatch uploadMapProject action with follow up action launchRendering when current map project is renderable and launch rendering button is clicked", async () => {
        // when
        isCurrentMapProjectRenderableSelector.setResult(true);
        store.refreshState();
        fixture.detectChanges();
        await lauchRenderingButton.click();

        // then
        expect(await lauchRenderingButton.isDisabled()).withContext("disable state of launch rendering button").toBeFalse();
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.ensureMapProjectIsUploadedAndDispatch({followUpAction: "launchRendering"}));
    });

    it("should disable download button when current map project isn't downloadable", async () => {
        // when
        isCurrentMapProjectDownloadable.setResult(false);
        store.refreshState();

        // then
        expect(await downloadButton.isDisabled()).withContext("disable state of download button").toBeTrue();
    });

    it("should dispatch downloadRenderedMapProject action when current map project is downloadable and download button is clicked", async () => {
        // when
        isCurrentMapProjectDownloadable.setResult(true);
        store.refreshState();
        fixture.detectChanges();
        await downloadButton.click();

        // then
        expect(await downloadButton.isDisabled()).withContext("disable state of download button").toBeFalse();
        expect(store.dispatch)
            .withContext("store dispatch method")
            .toHaveBeenCalledWith(UiActions.downloadRenderedMapProject());
    });
});