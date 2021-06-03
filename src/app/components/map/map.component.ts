import {AfterViewInit, Component, EventEmitter, Input, Output} from "@angular/core";
import {Store} from "@ngrx/store";
import {Geodesic} from "geographiclib";
import * as L from "leaflet";
import "@lweller/leaflet-areaselect";
import {isEqual} from "lodash";
import {combineLatest, fromEvent, merge, of, ReplaySubject, Subject, Subscription} from "rxjs";
import {
    bufferCount,
    distinctUntilChanged,
    filter,
    finalize,
    map,
    skip,
    switchMap,
    takeUntil,
    tap
} from "rxjs/operators";
import {Subjectize} from "subjectize";
import * as UiActions from "../../actions/main.actions";
import {currentMapProject} from "../../model/intern/printmaps-ui-state";
import {environment} from "../../../environments/environment";
import {getScaleProperties, Scale} from "../../model/intern/scale";

@Component({
    selector: "app-map",
    template: "<div id=\"map\"></div>",
    styles: ["#map { height: 100%;    width: 100%;}"]
})
export class MapComponent implements AfterViewInit {

    @Input() active: boolean;
    @Subjectize("active") active$ = new ReplaySubject(1);

    @Input() centerCoordinates: L.LatLng;
    @Subjectize("centerCoordinates") centerCoordinates$ = new ReplaySubject<L.LatLng>(1);
    @Output() centerCoordinatesChange = new EventEmitter<L.LatLng>();

    @Input() selectedArea: L.Dimension;
    @Subjectize("selectedArea") selectedArea$ = new ReplaySubject<L.Dimension>(1);
    @Output() selectedAreaChange = new EventEmitter<L.Dimension>();

    @Input() scale: Scale;
    @Subjectize("scale") scale$ = new ReplaySubject<Scale>(1);

    constructor(private store: Store<any>) {
        this.bindToStore();
    }

