import {Component} from "@angular/core";
import {Store} from "@ngrx/store";
import {cloneDeep, isEqual} from "lodash";
import * as UiActions from "../../actions/main.actions";
import {FILE_FORMATS, FileFormat, MAP_STYLES, MapStyle} from "../../model/api/map-rendering-job-definition";
import {MapProject} from "../../model/intern/map-project";
import {getPaperFormatProperties, PAPER_FORMATS, PaperFormat} from "../../model/intern/paper-format";
import {PAPER_ORIENTATIONS, PaperOrientation} from "../../model/intern/paper-orientation";
import {currentMapProject} from "../../model/intern/printmaps-ui-state";
import *as s from "../../model/intern/scale";
import {distinctUntilChanged} from "rxjs/operators";
import {MapProjectState} from "../../model/intern/map-project-state";
import {MatIconRegistry} from "@angular/material/icon";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
    selector: "app-current-map-project-pane",
    templateUrl: "./current-map-project-pane.component.html",
    styles: []
})
export class CurrentMapProjectPaneComponent {
    readonly scales = s.SCALES;
    readonly paperFormats = PAPER_FORMATS;
    readonly paperOrientations = PAPER_ORIENTATIONS;
    readonly fileFormats = FILE_FORMATS;
    readonly mapStyles = MAP_STYLES;

    mapProject: MapProject = undefined;

    generalPropertiesPartExpanded = false;
    mapAreaPartExpanded = true;

    constructor(private store: Store<any>, private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
        this.registerIcons();
        store
            .select(currentMapProject)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) => isEqual(previousValue, nextValue))
            )
            .subscribe(nextMapProject => this.mapProject = cloneDeep(nextMapProject));
    }

    get printAreaFormat() {
        let formatEntry = Array.from(this.paperFormats.entries())
            .find(entry =>
                (entry[1].length1 == this.mapProject.widthInMm
                    && entry[1].length2 == this.mapProject.heightInMm)
                || (entry[1].length2 == this.mapProject.widthInMm
                && entry[1].length1 == this.mapProject.heightInMm));
        return formatEntry ? formatEntry[0] : PaperFormat.CUSTOM;
    }

    get printAreaOrientation() {
        return this.mapProject.widthInMm <= this.mapProject.heightInMm
            ? PaperOrientation.PORTRAIT
            : PaperOrientation.LANDSCAPE;
    }

    dispatchCenterLatitudeUpdate(latitude: number) {
        this.mapProject.center.latitude = latitude;
        this.dispatchCenterCoordinatesUpdate();
    }

    dispatchCenterLongitudeUpdate(longitude: number) {
        this.mapProject.center.longitude = longitude;
        this.dispatchCenterCoordinatesUpdate();
    }

    dispatchCenterCoordinatesUpdate() {
        this.store.dispatch(UiActions.updateCenterCoordinates({center: this.mapProject.center}));
    }

    dispatchFormatUpdate(format: PaperFormat) {
        if (format == PaperFormat.CUSTOM) {
            return;
        }
        let orientation = this.printAreaOrientation;
        let formatProperties = getPaperFormatProperties(format);
        this.mapProject.widthInMm = formatProperties.width(orientation);
        this.mapProject.heightInMm = formatProperties.height(orientation);
        this.dispatchSelectedAreaUpdate();
    }

    dispatchOrientationUpdate(orientation: PaperOrientation) {
        let width = this.mapProject.widthInMm;
        let height = this.mapProject.heightInMm;
        if (orientation == PaperOrientation.PORTRAIT) {
            this.mapProject.widthInMm = Math.min(width, height);
            this.mapProject.heightInMm = Math.max(width, height);
        } else {
            this.mapProject.widthInMm = Math.max(width, height);
            this.mapProject.heightInMm = Math.min(width, height);
        }
        this.dispatchSelectedAreaUpdate();
    }

    dispatchSelectedAreaWidthUpdate(width: number) {
        this.mapProject.widthInMm = width;
        this.dispatchSelectedAreaUpdate();
    }

    dispatchSelectedAreaHeightUpdate(height: number) {
        this.mapProject.heightInMm = height;
        this.dispatchSelectedAreaUpdate();
    }

    dispatchScaleUpdate(scale: s.Scale) {
        this.mapProject.scale = scale;
        this.dispatchSelectedAreaUpdate();
    }

    dispatchSelectedAreaUpdate() {
        let factor = s.getScaleProperties(this.mapProject.scale).reductionFactor / 1000;
        this.store.dispatch(UiActions.updateSelectedArea({
            widthInM: this.mapProject.widthInMm * factor,
            heightInM: this.mapProject.heightInMm * factor,
            scale: this.mapProject.scale
        }));
    }

    dispatchNameUpdate(name: string) {
        this.mapProject.name = name;
        this.store.dispatch(UiActions.updateMapName({
            name: name
        }));
    }

    dispatchFileFormatUpdate(fileFormat: FileFormat) {
        this.mapProject.options.fileFormat = fileFormat;
        this.dispatchMapOptionsUpdate();
    }

    dispatchMapStyleUpdate(mapStyle: MapStyle) {
        this.mapProject.options.mapStyle = mapStyle;
        this.dispatchMapOptionsUpdate();
    }

    dispatchMapOptionsUpdate() {
        this.store.dispatch(UiActions.updateMapOptions({
            options: this.mapProject.options
        }));
    }

    private registerIcons() {
        for (const mapProjectState of Object.values(MapProjectState)) {
            this.iconRegistry.addSvgIconInNamespace("map-project-state", mapProjectState,
                this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/map-project-state/${mapProjectState}.svg`));
        }
        this.iconRegistry.addSvgIconInNamespace("edition-state", "edited-locally",
            this.sanitizer.bypassSecurityTrustResourceUrl(`./assets/edition-state/edited-locally.svg`));
    }
}