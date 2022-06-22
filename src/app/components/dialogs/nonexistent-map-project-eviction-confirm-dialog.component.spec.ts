import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {MatDialogModule} from "@angular/material/dialog";
import {NonexistentMapProjectEvictionConfirmDialog} from "./nonexistent-map-project-eviction-confirm-dialog.component";

describe("NonexistentMapProjectEvictionConfirmDialog", () => {

    let fixture: ComponentFixture<NonexistentMapProjectEvictionConfirmDialog>;
    let component: NonexistentMapProjectEvictionConfirmDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [NonexistentMapProjectEvictionConfirmDialog],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();
        fixture = TestBed.createComponent(NonexistentMapProjectEvictionConfirmDialog);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it("should be created successfully", () => {
        // when
        // dialog is created

        // then
        expect(component).withContext("dialog component").toBeDefined();
    });
});