    private bindToStore() {
        // TODO: refactor direct binding to store to make map component reusable
        this.store
            .select(currentMapProject)
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue))
            )
            .subscribe(nextCurrentMapProject => {
                if (nextCurrentMapProject) {
                    this.centerCoordinates = L.latLng(nextCurrentMapProject.center.latitude, nextCurrentMapProject.center.longitude);
                    let factor = getScaleProperties(nextCurrentMapProject.scale).reductionFactor / 1000;
                    this.selectedArea = {
                        width: nextCurrentMapProject.widthInMm * factor,
                        height: nextCurrentMapProject.heightInMm * factor
                    };
                    this.scale = nextCurrentMapProject.scale;
                    this.active = true;
                } else {
                    this.active = false;
                    if (!this.centerCoordinates) {
                        this.centerCoordinates =
                            L.latLng(environment.defaultCoordinates.latitude, environment.defaultCoordinates.longitude);
                    }
                    this.selectedArea = undefined;
                    this.scale = undefined;
                }
            });
        this.centerCoordinatesChange
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue))
            )
            .subscribe(nextCenterCoordinates => this.store.dispatch(
                UiActions.updateCenterCoordinates({
                    latitude: nextCenterCoordinates.lat,
                    longitude: nextCenterCoordinates.lng
                })
            ));
        this.selectedAreaChange
            .pipe(
                distinctUntilChanged((previousValue, nextValue) =>
                    isEqual(previousValue, nextValue))
            )
            .subscribe(nextSelectedAreaInM => this.store.dispatch(
                UiActions.updateSelectedArea({
                    widthInM: nextSelectedAreaInM.width,
                    heightInM: nextSelectedAreaInM.height,
                    scale: this.scale
                })
            ));
    }

    private static addOsmLayer(mapHandler: L.Map) {
        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors |" +
                    " Rendering powered by <a href=\"http://printmaps-osm.de\">printmaps-osm.de (Klaus Tockloth)</a>"
            }
        ).addTo(mapHandler);
    }

    ngAfterViewInit(): void {
        let mapHandler = L.map("map", {zoom: 12});
        MapComponent.addOsmLayer(mapHandler);

        let areaSelectHandler;
        let areaSelectHandlerSubscriptions = [];
        this.active$.subscribe(active => {
            if (active) {
                if (!areaSelectHandler) {
                    areaSelectHandler = L.areaSelect({keepAspectRatio: true});
                    areaSelectHandler.addTo(mapHandler);
                    areaSelectHandlerSubscriptions = this.handleSelectedAreaUpdate(mapHandler, areaSelectHandler);
                }
            } else {
                if (areaSelectHandler) {
                    areaSelectHandler.remove();
                }
                for (let areaSelectHandlerSubscription of areaSelectHandlerSubscriptions) {
                    areaSelectHandlerSubscription.unsubscribe();
                }
                areaSelectHandler = undefined;
                areaSelectHandlerSubscriptions = [];
            }
        });

        this.handleCenterCoordinatesUpdate(mapHandler);
    }

    private handleCenterCoordinatesUpdate(mapHandler: L.Map) {
        let endSyncModelToMap = new Subject();
        let startSyncModelToMap = new Subject();
        this.syncModelToMap(mapHandler, startSyncModelToMap, endSyncModelToMap);
        this.syncMapToModel(mapHandler, startSyncModelToMap, endSyncModelToMap);
    }

    private syncModelToMap(mapHandler: L.Map, startSyncModelToMap: Subject<any>, endSyncModelToMap: Subject<any>) {
        startSyncModelToMap
            .pipe(switchMap(() => this.centerCoordinates$
                    .pipe(
                        skip(1),
                        takeUntil(endSyncModelToMap),
                        distinctUntilChanged((previousValue, nextValue) =>
                            isEqual(previousValue, nextValue))
                    )
                )
            )
            .subscribe(nextMapCenter => mapHandler.panTo(nextMapCenter, {noMoveStart: true}));
        startSyncModelToMap.next();
        this.centerCoordinates$.next(this.centerCoordinates);
    }

    private syncMapToModel(mapHandler: L.Map, startSyncModelToMap: Subject<any>, endSyncModelToMap: Subject<any>) {
        fromEvent(mapHandler, "movestart")
            .pipe(
                tap(() => endSyncModelToMap.next()),
                switchMap(() => fromEvent(mapHandler, "move")
                    .pipe(
                        takeUntil(fromEvent(mapHandler, "moveend").pipe(bufferCount(1))),
                        finalize(() => startSyncModelToMap.next())
                    )
                ),
                map(event => (event as L.LeafletEvent).target.getCenter())
            )
            .subscribe(nextCenterCoordinates => {
                if (!isEqual(this.centerCoordinates, nextCenterCoordinates)) {
                    this.centerCoordinates = nextCenterCoordinates;
                    this.centerCoordinatesChange.emit(nextCenterCoordinates);
                }
            });
    }

    private handleSelectedAreaUpdate(mapHandler: L.Map, areaSelectHandler: L.AreaSelect): Subscription[] {
        return [
            this.syncModelToAreaSelect(mapHandler, areaSelectHandler),
            this.syncAreaSelectToModel(areaSelectHandler, mapHandler)
        ];
    }

    private static convertRealWidthToPixels(mapHandler: L.Map, realWidthInM: number): number {
        let center = mapHandler.getCenter();
        let west = MapComponent.moveCoordinate(center, realWidthInM / 2, 90);
        let east = MapComponent.moveCoordinate(center, realWidthInM / 2, 270);
        return Math.floor(Math.abs(mapHandler.project(west).x - mapHandler.project(east).x));
    }

    private static convertRealHeightToPixels(mapHandler: L.Map, realHeightInM: number): number {
        let center = mapHandler.getCenter();
        let north = MapComponent.moveCoordinate(center, realHeightInM / 2, 0);
        let south = MapComponent.moveCoordinate(center, realHeightInM / 2, 180);
        return Math.floor(Math.abs(mapHandler.project(north).y - mapHandler.project(south).y));
    }

    private static moveCoordinate(origin: L.LatLng, distanceInM: number, azimuth: number): L.LatLng {
        // noinspection TypeScriptValidateJSTypes
        let result = Geodesic.WGS84.Direct(origin.lat, origin.lng, azimuth, distanceInM);
        return L.latLng(result.lat2, result.lon2);
    }

    private static convertPixelWidthToRealLength(mapHandler: L.Map, widthInPixel: number): number {
        let centerInPixel = mapHandler.project(mapHandler.getCenter());
        let halfWidth = widthInPixel / 2;
        let west = mapHandler.unproject(L.point(centerInPixel.x - halfWidth, centerInPixel.y));
        let east = mapHandler.unproject(L.point(centerInPixel.x + halfWidth, centerInPixel.y));
        return Geodesic.WGS84.Inverse(west.lat, west.lng, east.lat, east.lng).s12;
    }

    private static convertPixelHeightToRealLength(mapHandler: L.Map, heightInPixel: number): number {
        let centerInPixel = mapHandler.project(mapHandler.getCenter());
        let halfHeight = heightInPixel / 2;
        let south = mapHandler.unproject(L.point(centerInPixel.x, centerInPixel.y - halfHeight));
        let north = mapHandler.unproject(L.point(centerInPixel.x, centerInPixel.y + halfHeight));
        return Geodesic.WGS84.Inverse(south.lat, south.lng, north.lat, north.lng).s12;
    }

    private syncAreaSelectToModel(areaSelectHandler: L.AreaSelect, mapHandler: L.Map): Subscription {
        return combineLatest([
                this.active$,
                fromEvent(mapHandler, "move"),
                this.scale$,
                fromEvent(areaSelectHandler, "resize")
            ]
        )
            .pipe(
                filter(([active]) => !!active),
                map(([_, leafletEvent, scale]) =>
                    [
                        leafletEvent,
                        scale,
                        areaSelectHandler.getDimensions()
                    ] as [L.LeafletEvent, Scale, L.Dimension]),
                map(([leafletEvent, scale, areaSelectDimensionInPx]) =>
                    [
                        {
                            width: MapComponent.convertPixelWidthToRealLength(leafletEvent.target, areaSelectDimensionInPx.width),
                            height: MapComponent.convertPixelHeightToRealLength(leafletEvent.target, areaSelectDimensionInPx.height)
                        },
                        areaSelectDimensionInPx,
                        scale
                    ] as [L.Dimension, L.Dimension, Scale]
                ),
                filter(([selectedAreaInM, areaSelectDimensionInPx, scale]) => {
                    let selectedAreaPrecision = getScaleProperties(scale).reductionFactor / 1000;
                        return (Math.abs(selectedAreaInM.width - this.selectedArea.width) / selectedAreaPrecision >
                            Math.pow(10, Math.ceil(Math.log10(selectedAreaInM.width / selectedAreaPrecision / areaSelectDimensionInPx.width)))) ||
                            (Math.abs(selectedAreaInM.height - this.selectedArea.height) / selectedAreaPrecision >
                                Math.pow(10, Math.ceil(Math.log10(selectedAreaInM.height / selectedAreaPrecision / areaSelectDimensionInPx.height))));
                    }
                ),
                map(([selectedAreaInM]) => selectedAreaInM)
            )
            .subscribe(nextSelectedAreaInM => {
                this.selectedArea = nextSelectedAreaInM;
                this.selectedAreaChange.emit(nextSelectedAreaInM);
            });
    }

    private syncModelToAreaSelect(mapHandler: L.Map, areaSelectHandler: L.AreaSelect): Subscription {
        return combineLatest([
                this.active$,
                merge(of({target: mapHandler}), fromEvent(mapHandler, "move")),
                this.selectedArea$
            ]
        )
            .pipe(
                filter(([active]) => !!active),
                map(([_, leafletEvent, selectedAreaInM]) =>
                    [leafletEvent, selectedAreaInM] as [L.LeafletEvent, L.Dimension]),
                map(
                    ([leafletEvent, selectedAreaInM]) => ({
                        width: MapComponent.convertRealWidthToPixels(leafletEvent.target, selectedAreaInM.width),
                        height: MapComponent.convertRealHeightToPixels(leafletEvent.target, selectedAreaInM.height)
                    })
                )
            )
            .subscribe(nextAreaSelectDimensionInPx => areaSelectHandler.setDimensions(nextAreaSelectDimensionInPx));
    }
}