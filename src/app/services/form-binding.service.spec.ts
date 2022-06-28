import {TestBed} from "@angular/core/testing";
import {FormBindingService} from "./form-binding.service";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MockStore, provideMockStore} from "@ngrx/store/testing";
import {MapAreaPartComponent} from "../components/current-map-project-pane/map-area-part.component";
import {createAction, createFeatureSelector, createSelector, MemoizedSelector, props} from "@ngrx/store";
import Spy = jasmine.Spy;

describe("FormBindingService", () => {

    const TEST_STATE = {test: null};
    const TEST_ACTION = createAction("TEST", props<{ test: string }>());

    let store: MockStore<MapAreaPartComponent>;
    let storeSpy: Spy;

    let testSelector: MemoizedSelector<{ test: string }, { test: string }>;

    let formBuilder: FormBuilder;

    let formBindingService: FormBindingService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                provideMockStore({initialState: TEST_STATE}),
                FormBindingService
            ]
        });

        formBindingService = TestBed.inject(FormBindingService);

        formBuilder = TestBed.inject(FormBuilder);

        store = TestBed.inject(MockStore);
        storeSpy = spyOn(store, "dispatch");

        testSelector = store.overrideSelector(createFeatureSelector<{ test: string }>("TEST"), null);
    });

    it("should update value of form when selector changes to a new value", () => {
        // given
        let form = formBuilder.group(TEST_STATE);
        formBindingService.bindSelector(form, createSelector(testSelector, value => value));

        // when
        testSelector.setResult({test: "something"});
        store.refreshState();

        // then
        expect(form.controls.test.value).toBe("something");
    });

    it("should dispatch bound action when a value of form changes", () => {
        // given
        let form = formBuilder.group(TEST_STATE);
        formBindingService.bindAction(form, TEST_ACTION);
        storeSpy.calls.reset();

        // when
        form.controls.test.setValue("something");

        // then
        expect(store.dispatch).toHaveBeenCalledWith(TEST_ACTION({test: "something"}));
    });

    it("should not dispatch any action when a value is set again to the same value", () => {
        // given
        let form = formBuilder.group(TEST_STATE);
        formBindingService.bindAction(form, TEST_ACTION);
        form.controls.test.setValue("something");
        storeSpy.calls.reset();

        // when
        form.controls.test.setValue("something");

        // then
        expect(store.dispatch).not.toHaveBeenCalled();
    });

    it("should not dispatch any action when selector emits the same value", () => {
        // given
        let form = formBuilder.group(TEST_STATE);
        testSelector.setResult({test: "something"});
        store.refreshState();
        formBindingService.bindSelector(form, createSelector(testSelector, value => value));
        formBindingService.bindAction(form, TEST_ACTION);

        // when
        testSelector.setResult({test: "something"});
        store.refreshState();

        // then
        expect(store.dispatch).not.toHaveBeenCalled();
    });
});