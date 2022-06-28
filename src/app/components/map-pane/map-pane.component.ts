import {AfterViewInit, Component, ViewChild} from "@angular/core";
import {Store} from "@ngrx/store";
import {currentAdditionalGpxElements, currentMapProject} from "../../selectors/main.selectors";
import {Scale} from "../../model/intern/scale";
import * as UiActions from "../../actions/main.actions";
import * as L from "leaflet";
import {ConfigurationService} from "../../services/configuration.service";
import {MapComponent} from "../map/map.component";
import {AdditionalGpxElement} from "../../model/intern/additional-element";
import {MapProject} from "../../model/intern/map-project";
import {filter, withLatestFrom} from "rxjs/operators";
import {round} from "lodash";
import {Subject} from "rxjs";

@Component({
    selector: "app-map-pane",
    template: "<div fxFill style=\"margin-left: 10px;\"><app-map #map></app-map></div>"
})
export class MapPaneComponent implements AfterViewInit {

    @ViewChild("map") map: MapComponent;

    private currentMapProjectSelected: boolean;
    private topMarginInMm: number;
    private bottomMarginInMm: number;
    private leftMarginInMm: number;
    private rightMarginInMm: number;

    private scale$ = new Subject<Scale>();


    constructor(private readonly configurationService: ConfigurationService, private readonly store: Store) {
    }

    ngAfterViewInit() {
        this.store
            .select(currentMapProject)
            .subscribe(mapProject => mapProject ? this.mapProjectSelected(mapProject) : this.mapProjectDeselected());
        this.store
            .select(currentAdditionalGpxElements)
            .subscribe(additionalGpxElements => {
                this.updateGpxTracks(additionalGpxElements);
            });
        this.map.centerCoordinatesChange
            .pipe(filter(centerCoordinates => !!centerCoordinates))
            .subscribe((centerCoordinates: L.LatLng) =>
                this.store.dispatch(UiActions.updateCenterCoordinates({
                    latitude: centerCoordinates.lat,
                    longitude: centerCoordinates.lng
                }))
            );
        this.map.selectedAreaChange
            .pipe(
                withLatestFrom(this.scale$),
                filter(([selectedAreaInM, scale]) => !!scale && this.currentMapProjectSelected && !!selectedAreaInM)
            )
            .subscribe(([selectedAreaInM, scale]) => {
                let factor = scale / 1000;
                    this.store.dispatch(UiActions.updateSelectedArea({
                        widthInMm: round(selectedAreaInM.width / factor),
                        heightInMm: round(selectedAreaInM.height / factor),
                        topMarginInMm: this.topMarginInMm,
                        bottomMarginInMm: this.bottomMarginInMm,
                        leftMarginInMm: this.leftMarginInMm,
                        rightMarginInMm: this.rightMarginInMm,
                        scale: scale
                    }));
                }
            );
    }

    private mapProjectSelected(mapProject: MapProject) {
        this.map.centerCoordinates = L.latLng(mapProject.center.latitude, mapProject.center.longitude);
        this.scale$.next(mapProject.scale);
        this.map.reductionFactor = mapProject.scale;
        let factor = this.map.reductionFactor / 1000;
        this.map.enableAreaSelection = true;
        this.map.selectedArea = {
            width: (mapProject.widthInMm - mapProject.leftMarginInMm - mapProject.rightMarginInMm) * factor,
            height: (mapProject.heightInMm - mapProject.topMarginInMm - mapProject.bottomMarginInMm) * factor
        };
        this.topMarginInMm = mapProject.topMarginInMm;
        this.bottomMarginInMm = mapProject.bottomMarginInMm;
        this.leftMarginInMm = mapProject.leftMarginInMm;
        this.rightMarginInMm = mapProject.rightMarginInMm;
        this.currentMapProjectSelected = true;
    }

    private mapProjectDeselected() {
        this.currentMapProjectSelected = false;
        if (!this.map.centerCoordinates) {
            let defaultCoordinates = this.configurationService.appConf.defaultCoordinates;
            this.map.centerCoordinates = L.latLng(defaultCoordinates.latitude, defaultCoordinates.longitude);
        }
        this.scale$.next();
        this.map.reductionFactor = undefined;
        this.map.enableAreaSelection = false;
        this.map.selectedArea = undefined;
        this.topMarginInMm = undefined;
        this.bottomMarginInMm = undefined;
        this.leftMarginInMm = undefined;
        this.rightMarginInMm = undefined;
    }

    private updateGpxTracks(additionalGpxElements: AdditionalGpxElement[]) {
        this.map.gpxTracks =
            additionalGpxElements
                .filter(additionalGpxElement => additionalGpxElement.file?.data)
                .map(additionalGpxElement => ({
                    id: additionalGpxElement.id,
                    data: additionalGpxElement.file.data,
                    style: {
                        weight: additionalGpxElement.style.lineWidth,
                        color: additionalGpxElement.style.lineColor.rgbHexValue,
                        opacity: additionalGpxElement.style.lineColor.opacity
                    },
                    lastModified: new Date(additionalGpxElement.file.modified)
                }));
    }
}