import {Component} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import * as UiActions from "../../actions/main.actions";
import {PAPER_FORMAT_LABELS, PaperFormat} from "../../model/intern/paper-format";
import {PAPER_ORIENTATION_LABELS, PaperOrientation} from "../../model/intern/paper-orientation";
import {Scale, scaleLabel} from "../../model/intern/scale";
import {
    currentMapProjectCenter,
    currentMapProjectFormat,
    currentMapProjectMargins,
    currentMapProjectScale,
    currentMapProjectSize
} from "../../selectors/main.selectors";
import {FormBindingService} from "../../services/form-binding.service";

@Component({
    selector: "app-map-area-part",
    templateUrl: "./map-area-part.component.html"
})
export class MapAreaPartComponent {
    readonly PaperFormat = PaperFormat;
    readonly PAPER_FORMAT_LABELS = PAPER_FORMAT_LABELS;
    readonly PaperOrientation = PaperOrientation;
    readonly PAPER_ORIENTATION_LABELS = PAPER_ORIENTATION_LABELS;
    readonly Scale = Scale;
    readonly scaleLabel = scaleLabel;

    form: FormGroup;

    constructor(formBuilder: FormBuilder, formBindingService: FormBindingService) {
        let formConfig = {
            center: formBuilder.group({
                latitude: [null, {validators: [Validators.min(-85), Validators.max(85)], updateOn: "blur"}],
                longitude: [null, {validators: [Validators.min(-180), Validators.max(180)], updateOn: "blur"}]
            }),
            paperFormat: formBuilder.group({
                format: [null],
                orientation: [null]
            }),
            paperSize: formBuilder.group({
                widthInMm: [null, {validators: [Validators.min(50), Validators.max(3000)], updateOn: "blur"}],
                heightInMm: [null, {validators: [Validators.min(50), Validators.max(2500)], updateOn: "blur"}]
            }),
            margins: formBuilder.group({
                topMarginInMm: [null, {validators: [Validators.min(0)], updateOn: "blur"}],
                bottomMarginInMm: [null, {validators: [Validators.min(0)], updateOn: "blur"}],
                leftMarginInMm: [null, {validators: [Validators.min(0)], updateOn: "blur"}],
                rightMarginInMm: [null, {validators: [Validators.min(0)], updateOn: "blur"}]
            }),
            scale: formBuilder.control(null)
        };
        this.form = formBuilder.group(formConfig);
        formBindingService.bindAction(formConfig.center, UiActions.updateCenterCoordinates);
        formBindingService.bindAction([
            formConfig.paperFormat,
            formConfig.paperSize,
            formConfig.margins,
            formConfig.scale
        ], UiActions.updateSelectedArea);
        formBindingService.bindSelector(formConfig.center, currentMapProjectCenter);
        formBindingService.bindSelector(formConfig.paperFormat, currentMapProjectFormat);
        formBindingService.bindSelector(formConfig.paperSize, currentMapProjectSize);
        formBindingService.bindSelector(formConfig.margins, currentMapProjectMargins);
        formBindingService.bindSelector(formConfig.scale, currentMapProjectScale);
    }
}