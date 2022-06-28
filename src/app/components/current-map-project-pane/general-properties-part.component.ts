import {Component} from "@angular/core";
import {FileFormat, MapStyle} from "../../model/api/map-rendering-job-definition";
import {FormBuilder, FormGroup} from "@angular/forms";
import * as UiActions from "../../actions/main.actions";
import {currentMapProjectGeneralProperties} from "../../selectors/main.selectors";
import {FormBindingService} from "../../services/form-binding.service";

@Component({
    selector: "app-general-properties-part",
    templateUrl: "./general-properties-part.component.html"
})
export class GeneralPropertiesPartComponent {
    readonly FileFormat = FileFormat;
    readonly MapStyle = MapStyle;

    form: FormGroup;

    constructor(formBuilder: FormBuilder, formBindingService: FormBindingService) {
        let formConfig = {
            description: formBuilder.group({
                name: [null]
            }),
            options: formBuilder.group({
                fileFormat: [null],
                mapStyle: [null]
            })
        };
        this.form = formBuilder.group(formConfig);
        formBindingService.bindSelector(this.form, currentMapProjectGeneralProperties);
        formBindingService.bindAction(formConfig.description, UiActions.updateMapName);
        formBindingService.bindAction(formConfig.options, UiActions.updateMapOptions);
    }
}